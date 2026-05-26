import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  console.log("Fetching all sellers_inventory...");
  const { data, error } = await supabase.from('sellers_inventory').select('*');
  
  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  
  console.log(`Found ${data.length} records.`);
  console.table(data.map(d => ({
    id: d.id,
    name: d.name,
    status: d.status,
    created_at: d.created_at
  })));
}

check();
