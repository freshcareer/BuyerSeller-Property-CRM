const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envLocal.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

async function run() {
  console.log('Fetching sellers_inventory...', supabaseUrl);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/sellers_inventory?select=id,status,property_type,city`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    const text = await res.text();
    console.log('Response status:', res.status);
    console.log('Response text:', text);
  } catch (err) {
    console.error(err);
  }
}

run();
