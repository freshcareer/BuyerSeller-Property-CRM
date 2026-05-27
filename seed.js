const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding dummy data...");
  
  // 1. Fetch random state, city, area
  const { data: areas } = await supabase.from('areas').select('name, city_id').limit(1);
  
  if (!areas || areas.length === 0) {
    console.log("No areas found. Please ensure database is seeded with locations first.");
    return;
  }
  
  const sampleArea = areas[0];
  const areaName = sampleArea.name;
  
  const { data: cities } = await supabase.from('cities').select('name, state_id').eq('id', sampleArea.city_id).single();
  const cityName = cities.name;
  
  const { data: states } = await supabase.from('states').select('name').eq('id', cities.state_id).single();
  const stateName = states.name;
  
  const locationString = `${areaName}, ${cityName}, ${stateName}`;
  
  // Insert Seller
  const { error: sellerErr } = await supabase.from('sellers_inventory').insert([
    {
      name: "Rajesh Kumar",
      phone: "9876543210",
      email: "rajesh@example.com",
      property_type: "apartment",
      state: stateName,
      city: cityName,
      area: locationString,
      budget: "1_cr_to_2_cr",
      status: "new_lead",
      bedrooms: "3_bhk",
      bathrooms: "3_bath",
      facing: "east",
      possession_status: "ready_to_move",
      furnishing: "semi_furnished",
      balconies: "2_balconies",
      property_age: "1_to_5_years",
      builtup_area: "1500 sq ft",
      additional_spaces: "Servant Room",
      parking: "1 Covered",
      description: "Beautiful 3 BHK east facing apartment with modern amenities. Very close to the main road and metro station.",
      tags: "Vastu Compliant, Gated Society"
    },
    {
      name: "Priya Sharma",
      phone: "9876543211",
      email: "priya@example.com",
      property_type: "villa",
      state: stateName,
      city: cityName,
      area: locationString,
      budget: "2_cr_to_5_cr",
      status: "contacted",
      bedrooms: "4_bhk",
      bathrooms: "4_bath",
      facing: "north_east",
      possession_status: "ready_to_move",
      furnishing: "fully_furnished",
      balconies: "3_balconies",
      property_age: "0_to_1_year",
      builtup_area: "3200 sq ft",
      additional_spaces: "Pooja Room, Study",
      parking: "2 Covered",
      description: "Luxurious brand new villa with private garden, fully furnished with premium interiors.",
      tags: "Premium, Corner Property"
    }
  ]);
  
  if (sellerErr) console.error("Seller Error:", sellerErr);
  else console.log("Added 2 dummy sellers.");
  
  // Insert Buyer
  const { error: buyerErr } = await supabase.from('buyers_demand').insert([
    {
      name: "Amit Patel",
      phone: "9876543212",
      email: "amit@example.com",
      property_type: "apartment",
      state: stateName,
      city: cityName,
      area: locationString,
      budget: "1_cr_to_2_cr",
      status: "new_lead",
      bedrooms: "3_bhk",
      facing: "east",
      possession_status: "ready_to_move",
      furnishing: "semi_furnished",
      description: "Looking for a spacious 3 BHK for family, must be Vastu compliant.",
      tags: "Urgent, Pre-approved Loan"
    },
    {
      name: "Neha Singh",
      phone: "9876543213",
      email: "neha@example.com",
      property_type: "villa",
      state: stateName,
      city: cityName,
      area: locationString,
      budget: "2_cr_to_5_cr",
      status: "site_visit",
      bedrooms: "4_bhk",
      possession_status: "ready_to_move",
      description: "Premium villa requirement with a private garden.",
    }
  ]);
  
  if (buyerErr) console.error("Buyer Error:", buyerErr);
  else console.log("Added 2 dummy buyers.");
  
}

seed();
