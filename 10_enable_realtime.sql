-- Enable Realtime for Buyers Demand and Sellers Inventory
BEGIN;
  -- Add tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE buyers_demand;
  ALTER PUBLICATION supabase_realtime ADD TABLE sellers_inventory;
COMMIT;
