import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

/**
 * Usage:
 *  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-demo-user.mjs
 */
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const email = process.env.DEMO_EMAIL || 'admin@example.com';
const password = process.env.DEMO_PASSWORD || 'Password123!';

try {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  });
  if (error) throw error;
  console.log('Created user:', data.user.id, data.user.email);
  
  // Also create the profile record to ensure role is available
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .insert([{
      id: data.user.id,
      full_name: 'Demo Admin User',
      role: 'admin'
    }])
    .select()
    .single();
    
  if (profileError) {
    console.error('Profile creation error (user still created):', profileError.message);
  } else {
    console.log('Created profile:', profile.id, profile.role);
  }
} catch (e) {
  console.error('Failed to create user:', e.message);
  process.exit(1);
}
