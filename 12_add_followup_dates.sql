-- Add next_follow_up date to buyers and sellers tables

-- Add column to buyers_demand
ALTER TABLE public.buyers_demand
ADD COLUMN IF NOT EXISTS next_follow_up DATE NULL;

-- Add column to sellers_inventory
ALTER TABLE public.sellers_inventory
ADD COLUMN IF NOT EXISTS next_follow_up DATE NULL;
