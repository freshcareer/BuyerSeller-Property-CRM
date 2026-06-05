-- Add image_urls array column to store free image hosting URLs
ALTER TABLE sellers_inventory ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
