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

-- 2. System Settings Table (Dynamic Form Dropdowns for Property Types, Budgets, Statuses)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'property_type', 'budget_range', 'lead_status'
    value VARCHAR(100) NOT NULL, -- Database value/identifier
    display_name VARCHAR(100) NOT NULL, -- Frontend human-readable name
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_category_value UNIQUE (category, value)
);

-- Enable RLS on System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access to system_settings" ON public.system_settings;
CREATE POLICY "Allow public read-only access to system_settings"
    ON public.system_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow super admin modify system_settings" ON public.system_settings;
CREATE POLICY "Allow super admin modify system_settings"
    ON public.system_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
        )
    );

-- 3. Dynamic Location Tables (State -> City -> Area)
CREATE TABLE IF NOT EXISTS public.states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_state_city UNIQUE (state_id, name)
);

CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_city_area UNIQUE (city_id, name)
);

-- Enable RLS for Location Tables
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- Select policies (Public)
DROP POLICY IF EXISTS "Allow public read access to states" ON public.states;
CREATE POLICY "Allow public read access to states" ON public.states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to cities" ON public.cities;
CREATE POLICY "Allow public read access to cities" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to areas" ON public.areas;
CREATE POLICY "Allow public read access to areas" ON public.areas FOR SELECT USING (true);

-- Write policies (Admin)
DROP POLICY IF EXISTS "Allow admin write to states" ON public.states;
CREATE POLICY "Allow admin write to states" ON public.states FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true)
);

DROP POLICY IF EXISTS "Allow admin write to cities" ON public.cities;
CREATE POLICY "Allow admin write to cities" ON public.cities FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true)
);

DROP POLICY IF EXISTS "Allow admin write to areas" ON public.areas;
CREATE POLICY "Allow admin write to areas" ON public.areas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true)
);

-- 4. Buyers Demand Table
CREATE TABLE IF NOT EXISTS public.buyers_demand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    property_type VARCHAR(100) NOT NULL,  -- value from system_settings where category='property_type'
    state VARCHAR(100) NOT NULL,          -- state name or id
    city VARCHAR(100) NOT NULL,           -- city name or id
    area VARCHAR(200) NOT NULL,           -- area name or full path
    budget VARCHAR(100) NOT NULL,         -- value from system_settings where category='budget_range'
    status VARCHAR(50) DEFAULT 'New Lead' NOT NULL,
    notes TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Buyers Demand
ALTER TABLE public.buyers_demand ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts for buyers_demand" ON public.buyers_demand;
CREATE POLICY "Allow public inserts for buyers_demand"
    ON public.buyers_demand FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow super admin full control on buyers_demand" ON public.buyers_demand;
CREATE POLICY "Allow super admin full control on buyers_demand"
    ON public.buyers_demand FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
        )
    );

-- 5. Sellers Inventory Table
CREATE TABLE IF NOT EXISTS public.sellers_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    property_type VARCHAR(100) NOT NULL,  -- value from system_settings where category='property_type'
    state VARCHAR(100) NOT NULL,          -- state name or id
    city VARCHAR(100) NOT NULL,           -- city name or id
    area VARCHAR(200) NOT NULL,           -- area name or full path
    price VARCHAR(100) NOT NULL,          -- value from system_settings where category='budget_range'
    status VARCHAR(50) DEFAULT 'New Lead' NOT NULL,
    notes TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Sellers Inventory
ALTER TABLE public.sellers_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts for sellers_inventory" ON public.sellers_inventory;
CREATE POLICY "Allow public inserts for sellers_inventory"
    ON public.sellers_inventory FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-only access to active sellers_inventory" ON public.sellers_inventory;
CREATE POLICY "Allow public read-only access to active sellers_inventory"
    ON public.sellers_inventory FOR SELECT
    USING (status IN ('new_lead', 'contacted'));

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

-- Seed Property Types (India-specific + PG/Guest Houses)
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('property_type', 'apartment',        'Apartment / Flat',           1),
('property_type', 'villa',            'Villa / Bungalow',            2),
('property_type', 'row_house',        'Row House / Duplex',          3),
('property_type', 'plot',             'Residential Plot / NA Land',  4),
('property_type', 'commercial_shop',  'Commercial Shop',             5),
('property_type', 'office_space',     'Office Space',                6),
('property_type', 'warehouse',        'Warehouse / Godown',          7),
('property_type', 'pg_guest_house',   'PG & Guest Houses',           8)
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
('budget_range', '2cr_5cr',     '₹2 Crore – ₹5 Crore',    8),
('budget_range', '5cr_plus',    '₹5 Crore & Above',        9)
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

-- ==========================================
-- SEED DATA FOR LOCATIONS (GUIJARAT -> AHMEDABAD -> AREAS)
-- ==========================================

-- Insert State
INSERT INTO public.states (id, name) 
VALUES ('c324fb70-5b5b-4c40-9769-cf2279b9a691', 'Gujarat')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

-- Insert City
INSERT INTO public.cities (id, state_id, name) 
VALUES ('fd536467-33a8-4228-a5b7-789a695b217d', 'c324fb70-5b5b-4c40-9769-cf2279b9a691', 'Ahmedabad')
ON CONFLICT (state_id, name) DO UPDATE SET name = EXCLUDED.name;

-- Insert Areas
INSERT INTO public.areas (city_id, name) VALUES
('fd536467-33a8-4228-a5b7-789a695b217d', 'Satellite'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Prahlad Nagar'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Bodakdev'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Vastrapur'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Thaltej'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Bopal'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'South Bopal'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Gota'),
('fd536467-33a8-4228-a5b7-789a695b217d', 'Chandkheda')
ON CONFLICT DO NOTHING;

-- ==========================================
-- SMART MATCHES VIEW (UPDATED FOR STATE/CITY/AREA)
-- ==========================================
CREATE OR REPLACE VIEW public.smart_matches AS
SELECT 
    b.id AS buyer_id,
    b.name AS buyer_name,
    b.phone AS buyer_phone,
    b.property_type,
    b.state,
    b.city,
    b.area,
    s.id AS seller_id,
    s.name AS seller_name,
    s.phone AS seller_phone
FROM public.buyers_demand b
JOIN public.sellers_inventory s 
  ON b.property_type = s.property_type 
  AND b.state = s.state
  AND b.city = s.city 
  AND b.area = s.area
WHERE b.status NOT IN ('closed_won', 'closed_lost')
  AND s.status NOT IN ('closed_won', 'closed_lost');
