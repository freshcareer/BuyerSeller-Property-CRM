require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const properties = [
  {
    name: 'SHIV SHALIGRAM BUILDCON',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Chandlodiya',
    price: '84_Lac_-_1.43_Cr',
    status: 'active',
    bedrooms: '3',
    builtup_area: '1,800-3,069 sqft',
    possession_status: 'under_construction',
    description: 'Shiv Shaligram Celestial offers 3 BHK apartments in Chandlodiya, Ahmedabad North. These are new launch apartments spreading across a super built-up area of 1800.0 sq. ft. - 3069.0 sq. ft. Builder: SHIV SHALIGRAM BUILDCON',
    tags: 'RERA Approved, New Launch',
    created_at: new Date().toISOString()
  },
  {
    name: 'SUNWOODS-SHREENATH DEVELOPERS LLP',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Vastral',
    price: '73_Lac',
    status: 'active',
    bedrooms: '3',
    builtup_area: '1,935 sqft',
    possession_status: 'under_construction',
    description: 'The Metropark - Book your 3 BHK flat in Vastral, Ahmedabad East. It has a super built-up area of 1935.0 sq. ft. Completion in Aug, 2028.',
    tags: 'RERA Approved',
    created_at: new Date().toISOString()
  },
  {
    name: 'Shivana Group',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'South Bopal',
    price: '80.96_L',
    status: 'active',
    bedrooms: '3',
    builtup_area: '1,760 sqft',
    possession_status: 'under_construction',
    description: 'Shivana Aresta, one of the known housing societies in Ahmedabad West, brings classic yet modern 3 BHK apartments in South Bopal. Completion in Mar, 2029.',
    tags: 'RERA Approved, Near International School',
    created_at: new Date().toISOString()
  },
  {
    name: 'Shreemad Group',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Bhadaj',
    price: '1_-_1.06_Cr',
    status: 'active',
    bedrooms: '3',
    possession_status: 'under_construction',
    description: 'Shreemad Skyscape offers 3 BHK apartments in Bhadaj. Completion in Mar, 2027.',
    tags: '3D Tour Available',
    created_at: new Date().toISOString()
  },
  {
    name: 'RB Builders Ahmedabad',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Sola',
    price: 'Price_on_Request',
    status: 'active',
    bedrooms: '4',
    builtup_area: '3,330 sqft',
    possession_status: 'under_construction',
    description: 'The Seven by RB Builder offers 4 BHK apartments in Sola. Here units have different sizes, mostly in range of 3,330 sqft SUPER area.',
    tags: 'Premium',
    created_at: new Date().toISOString()
  },
  {
    name: 'Siddhi Infralink',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Satellite',
    price: '1.71_-_1.93_Cr',
    status: 'active',
    bedrooms: '3',
    builtup_area: '2,360 - 2,470 sqft',
    possession_status: 'under_construction',
    description: 'Aarohi Avinya offers 3 BHK apartments in Satellite, available for sale. Completion in Dec, 2027.',
    tags: 'RERA Approved',
    created_at: new Date().toISOString()
  },
  {
    name: 'Vivaan Group',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Zundal',
    price: 'Price_on_Request',
    status: 'active',
    bedrooms: '3',
    builtup_area: '851 - 891 sqft',
    possession_status: 'under_construction',
    description: 'Vivaan Oliver brings 3 BHK apartments in Zundal. Completion in Dec, 2027.',
    tags: 'RERA Approved',
    created_at: new Date().toISOString()
  },
  {
    name: 'Polaris Corporation',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Motera',
    price: '2_-_2.1_Cr',
    status: 'active',
    bedrooms: '4',
    builtup_area: '1,938 - 2,010 sqft',
    possession_status: 'new_launch',
    description: 'Polaris Callisto offers 4 BHK apartments in Motera. Completion in Dec, 2030.',
    tags: 'New Launch, RERA Approved',
    created_at: new Date().toISOString()
  },
  {
    name: 'Vivan Infrastructure',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Adalaj',
    price: '1.21_-_2.32_Cr',
    status: 'active',
    bedrooms: '4',
    builtup_area: '3,114 - 5,544 sqft',
    possession_status: 'new_launch',
    description: 'Ivory Springs offers beautifully built 4,5 BHK apartments in Adalaj. Completion in Mar, 2027.',
    tags: 'New Launch, RERA Approved',
    created_at: new Date().toISOString()
  },
  {
    name: 'Trinay Buildspace LLP',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Jodhpur',
    price: '2_-_2.81_Cr',
    status: 'active',
    bedrooms: '3',
    builtup_area: '2,763 - 3,877 sqft',
    possession_status: 'ready_to_move',
    description: 'Trinay Anagh society now offers elegantly built 3,4 BHK apartments in Jodhpur.',
    tags: 'Ready To Move, RERA Approved',
    created_at: new Date().toISOString()
  },
  {
    name: 'Shreekunj Dhara',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Vasna',
    price: '56.5_-_63.8_L',
    status: 'active',
    bedrooms: '2',
    builtup_area: '1,080 - 1,216 sqft',
    possession_status: 'ready_to_move',
    description: 'Shree Sadan 17 - Beautiful 2 BHK apartments in Vasna.',
    tags: 'Ready To Move',
    created_at: new Date().toISOString()
  },
  {
    name: 'Rameshwar Developers',
    phone: '9876543210',
    property_type: 'villa',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Kasindra',
    price: '2.89_-_6.17_Cr',
    status: 'active',
    bedrooms: '5_plus',
    builtup_area: '9,855 - 21,033 sqft',
    possession_status: 'under_construction',
    description: 'Rameshwar Luxuriom Imperia is offering 5 BHK Villa for sale in Kasindra. Swimming Pool, Gymnasium and Club House are some of the amenities offered.',
    tags: 'Villa, Premium',
    created_at: new Date().toISOString()
  },
  {
    name: 'Kavisha Group',
    phone: '9876543210',
    property_type: 'apartment',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Bopal',
    price: '2.41_Cr_-_3.45_Cr',
    status: 'active',
    bedrooms: '4',
    builtup_area: '1,606 - 2,303 sqft',
    possession_status: 'new_launch',
    description: 'Kavisha The Masterpiece - Step into elevated living at Kavisha The Masterpiece, a newly launched landmark by Kavisha Group in the thriving heart of Ahmedabad West.',
    tags: 'New Launch, RERA Approved',
    created_at: new Date().toISOString()
  }
];

async function insertData() {
  console.log('Inserting real properties...');
  let successCount = 0;
  for (const p of properties) {
    const { data, error } = await supabase.from('sellers_inventory').insert(p);
    if (error) {
      console.error('Error inserting property:', p.description, error.message);
    } else {
      successCount++;
    }
  }
  console.log(`Inserted ${successCount} properties successfully.`);
}

insertData();
