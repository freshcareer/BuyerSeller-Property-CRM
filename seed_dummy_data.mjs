import { createClient } from '@supabase/supabase-js';

// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or KEY in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DUMMY_BUYERS = [
  { name: 'Amit Patel', phone: '9876543210', email: 'amit@example.com', property_type: '2_bhk', area: 'Thaltej, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '50_to_80_lakhs', status: 'new_lead', notes: 'Looking for a new 2 BHK near SG Highway', follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { name: 'Rohan Sharma', phone: '9123456780', email: 'rohan@example.com', property_type: '3_bhk', area: 'Vastrapur, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '80_to_1_cr', status: 'contacted', notes: 'Premium 3BHK for family', follow_up_date: new Date().toISOString().split('T')[0] },
  { name: 'Priya Desai', phone: '9898989898', email: 'priya@example.com', property_type: 'office_space', area: 'SG Highway, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '1_to_2_cr', status: 'new_lead', notes: 'Office space for IT startup', follow_up_date: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
  { name: 'Vikram Singh', phone: '9787654321', email: 'vikram@example.com', property_type: '1_bhk', area: 'Bopal, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: 'under_30_lakhs', status: 'closed_won', notes: 'Investment property' },
  { name: 'Neha Shah', phone: '9567123489', email: 'neha@example.com', property_type: 'villa', area: 'Sindhu Bhavan, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: 'plus_5_cr', status: 'contacted', notes: 'Looking for ultra luxury villa with swimming pool', follow_up_date: new Date().toISOString().split('T')[0] },
  { name: 'Arjun Verma', phone: '9870001234', email: 'arjun@example.com', property_type: 'commercial_shop', area: 'CG Road, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '2_to_5_cr', status: 'new_lead', notes: 'Retail shop on main road' },
  { name: 'Kavita Iyer', phone: '9345678901', email: 'kavita@example.com', property_type: 'plot', area: 'Sanand, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '30_to_50_lakhs', status: 'contacted', notes: 'Agricultural or NA plot for investment', follow_up_date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { name: 'Rahul Joshi', phone: '9988776655', email: 'rahul@example.com', property_type: '4_bhk', area: 'Science City, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '2_to_5_cr', status: 'new_lead', notes: 'Ready to move 4 BHK' },
  { name: 'Anjali Nair', phone: '9000111222', email: 'anjali@example.com', property_type: '2_bhk', area: 'Gota, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: '30_to_50_lakhs', status: 'new_lead', notes: 'Near SG highway' },
  { name: 'Karan Mehta', phone: '9111222333', email: 'karan@example.com', property_type: 'warehouse', area: 'Changodar, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', budget: 'plus_5_cr', status: 'contacted', notes: 'Large warehouse for logistics' },
];

const DUMMY_SELLERS = [
  { name: 'Sanjay Builder', phone: '9876500000', email: 'sanjay@example.com', property_type: '3_bhk', area: 'Vastrapur, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '80_to_1_cr', status: 'new_lead', notes: 'Ready possession, west facing', follow_up_date: new Date().toISOString().split('T')[0] },
  { name: 'Prakash Patel', phone: '9998887776', email: 'prakash@example.com', property_type: '2_bhk', area: 'Thaltej, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '50_to_80_lakhs', status: 'contacted', notes: 'Fully furnished 2BHK on 5th floor', follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
  { name: 'Rajesh Shah', phone: '9123412345', email: 'rajesh@example.com', property_type: 'office_space', area: 'SG Highway, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '1_to_2_cr', status: 'new_lead', notes: '1000 sq ft office in corporate park' },
  { name: 'Meena Desai', phone: '9876112233', email: 'meena@example.com', property_type: 'villa', area: 'Sindhu Bhavan, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: 'plus_5_cr', status: 'contacted', notes: 'Premium 5BHK Villa', follow_up_date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { name: 'Hardik Broker', phone: '9009009009', email: 'hardik@example.com', property_type: 'plot', area: 'Sanand, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '30_to_50_lakhs', status: 'closed_won', notes: 'Plot with boundary wall' },
  { name: 'Swati Mehta', phone: '9777888999', email: 'swati@example.com', property_type: 'commercial_shop', area: 'CG Road, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '2_to_5_cr', status: 'new_lead', notes: 'Ground floor shop, currently rented' },
  { name: 'Dinesh Parmar', phone: '9444555666', email: 'dinesh@example.com', property_type: '1_bhk', area: 'Bopal, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: 'under_30_lakhs', status: 'contacted', notes: 'Good condition 1 BHK for quick sale', follow_up_date: new Date().toISOString().split('T')[0] },
  { name: 'Chetan Developer', phone: '9222333444', email: 'chetan@example.com', property_type: '4_bhk', area: 'Science City, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '2_to_5_cr', status: 'new_lead', notes: 'Under construction 4 BHK, possession next year' },
  { name: 'Bharat Kumar', phone: '9888999000', email: 'bharat@example.com', property_type: '2_bhk', area: 'Gota, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: '30_to_50_lakhs', status: 'new_lead', notes: 'Top floor 2 BHK with terrace rights' },
  { name: 'Jayesh Patel', phone: '9111444777', email: 'jayesh@example.com', property_type: 'warehouse', area: 'Changodar, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', price: 'plus_5_cr', status: 'contacted', notes: 'Industrial shed with power connection', follow_up_date: new Date(Date.now() + 172800000).toISOString().split('T')[0] },
];

async function seedData() {
  console.log('Seeding Buyers...');
  const { error: bErr } = await supabase.from('buyers_demand').insert(DUMMY_BUYERS);
  if (bErr) console.error('Error seeding buyers:', bErr);
  else console.log('Successfully seeded 10 buyers.');

  console.log('Seeding Sellers...');
  const { error: sErr } = await supabase.from('sellers_inventory').insert(DUMMY_SELLERS);
  if (sErr) console.error('Error seeding sellers:', sErr);
  else console.log('Successfully seeded 10 sellers.');

  console.log('Dummy data seeding complete!');
}

seedData();
