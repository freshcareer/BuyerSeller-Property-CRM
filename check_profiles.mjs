import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjfpujuquiesremikrnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZnB1anVxdWllc3JlbWlrcm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzI1OTgsImV4cCI6MjA5NTAwODU5OH0.LcI6H8pksMVj8FdplKjjFsmP8Q5p9GNq2sNAJM54omc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { data: authUser, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'freshcareer4@gmail.com',
    password: 'Admin@123456'
  });

  console.log("Auth login:", authErr ? authErr.message : "Success");
  if (authUser.user) {
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();
      
    console.log("Profile:", profErr ? profErr.message : profile);
  }
}

checkProfiles();
