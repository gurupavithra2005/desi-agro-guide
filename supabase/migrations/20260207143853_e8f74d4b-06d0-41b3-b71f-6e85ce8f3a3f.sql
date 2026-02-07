-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('farmer', 'officer', 'admin');

-- Create app_language enum for supported languages
CREATE TYPE public.app_language AS ENUM ('en', 'hi', 'ta', 'te', 'kn', 'bn', 'pa', 'mr');

-- Create land_type enum
CREATE TYPE public.land_type AS ENUM ('dry', 'wet', 'garden');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    preferred_language app_language DEFAULT 'en',
    village TEXT,
    district TEXT,
    state TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    land_size_acres DECIMAL(10, 2),
    land_type land_type,
    irrigation_type TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'farmer',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Create crops reference table
CREATE TABLE public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_hi TEXT,
    name_ta TEXT,
    name_te TEXT,
    name_kn TEXT,
    name_bn TEXT,
    name_pa TEXT,
    name_mr TEXT,
    scientific_name TEXT,
    category TEXT,
    season TEXT[],
    suitable_land_types land_type[],
    water_requirement TEXT,
    growth_duration_days INTEGER,
    icon_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create farmer_fields table
CREATE TABLE public.farmer_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    land_type land_type,
    area_acres DECIMAL(10, 2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    soil_type TEXT,
    irrigation_type TEXT,
    current_crop_id UUID REFERENCES public.crops(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create soil_tests table
CREATE TABLE public.soil_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES public.farmer_fields(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nitrogen_kg_per_ha DECIMAL(10, 2),
    phosphorus_kg_per_ha DECIMAL(10, 2),
    potassium_kg_per_ha DECIMAL(10, 2),
    ph_level DECIMAL(4, 2),
    organic_carbon_percent DECIMAL(5, 2),
    test_date DATE DEFAULT CURRENT_DATE,
    report_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- weather, market, pest, scheme, general
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = _user_id
    ORDER BY 
        CASE role 
            WHEN 'admin' THEN 1 
            WHEN 'officer' THEN 2 
            WHEN 'farmer' THEN 3 
        END
    LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and officers can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'officer')
    );

-- User roles policies
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Crops policies (public read, admin write)
CREATE POLICY "Anyone can view crops"
    ON public.crops FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage crops"
    ON public.crops FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Farmer fields policies
CREATE POLICY "Users can view their own fields"
    ON public.farmer_fields FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own fields"
    ON public.farmer_fields FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Officers and admins can view all fields"
    ON public.farmer_fields FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        public.has_role(auth.uid(), 'officer')
    );

-- Soil tests policies
CREATE POLICY "Users can view their own soil tests"
    ON public.soil_tests FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own soil tests"
    ON public.soil_tests FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Trigger to create profile and assign farmer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, phone_number)
    VALUES (NEW.id, NEW.phone);
    
    -- Assign default farmer role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'farmer');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farmer_fields_updated_at
    BEFORE UPDATE ON public.farmer_fields
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();