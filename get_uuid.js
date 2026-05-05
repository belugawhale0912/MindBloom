const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tuqmpgmpowbexushwqpt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1cW1wZ21wb3diZXh1c2h3cXB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMzk1NSwiZXhwIjoyMDkzNDc5OTU1fQ.z-WwhG9flCHhwkzS_Xt6vSzzfYVEm0pK-2631gqLPds';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getEmilyUuid() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'emily@example.com',
    password: 'emily123',
  });

  if (error) {
    console.error('Error signing in:', error.message);
    return;
  }

  console.log('Emily UUID:', data.user.id);
}

getEmilyUuid();
