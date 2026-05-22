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
CREATE POLICY "Allow public read-only access to system_settings"
    ON public.system_settings FOR SELECT
    USING (true);

-- Allow only Super Admins to modify system settings
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
    property_type VARCHAR(100) NOT NULL, -- value from system_settings where category='property_type'
    area VARCHAR(100) NOT NULL, -- value from system_settings where category='city_area'
    budget VARCHAR(100) NOT NULL, -- value from system_settings where category='budget_range'
    status VARCHAR(50) DEFAULT 'New Lead' NOT NULL, -- value from system_settings where category='lead_status'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Buyers Demand
ALTER TABLE public.buyers_demand ENABLE ROW LEVEL SECURITY;

-- Allow public frontend to insert new demands/leads
CREATE POLICY "Allow public inserts for buyers_demand"
    ON public.buyers_demand FOR INSERT
    WITH CHECK (true);

-- Allow only Super Admins to select, update, or delete buyers demand
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
    property_type VARCHAR(100) NOT NULL, -- value from system_settings where category='property_type'
    area VARCHAR(100) NOT NULL, -- value from system_settings where category='city_area'
    price VARCHAR(100) NOT NULL, -- price range/value referencing system_settings
    status VARCHAR(50) DEFAULT 'New Lead' NOT NULL, -- value from system_settings where category='lead_status'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on Sellers Inventory
ALTER TABLE public.sellers_inventory ENABLE ROW LEVEL SECURITY;

-- Allow public frontend to insert new inventory/leads
CREATE POLICY "Allow public inserts for sellers_inventory"
    ON public.sellers_inventory FOR INSERT
    WITH CHECK (true);

-- Allow only Super Admins to select, update, or delete sellers inventory
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

-- Seed Property Types
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('property_type', 'apartment', 'Apartment / Flat', 1),
('property_type', 'villa', 'Villa / Independent House', 2),
('property_type', 'plot', 'Residential Plot / Land', 3),
('property_type', 'commercial_shop', 'Commercial Shop', 4),
('property_type', 'office_space', 'Office Space', 5),
('property_type', 'warehouse', 'Warehouse / Godown', 6)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed City Areas
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('city_area', 'downtown', 'Downtown / City Center', 1),
('city_area', 'uptown', 'Uptown Heights', 2),
('city_area', 'airport_road', 'Airport Road Bypass', 3),
('city_area', 'west_end', 'West End Residency', 4),
('city_area', 'suburbs', 'Green Suburbs', 5),
('city_area', 'north_side', 'North Side Industrial', 6),
('city_area', 'south_end', 'South End Coast', 7)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;

-- Seed Budget / Price Ranges
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('budget_range', 'under_50k', 'Under $50,000', 1),
('budget_range', '50k_100k', '$50,000 - $100,000', 2),
('budget_range', '100k_250k', '$100,000 - $250,000', 3),
('budget_range', '250k_500k', '$250,000 - $500,000', 4),
('budget_range', '500k_1m', '$500,000 - $1,000,000', 5),
('budget_range', '1m_plus', '$1,000,000+', 6)
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
