#!/usr/bin/env node

/**
 * Test script to verify admin functionality
 * Usage: node test-admin-access.mjs
 */

console.log('\n🔍 Testing Admin Access Configuration\n');

// Test 1: Environment variables
console.log('✅ Environment Variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Not set in current environment');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set in current environment');

// Test 2: Check if demo user creation script exists
import { existsSync, readFileSync } from 'fs';

console.log('\n✅ Demo User Creation:');
const createUserScript = 'scripts/create-demo-user.mjs';
if (existsSync(createUserScript)) {
  console.log('Demo user script: ✓ Exists');
  
  const scriptContent = readFileSync(createUserScript, 'utf8');
  if (scriptContent.includes('role: \'admin\'')) {
    console.log('Admin role assignment: ✓ Configured');
  } else {
    console.log('Admin role assignment: ✗ Missing');
  }
  
  if (scriptContent.includes('profiles')) {
    console.log('Profile creation: ✓ Configured');
  } else {
    console.log('Profile creation: ✗ Missing');
  }
} else {
  console.log('Demo user script: ✗ Missing');
}

// Test 3: Check migration SQL
console.log('\n✅ Database Schema:');
const migrationFile = 'supabase/migration.sql';
if (existsSync(migrationFile)) {
  console.log('Migration file: ✓ Exists');
  
  const migrationContent = readFileSync(migrationFile, 'utf8');
  if (migrationContent.includes('profiles')) {
    console.log('Profiles table: ✓ Configured');
  } else {
    console.log('Profiles table: ✗ Missing');
  }
  
  if (migrationContent.includes('role = \'admin\'')) {
    console.log('Admin RLS policies: ✓ Configured');
  } else {
    console.log('Admin RLS policies: ✗ Missing');
  }
} else {
  console.log('Migration file: ✗ Missing');
}

// Test 4: Check key files exist
console.log('\n✅ Admin Enhancement Files:');
const adminFiles = [
  'src/utils/adminUtils.js',
  'src/api/adminSettings.js', 
  'src/components/AdminDashboard.jsx'
];

adminFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`${file}: ✓ Exists`);
  } else {
    console.log(`${file}: ✗ Missing`);
  }
});

// Test 5: Check login enhancement
console.log('\n✅ Authentication Enhancements:');
const loginFile = 'src/pages/Login.jsx';
if (existsSync(loginFile)) {
  const loginContent = readFileSync(loginFile, 'utf8');
  if (loginContent.includes('from(\'profiles\')')) {
    console.log('Profile-based role checking: ✓ Implemented');
  } else {
    console.log('Profile-based role checking: ✗ Missing');
  }
}

console.log('\n🎉 Admin Access Test Complete!\n');

// Output setup instructions
console.log('📋 Setup Instructions for Admin Access:');
console.log('1. Set up environment variables in .env file');
console.log('2. Run: npm install');  
console.log('3. Run Supabase migration: supabase/migration.sql');
console.log('4. Create admin user: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-demo-user.mjs');
console.log('5. Login with admin@example.com / Password123!');
console.log('6. Verify admin dashboard appears and user management works');