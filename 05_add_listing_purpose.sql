-- Add listing_purpose to buyers_demand
ALTER TABLE public.buyers_demand 
ADD COLUMN IF NOT EXISTS listing_purpose VARCHAR(50) DEFAULT 'buy' NOT NULL;

-- Add listing_purpose to sellers_inventory
ALTER TABLE public.sellers_inventory 
ADD COLUMN IF NOT EXISTS listing_purpose VARCHAR(50) DEFAULT 'sell' NOT NULL;

-- Update the system_settings if we need to track any specific values in the future, 
-- but hardcoding 'buy' / 'sell' / 'rent' is usually fine for core structural logic.
