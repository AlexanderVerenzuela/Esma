const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mfkyksoprcqztanszhdt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3lrc29wcmNxenRhbnN6aGR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTgwODExNywiZXhwIjoyMDk3Mzg0MTE3fQ.IQ6ji3VB2MEu8VXQRsuRFBsJxppPyhV17Zz862LJWtM',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@esmasportwear.com',
    password: 'esmaadmin123',
    email_confirm: true
  });
  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user.email);
  }
}

createUser();
