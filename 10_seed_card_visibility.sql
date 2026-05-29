-- SQL Script to add Card Field Visibility settings
-- Run this in your Supabase SQL Editor

INSERT INTO public.system_settings (category, value, display_name, sort_order) VALUES
('card_visibility', 'show_bedrooms', 'Show Bedrooms', 1),
('card_visibility', 'show_bathrooms', 'Show Bathrooms', 2),
('card_visibility', 'show_facing', 'Show Facing', 3),
('card_visibility', 'show_property_age', 'Show Property Age', 4),
('card_visibility', 'show_balconies', 'Show Balconies', 5),
('card_visibility', 'show_furnishing', 'Show Furnishing', 6),
('card_visibility', 'show_tags', 'Show Highlight Tags', 7),
('card_visibility', 'show_parking', 'Show Parking', 8),
('card_visibility', 'show_additional_spaces', 'Show Additional Spaces', 9)
ON CONFLICT (category, value) DO UPDATE SET display_name = EXCLUDED.display_name, sort_order = EXCLUDED.sort_order;
