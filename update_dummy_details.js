const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching sellers_inventory...');
  const { data, error } = await supabase.from('sellers_inventory').select('id, property_type, area');
  if (error) {
    console.error('Error:', error);
    return;
  }

  const updates = data.map(item => {
    // Generate some random details based on type
    let beds, baths, builtup, face, park, furn, possession;
    
    if (item.property_type.includes('bhk')) {
      beds = item.property_type.charAt(0);
      baths = Math.max(1, parseInt(beds) - 1).toString();
      builtup = (parseInt(beds) * 500) + ' Sq.Ft.';
      face = 'east';
      park = '1 Covered';
      furn = 'semi_furnished';
      possession = 'ready_to_move';
    } else if (item.property_type === 'villa') {
      beds = '5_plus';
      baths = '5_plus';
      builtup = '4000 Sq.Ft.';
      face = 'north_east';
      park = '3+ Covered';
      furn = 'fully_furnished';
      possession = 'ready_to_move';
    } else {
      beds = null;
      baths = '1';
      builtup = '1000 Sq.Ft.';
      face = 'road_view';
      park = '1 Open';
      furn = 'unfurnished';
      possession = 'ready_to_move';
    }

    return supabase.from('sellers_inventory').update({
      bedrooms: beds,
      bathrooms: baths,
      builtup_area: builtup,
      facing: face,
      parking: park,
      furnishing: furn,
      possession_status: possession,
      balconies: beds ? '2' : null,
      property_age: '1_to_5_years',
      tags: 'Park Facing, Premium Interiors',
      additional_spaces: 'Balcony'
    }).eq('id', item.id);
  });

  console.log(`Updating ${updates.length} records...`);
  await Promise.all(updates);
  console.log('Successfully updated dummy data with advanced details!');
}

main();
