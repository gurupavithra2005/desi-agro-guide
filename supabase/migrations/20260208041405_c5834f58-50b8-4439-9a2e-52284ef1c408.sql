-- ===========================================
-- PHASE 2-6: Full Smart Crop Advisory System
-- ===========================================

-- Government Schemes table
CREATE TABLE public.government_schemes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    scheme_code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT,
    name_ta TEXT,
    name_te TEXT,
    name_kn TEXT,
    name_bn TEXT,
    name_pa TEXT,
    name_mr TEXT,
    description_en TEXT,
    description_hi TEXT,
    description_ta TEXT,
    description_te TEXT,
    description_kn TEXT,
    description_bn TEXT,
    description_pa TEXT,
    description_mr TEXT,
    scheme_type TEXT NOT NULL, -- 'central' or 'state'
    state TEXT, -- NULL for central schemes
    benefits TEXT,
    eligibility TEXT,
    how_to_apply TEXT,
    website_url TEXT,
    helpline TEXT,
    icon_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fertilizer recommendations knowledge base
CREATE TABLE public.fertilizer_recommendations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID REFERENCES public.crops(id),
    soil_type TEXT,
    growth_stage TEXT,
    n_recommendation_kg_per_ha NUMERIC,
    p_recommendation_kg_per_ha NUMERIC,
    k_recommendation_kg_per_ha NUMERIC,
    application_method TEXT,
    timing_days_after_sowing INTEGER,
    notes_en TEXT,
    notes_hi TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Market prices table
CREATE TABLE public.market_prices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    crop_id UUID REFERENCES public.crops(id),
    crop_name TEXT NOT NULL,
    market_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    min_price NUMERIC NOT NULL,
    max_price NUMERIC NOT NULL,
    modal_price NUMERIC NOT NULL,
    unit TEXT DEFAULT 'quintal',
    price_date DATE NOT NULL DEFAULT CURRENT_DATE,
    previous_price NUMERIC,
    change_percent NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price alerts for farmers
CREATE TABLE public.price_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    crop_name TEXT NOT NULL,
    target_price NUMERIC NOT NULL,
    alert_type TEXT NOT NULL DEFAULT 'above', -- 'above' or 'below'
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pest/Disease detection history
CREATE TABLE public.pest_detections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    field_id UUID REFERENCES public.farmer_fields(id),
    image_url TEXT,
    detected_pest TEXT,
    confidence_score NUMERIC,
    severity TEXT, -- 'low', 'medium', 'high', 'critical'
    treatment_recommendation TEXT,
    ai_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crop calendar events
CREATE TABLE public.crop_calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    field_id UUID REFERENCES public.farmer_fields(id),
    crop_id UUID REFERENCES public.crops(id),
    event_type TEXT NOT NULL, -- 'sowing', 'fertilizer', 'irrigation', 'pesticide', 'harvest'
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    reminder_days_before INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community forum posts
CREATE TABLE public.forum_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT, -- 'question', 'success_story', 'tip', 'discussion'
    crop_id UUID REFERENCES public.crops(id),
    image_urls TEXT[],
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Forum replies
CREATE TABLE public.forum_replies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT false,
    is_officer_reply BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Forum upvotes
CREATE TABLE public.forum_upvotes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT upvote_target CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);

-- AI chat history for voice assistant
CREATE TABLE public.ai_chat_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    is_voice_input BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Government schemes: public read
CREATE POLICY "Anyone can view schemes" ON public.government_schemes FOR SELECT USING (true);
CREATE POLICY "Admins can manage schemes" ON public.government_schemes FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Fertilizer recommendations: public read
CREATE POLICY "Anyone can view fertilizer recommendations" ON public.fertilizer_recommendations FOR SELECT USING (true);
CREATE POLICY "Admins can manage fertilizer recommendations" ON public.fertilizer_recommendations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Market prices: public read
CREATE POLICY "Anyone can view market prices" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Admins can manage market prices" ON public.market_prices FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Price alerts: user-specific
CREATE POLICY "Users can manage own alerts" ON public.price_alerts FOR ALL USING (auth.uid() = user_id);

-- Pest detections: user-specific
CREATE POLICY "Users can manage own detections" ON public.pest_detections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Officers can view all detections" ON public.pest_detections FOR SELECT USING (has_role(auth.uid(), 'officer') OR has_role(auth.uid(), 'admin'));

-- Crop calendar: user-specific
CREATE POLICY "Users can manage own calendar" ON public.crop_calendar_events FOR ALL USING (auth.uid() = user_id);

-- Forum posts: public read, user write
CREATE POLICY "Anyone can view posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.forum_posts FOR DELETE USING (auth.uid() = user_id);

-- Forum replies: public read, user write
CREATE POLICY "Anyone can view replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.forum_replies FOR DELETE USING (auth.uid() = user_id);

-- Forum upvotes: user-specific
CREATE POLICY "Users can manage own upvotes" ON public.forum_upvotes FOR ALL USING (auth.uid() = user_id);

-- AI chat: user-specific
CREATE POLICY "Users can manage own chat" ON public.ai_chat_history FOR ALL USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_forum_posts_updated_at
    BEFORE UPDATE ON public.forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_market_prices_date ON public.market_prices(price_date);
CREATE INDEX idx_market_prices_crop ON public.market_prices(crop_name);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX idx_crop_calendar_date ON public.crop_calendar_events(scheduled_date);
CREATE INDEX idx_ai_chat_session ON public.ai_chat_history(session_id);