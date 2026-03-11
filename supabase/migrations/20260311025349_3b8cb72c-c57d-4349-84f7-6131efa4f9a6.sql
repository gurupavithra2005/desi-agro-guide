
-- Convert access-granting policies from RESTRICTIVE to PERMISSIVE
-- Strategy: Drop RESTRICTIVE policy, recreate as PERMISSIVE (same definition)

-- ============ crops ============
DROP POLICY IF EXISTS "Anyone can view crops" ON public.crops;
CREATE POLICY "Anyone can view crops" ON public.crops FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage crops" ON public.crops;
CREATE POLICY "Admins can manage crops" ON public.crops FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Keep admin/officer view as RESTRICTIVE on top (but they also need permissive access)
DROP POLICY IF EXISTS "Admins and officers can view all profiles" ON public.profiles;
CREATE POLICY "Admins and officers can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role));

-- ============ ai_chat_history ============
DROP POLICY IF EXISTS "Users can manage own chat" ON public.ai_chat_history;
CREATE POLICY "Users can manage own chat" ON public.ai_chat_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ market_prices ============
DROP POLICY IF EXISTS "Anyone can view market prices" ON public.market_prices;
CREATE POLICY "Anyone can view market prices" ON public.market_prices FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage market prices" ON public.market_prices;
CREATE POLICY "Admins can manage market prices" ON public.market_prices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ soil_tests ============
DROP POLICY IF EXISTS "Users can manage their own soil tests" ON public.soil_tests;
CREATE POLICY "Users can manage their own soil tests" ON public.soil_tests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own soil tests" ON public.soil_tests;
CREATE POLICY "Users can view their own soil tests" ON public.soil_tests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ fertilizer_recommendations ============
DROP POLICY IF EXISTS "Anyone can view fertilizer recommendations" ON public.fertilizer_recommendations;
CREATE POLICY "Anyone can view fertilizer recommendations" ON public.fertilizer_recommendations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage fertilizer recommendations" ON public.fertilizer_recommendations;
CREATE POLICY "Admins can manage fertilizer recommendations" ON public.fertilizer_recommendations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ forum_posts ============
DROP POLICY IF EXISTS "Anyone can view posts" ON public.forum_posts;
CREATE POLICY "Anyone can view posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON public.forum_posts;
CREATE POLICY "Users can create posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.forum_posts;
CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.forum_posts;
CREATE POLICY "Users can delete own posts" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ forum_replies ============
DROP POLICY IF EXISTS "Anyone can view replies" ON public.forum_replies;
CREATE POLICY "Anyone can view replies" ON public.forum_replies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create replies" ON public.forum_replies;
CREATE POLICY "Users can create replies" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own replies" ON public.forum_replies;
CREATE POLICY "Users can update own replies" ON public.forum_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own replies" ON public.forum_replies;
CREATE POLICY "Users can delete own replies" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ forum_upvotes ============
DROP POLICY IF EXISTS "Users can manage own upvotes" ON public.forum_upvotes;
CREATE POLICY "Users can manage own upvotes" ON public.forum_upvotes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ crop_calendar_events ============
DROP POLICY IF EXISTS "Users can manage own calendar" ON public.crop_calendar_events;
CREATE POLICY "Users can manage own calendar" ON public.crop_calendar_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ farmer_fields ============
DROP POLICY IF EXISTS "Users can manage their own fields" ON public.farmer_fields;
CREATE POLICY "Users can manage their own fields" ON public.farmer_fields FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own fields" ON public.farmer_fields;
CREATE POLICY "Users can view their own fields" ON public.farmer_fields FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Officers and admins can view all fields" ON public.farmer_fields;
CREATE POLICY "Officers and admins can view all fields" ON public.farmer_fields FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'officer'::app_role));

-- ============ government_schemes ============
DROP POLICY IF EXISTS "Anyone can view schemes" ON public.government_schemes;
CREATE POLICY "Anyone can view schemes" ON public.government_schemes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage schemes" ON public.government_schemes;
CREATE POLICY "Admins can manage schemes" ON public.government_schemes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ notifications ============
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============ price_alerts ============
DROP POLICY IF EXISTS "Users can manage own alerts" ON public.price_alerts;
CREATE POLICY "Users can manage own alerts" ON public.price_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ pest_detections ============
DROP POLICY IF EXISTS "Users can manage own detections" ON public.pest_detections;
CREATE POLICY "Users can manage own detections" ON public.pest_detections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Officers can view all detections" ON public.pest_detections;
CREATE POLICY "Officers can view all detections" ON public.pest_detections FOR SELECT TO authenticated USING (has_role(auth.uid(), 'officer'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ============ user_roles ============
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
