-- Move hardcoded options to DB
INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
-- Parking Options
('parking', 'None', 'None', 1),
('parking', '1 Covered', '1 Covered', 2),
('parking', '2 Covered', '2 Covered', 3),
('parking', '3+ Covered', '3+ Covered', 4),
('parking', '1 Open', '1 Open', 5),
('parking', '2 Open', '2 Open', 6),

-- Additional Spaces
('additional_spaces', 'Pooja Room', 'Pooja Room', 1),
('additional_spaces', 'Servant Room', 'Servant Room', 2),
('additional_spaces', 'Study Room', 'Study Room', 3),
('additional_spaces', 'Store Room', 'Store Room', 4),
('additional_spaces', 'Balcony', 'Balcony', 5),
('additional_spaces', 'Terrace', 'Terrace', 6),

-- Tags
('tags', 'Vastu Compliant', 'Vastu Compliant', 1),
('tags', 'Gated Society', 'Gated Society', 2),
('tags', 'Corner Property', 'Corner Property', 3),
('tags', 'Park Facing', 'Park Facing', 4),
('tags', 'Main Road Facing', 'Main Road Facing', 5),
('tags', 'Premium Interiors', 'Premium Interiors', 6),
('tags', 'Newly Renovated', 'Newly Renovated', 7),

-- Area Suggestions
('area_suggestions', '500 Sq.Ft.', '500 Sq.Ft.', 1),
('area_suggestions', '1000 Sq.Ft.', '1000 Sq.Ft.', 2),
('area_suggestions', '1500 Sq.Ft.', '1500 Sq.Ft.', 3),
('area_suggestions', '2000 Sq.Ft.', '2000 Sq.Ft.', 4),
('area_suggestions', '50 Sq.Yd.', '50 Sq.Yd.', 5),
('area_suggestions', '100 Sq.Yd.', '100 Sq.Yd.', 6),
('area_suggestions', '200 Sq.Yd.', '200 Sq.Yd.', 7)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;
