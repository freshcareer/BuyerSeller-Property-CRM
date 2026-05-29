-- Safely remove all leads, watchlists, and matches without destroying tables
-- Run this in the Supabase SQL editor to clear dummy data.

TRUNCATE TABLE public.buyer_watchlists CASCADE;
TRUNCATE TABLE public.seller_matches CASCADE;
TRUNCATE TABLE public.buyers_demand CASCADE;
TRUNCATE TABLE public.sellers_inventory CASCADE;

-- Reset identity sequences (optional, but good for starting fresh)
ALTER SEQUENCE buyer_watchlists_id_seq RESTART WITH 1;
ALTER SEQUENCE seller_matches_id_seq RESTART WITH 1;
