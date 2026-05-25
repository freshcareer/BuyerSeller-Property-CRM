-- ==========================================
-- BUYER-SELLER PROPERTY CRM DATABASE SCHEMA
-- ==========================================

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_super_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- 2. System Settings Table (Dynamic Form Dropdowns)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'property_type', 'city_area', 'budget_range', 'lead_status'
    value VARCHAR(100) NOT NULL, -- Database value/identifier
    display_name VARCHAR(100) NOT NULL, -- Frontend human-readable name
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_category_value UNIQUE (category, value)
);

-- Enable RLS on System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anon) to read dropdown settings
DROP POLICY IF EXISTS "Allow public read-only access to system_settings" ON public.system_settings;
CREATE POLICY "Allow public read-only access to system_settings"
    ON public.system_settings FOR SELECT
    USING (true);

-- Allow only Super Admins to modify system settings
DROP POLICY IF EXISTS "Allow super admin modify system_settings" ON public.system_settings;
CREATE POLICY "Allow super admin modify system_settings"
    ON public.system_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
        )
    );

-- 3. Buyers Demand Table
CREATE TABLE IF NOT EXISTS public.buyers_demand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    property_type VARCHAR(100) NOT NULL,  -- value from system_settings where category='property_type'
    state VARCHAR(100) NOT NULL,          -- e.g. 'gujarat'
    city VARCHAR(100) NOT NULL,           -- e.g. 'ahmedabad'
    area VARCHAR(200) NOT NULL,           -- full location string e.g. 'Bopal, Ahmedabad, Gujarat'
    budget VARCHAR(100) NOT NULL,         -- value from system_settings where category='budget_range'
    status VARCHAR(50) DEFAULT 'New Lead' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Buyers Demand
ALTER TABLE public.buyers_demand ENABLE ROW LEVEL SECURITY;

-- Allow public frontend to insert new demands/leads
DROP POLICY IF EXISTS "Allow public inserts for buyers_demand" ON public.buyers_demand;
CREATE POLICY "Allow public inserts for buyers_demand"
    ON public.buyers_demand FOR INSERT
    WITH CHECK (true);

-- Allow only Super Admins to select, update, or delete buyers demand
DROP POLICY IF EXISTS "Allow super admin full control on buyers_demand" ON public.buyers_demand;
CREATE POLICY "Allow super admin full control on buyers_demand"
    ON public.buyers_demand FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
        )
    );

-- 4. Sellers Inventory Table
CREATE TABLE IF NOT EXISTS public.sellers_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    property_type VARCHAR(100) NOT NULL,  -- value from system_settings where category='property_type'
    state VARCHAR(100) NOT NULL,          -- e.g. 'gujarat'
    city VARCHAR(100) NOT NULL,           -- e.g. 'surat'
    area VARCHAR(200) NOT NULL,           -- full location string e.g. 'Adajan, Surat, Gujarat'
    price VARCHAR(100) NOT NULL,          -- value from system_settings where category='budget_range'
    status VARCHAR(50) DEFAULT 'New Lead' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Sellers Inventory
ALTER TABLE public.sellers_inventory ENABLE ROW LEVEL SECURITY;

-- Allow public frontend to insert new inventory/leads
DROP POLICY IF EXISTS "Allow public inserts for sellers_inventory" ON public.sellers_inventory;
CREATE POLICY "Allow public inserts for sellers_inventory"
    ON public.sellers_inventory FOR INSERT
    WITH CHECK (true);

-- Allow only Super Admins to select, update, or delete sellers inventory
DROP POLICY IF EXISTS "Allow super admin full control on sellers_inventory" ON public.sellers_inventory;
CREATE POLICY "Allow super admin full control on sellers_inventory"
    ON public.sellers_inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
        )
    );

-- ==========================================
-- TRIGGERS FOR USER REGISTRATION
-- ==========================================

-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_super_admin)
  VALUES (new.id, new.email, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA (DYNAMIC DROPDOWN OPTIONS)
-- ==========================================

-- Seed Property Types (India-specific)
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('property_type', 'apartment',        'Apartment / Flat',           1),
('property_type', 'villa',            'Villa / Bungalow',            2),
('property_type', 'row_house',        'Row House / Duplex',          3),
('property_type', 'plot',             'Residential Plot / NA Land',  4),
('property_type', 'commercial_shop',  'Commercial Shop',             5),
('property_type', 'office_space',     'Office Space',                6),
('property_type', 'warehouse',        'Warehouse / Godown',          7)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Ahmedabad Areas
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
-- West / SG Highway (Premium)
('city_area', 'satellite',     'Satellite',              1),
('city_area', 'prahlad_nagar', 'Prahlad Nagar',          2),
('city_area', 'bodakdev',      'Bodakdev',               3),
('city_area', 'vastrapur',     'Vastrapur',              4),
('city_area', 'thaltej',       'Thaltej',                5),
('city_area', 'bopal',         'Bopal',                  6),
('city_area', 'south_bopal',   'South Bopal (SoBo)',     7),
('city_area', 'ambli',         'Ambli',                  8),
('city_area', 'shela',         'Shela',                  9),
('city_area', 'sg_highway',    'S.G. Highway',           10),
-- North
('city_area', 'gota',          'Gota',                   11),
('city_area', 'chandkheda',    'Chandkheda',             12),
('city_area', 'motera',        'Motera',                 13),
('city_area', 'sabarmati',     'Sabarmati',              14),
('city_area', 'sola',          'Sola',                   15),
('city_area', 'ghatlodia',     'Ghatlodia',              16),
-- Central
('city_area', 'navrangpura',   'Navrangpura',            17),
('city_area', 'naranpura',     'Naranpura',              18),
('city_area', 'cg_road',       'C.G. Road',              19),
('city_area', 'paldi',         'Paldi',                  20),
('city_area', 'vejalpur',      'Vejalpur',               21),
-- South / East (Affordable)
('city_area', 'maninagar',     'Maninagar',              22),
('city_area', 'narol',         'Narol',                  23),
('city_area', 'vastral',       'Vastral',                24),
('city_area', 'nikol',         'Nikol',                  25),
('city_area', 'naroda',        'Naroda',                 26),
('city_area', 'vatva',         'Vatva',                  27),
('city_area', 'odhav',         'Odhav',                  28)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Budget / Price Ranges (INR - Indian Rupees)
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('budget_range', 'under_20l',   'Under ₹20 Lakh',          1),
('budget_range', '20l_40l',     '₹20 Lakh – ₹40 Lakh',    2),
('budget_range', '40l_60l',     '₹40 Lakh – ₹60 Lakh',    3),
('budget_range', '60l_80l',     '₹60 Lakh – ₹80 Lakh',    4),
('budget_range', '80l_1cr',     '₹80 Lakh – ₹1 Crore',    5),
('budget_range', '1cr_1_5cr',   '₹1 Crore – ₹1.5 Crore',  6),
('budget_range', '1_5cr_2cr',   '₹1.5 Crore – ₹2 Crore',  7),
('budget_range', '2cr_plus',    '₹2 Crore & Above',        8)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Lead Statuses
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('lead_status', 'new_lead', 'New Lead', 1),
('lead_status', 'contacted', 'Contacted / Pitching', 2),
('lead_status', 'follow_up', 'Follow-up Scheduled', 3),
('lead_status', 'site_visit', 'Site Visit Arranged', 4),
('lead_status', 'visit_done', 'Site Visit Completed', 5),
('lead_status', 'negotiation', 'Under Negotiation', 6),
('lead_status', 'closed_won', 'Closed Deal (Won)', 7),
('lead_status', 'closed_lost', 'Lost / Inactive', 8)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;
