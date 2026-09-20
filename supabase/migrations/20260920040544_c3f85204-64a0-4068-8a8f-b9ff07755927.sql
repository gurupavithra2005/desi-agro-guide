-- 1. Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;

-- 2. Forum replies: prevent officer impersonation
DROP POLICY IF EXISTS "Users can create replies" ON public.forum_replies;
CREATE POLICY "Users can create replies"
ON public.forum_replies FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND upvotes = 0
  AND is_best_answer = false
  AND (
    is_officer_reply = false
    OR public.has_role(auth.uid(), 'officer'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- 3. Prevent users from tampering with privileged/derived columns on update
CREATE OR REPLACE FUNCTION public.protect_forum_post_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'officer'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.upvotes := OLD.upvotes;
  NEW.views := OLD.views;
  NEW.is_pinned := OLD.is_pinned;
  NEW.is_answered := OLD.is_answered;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_forum_post_fields ON public.forum_posts;
CREATE TRIGGER protect_forum_post_fields
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION public.protect_forum_post_fields();

CREATE OR REPLACE FUNCTION public.protect_forum_reply_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'officer'::public.app_role) THEN
    RETURN NEW;
  END IF;
  NEW.upvotes := OLD.upvotes;
  NEW.is_best_answer := OLD.is_best_answer;
  NEW.is_officer_reply := OLD.is_officer_reply;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_forum_reply_fields ON public.forum_replies;
CREATE TRIGGER protect_forum_reply_fields
BEFORE UPDATE ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION public.protect_forum_reply_fields();

REVOKE EXECUTE ON FUNCTION public.protect_forum_post_fields() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.protect_forum_reply_fields() FROM anon, authenticated, public;

-- 4. Maintain upvote counts server-side from forum_upvotes
CREATE OR REPLACE FUNCTION public.sync_forum_upvotes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.forum_posts SET upvotes = GREATEST(COALESCE(upvotes, 0) + 1, 0) WHERE id = NEW.post_id;
    END IF;
    IF NEW.reply_id IS NOT NULL THEN
      UPDATE public.forum_replies SET upvotes = GREATEST(COALESCE(upvotes, 0) + 1, 0) WHERE id = NEW.reply_id;
    END IF;
    RETURN NEW;
  ELSE
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.forum_posts SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0) WHERE id = OLD.post_id;
    END IF;
    IF OLD.reply_id IS NOT NULL THEN
      UPDATE public.forum_replies SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0) WHERE id = OLD.reply_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS sync_forum_upvotes_ins ON public.forum_upvotes;
CREATE TRIGGER sync_forum_upvotes_ins
AFTER INSERT ON public.forum_upvotes
FOR EACH ROW EXECUTE FUNCTION public.sync_forum_upvotes();

DROP TRIGGER IF EXISTS sync_forum_upvotes_del ON public.forum_upvotes;
CREATE TRIGGER sync_forum_upvotes_del
AFTER DELETE ON public.forum_upvotes
FOR EACH ROW EXECUTE FUNCTION public.sync_forum_upvotes();

REVOKE EXECUTE ON FUNCTION public.sync_forum_upvotes() FROM anon, authenticated, public;

-- 5. Notifications: explicit owner-scoped insert/delete rules
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 6. Pest detections: explicit owner-scoped delete, officers stay read-only
DROP POLICY IF EXISTS "Users can delete own detections" ON public.pest_detections;
CREATE POLICY "Users can delete own detections"
ON public.pest_detections FOR DELETE TO authenticated
USING (auth.uid() = user_id);