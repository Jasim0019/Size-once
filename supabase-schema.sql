-- ============================================================================
-- SIZEONCE — SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase Project -> SQL Editor
-- Account: shaikjasim412@gmail.com
-- ============================================================================

-- 1. Universal User Size Profiles
CREATE TABLE IF NOT EXISTS public.user_size_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  height NUMERIC NOT NULL DEFAULT 170,
  chest NUMERIC NOT NULL DEFAULT 96,
  waist NUMERIC NOT NULL DEFAULT 82,
  shoulders NUMERIC NOT NULL DEFAULT 44,
  unit TEXT NOT NULL DEFAULT 'cm',
  connected_brands JSONB DEFAULT '["ZARA", "H&M", "BRAND C"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_size_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read & upsert with anon key
CREATE POLICY "Allow public read of profiles" 
  ON public.user_size_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Allow public upsert of profiles" 
  ON public.user_size_profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update of profiles" 
  ON public.user_size_profiles FOR UPDATE 
  USING (true);


-- 2. B2B Brand Demo Requests Table
CREATE TABLE IF NOT EXISTS public.brand_demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending_review',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.brand_demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert of brand demo requests" 
  ON public.brand_demo_requests FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read of brand demo requests" 
  ON public.brand_demo_requests FOR SELECT 
  USING (true);


-- 3. Consumer Shopper Waitlist Table
CREATE TABLE IF NOT EXISTS public.shopper_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.shopper_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert of waitlist" 
  ON public.shopper_waitlist FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read of waitlist" 
  ON public.shopper_waitlist FOR SELECT 
  USING (true);
