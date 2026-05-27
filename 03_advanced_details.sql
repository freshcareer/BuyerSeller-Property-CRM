-- ==========================================
-- PHASE 3: ADVANCED PROPERTY DETAILS
-- ==========================================

-- Add new columns to sellers_inventory
ALTER TABLE public.sellers_inventory 
ADD COLUMN IF NOT EXISTS bedrooms VARCHAR(50),
ADD COLUMN IF NOT EXISTS bathrooms VARCHAR(50),
ADD COLUMN IF NOT EXISTS builtup_area VARCHAR(100),
ADD COLUMN IF NOT EXISTS additional_spaces VARCHAR(255),
ADD COLUMN IF NOT EXISTS possession_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS facing VARCHAR(100),
ADD COLUMN IF NOT EXISTS parking VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags VARCHAR(255),
ADD COLUMN IF NOT EXISTS furnishing VARCHAR(100),
ADD COLUMN IF NOT EXISTS balconies VARCHAR(50),
ADD COLUMN IF NOT EXISTS property_age VARCHAR(100);

-- Add new columns to buyers_demand
ALTER TABLE public.buyers_demand 
ADD COLUMN IF NOT EXISTS bedrooms VARCHAR(50),
ADD COLUMN IF NOT EXISTS bathrooms VARCHAR(50),
ADD COLUMN IF NOT EXISTS builtup_area VARCHAR(100),
ADD COLUMN IF NOT EXISTS additional_spaces VARCHAR(255),
ADD COLUMN IF NOT EXISTS possession_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS facing VARCHAR(100),
ADD COLUMN IF NOT EXISTS parking VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags VARCHAR(255),
ADD COLUMN IF NOT EXISTS furnishing VARCHAR(100),
ADD COLUMN IF NOT EXISTS balconies VARCHAR(50),
ADD COLUMN IF NOT EXISTS property_age VARCHAR(100);

-- Seed Bedrooms
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('bedrooms', '1', '1 Bedroom', 1),
('bedrooms', '2', '2 Bedrooms', 2),
('bedrooms', '3', '3 Bedrooms', 3),
('bedrooms', '4', '4 Bedrooms', 4),
('bedrooms', '5', '5 Bedrooms', 5),
('bedrooms', '5_plus', '5+ Bedrooms', 6)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Bathrooms
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('bathrooms', '1', '1 Bathroom', 1),
('bathrooms', '2', '2 Bathrooms', 2),
('bathrooms', '3', '3 Bathrooms', 3),
('bathrooms', '4', '4 Bathrooms', 4),
('bathrooms', '5_plus', '5+ Bathrooms', 5)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Facing
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('facing', 'east', 'East Facing', 1),
('facing', 'west', 'West Facing', 2),
('facing', 'north', 'North Facing', 3),
('facing', 'south', 'South Facing', 4),
('facing', 'north_east', 'North-East Facing', 5),
('facing', 'road_view', 'Road View', 6)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Possession Status
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('possession_status', 'ready_to_move', 'Ready To Move', 1),
('possession_status', 'under_construction', 'Under Construction', 2),
('possession_status', 'new_launch', 'New Launch', 3)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Furnishing
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('furnishing', 'unfurnished', 'Unfurnished', 1),
('furnishing', 'semi_furnished', 'Semi-Furnished', 2),
('furnishing', 'fully_furnished', 'Fully Furnished', 3)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Balconies
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('balconies', '1', '1 Balcony', 1),
('balconies', '2', '2 Balconies', 2),
('balconies', '3', '3 Balconies', 3),
('balconies', '4_plus', '4+ Balconies', 4)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Property Age
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('property_age', 'new_construction', 'New Construction', 1),
('property_age', '1_to_5_years', '1 to 5 Years Old', 2),
('property_age', '5_to_10_years', '5 to 10 Years Old', 3),
('property_age', '10_plus_years', '10+ Years Old', 4)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;
