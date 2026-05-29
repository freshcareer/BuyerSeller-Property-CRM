-- Seed Rent Ranges (INR - Indian Rupees)
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('rent_range', 'under_10k',   'Under ₹10,000',          1),
('rent_range', '10k_25k',     '₹10,000 – ₹25,000',    2),
('rent_range', '25k_50k',     '₹25,000 – ₹50,000',    3),
('rent_range', '50k_1l',      '₹50,000 – ₹1 Lakh',    4),
('rent_range', '1l_plus',     '₹1 Lakh & Above',        5)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;
