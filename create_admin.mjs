import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kjfpujuquiesremikrnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZnB1anVxdWllc3JlbWlrcm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzI1OTgsImV4cCI6MjA5NTAwODU5OH0.LcI6H8pksMVj8FdplKjjFsmP8Q5p9GNq2sNAJM54omc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
  const users = ['freshcareer4@gmail.com', 'rajeshrshiv@gmail.com'];
  const password = 'Admin@123456';

  for (const email of users) {
    console.log(`Attempting to sign up: ${email}`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error(`Error creating ${email}:`, error.message);
    } else {
      console.log(`Success! User ${email} created.`);
      if (data.session) {
         console.log(`User ${email} is automatically logged in!`);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
         console.log(`Note: User ${email} already exists.`);
      } else {
         console.log(`Note: Check email for confirmation if required by Supabase.`);
      }
    }
  }
}

createUsers();
