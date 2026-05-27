-- ==========================================
-- MIGRATION: ADD CUSTOMER PORTALS & WATCHLISTS
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Add user_id to existing tables
ALTER TABLE public.buyers_demand
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.sellers_inventory
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create buyer_watchlists table
CREATE TABLE IF NOT EXISTS public.buyer_watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.sellers_inventory(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_property UNIQUE (user_id, property_id)
);

-- 3. Enable RLS on buyer_watchlists
ALTER TABLE public.buyer_watchlists ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for user_id on buyers_demand
DROP POLICY IF EXISTS "Allow users to view their own buyer demands" ON public.buyers_demand;
CREATE POLICY "Allow users to view their own buyer demands"
    ON public.buyers_demand FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own buyer demands" ON public.buyers_demand;
CREATE POLICY "Allow users to update their own buyer demands"
    ON public.buyers_demand FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. RLS Policies for user_id on sellers_inventory
DROP POLICY IF EXISTS "Allow users to view their own seller inventory" ON public.sellers_inventory;
CREATE POLICY "Allow users to view their own seller inventory"
    ON public.sellers_inventory FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own seller inventory" ON public.sellers_inventory;
CREATE POLICY "Allow users to update their own seller inventory"
    ON public.sellers_inventory FOR UPDATE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for buyer_watchlists
DROP POLICY IF EXISTS "Allow users to manage their own watchlists" ON public.buyer_watchlists;
CREATE POLICY "Allow users to manage their own watchlists"
    ON public.buyer_watchlists FOR ALL
    USING (auth.uid() = user_id);

-- Update the main schema.sql file as well if we were keeping it in sync, but this migration handles the DB side for now.
