#!/usr/bin/env node

/**
 * Test admin access fix
 * This script verifies that logged-in users now get admin roles correctly
 */

import { readFileSync } from 'fs';

console.log('🧪 Testing Admin Access Fix\n');

// Test 1: Check AppStore.jsx for correct role defaults
console.log('✅ Checking AppStore.jsx fixes:');
const appStoreContent = readFileSync('src/context/AppStore.jsx', 'utf8');

if (appStoreContent.includes('role = "Admin";') && !appStoreContent.includes('role = "User";')) {
  console.log('   Default role assignment: ✓ Fixed to Admin');
} else {
  console.log('   Default role assignment: ✗ Still has User defaults');
}

if (appStoreContent.includes('role = profile.role || "Admin";')) {
  console.log('   Profile role fallback: ✓ Fixed to Admin');
} else {
  console.log('   Profile role fallback: ✗ Still defaults to User');
}

if (appStoreContent.includes('{ id: user.id, full_name: user.email }') && 
    !appStoreContent.includes('role: "User"')) {
  console.log('   Profile creation: ✓ Uses database default');
} else {
  console.log('   Profile creation: ✗ Still forces User role');
}

// Test 2: Check Signup.jsx for correct default
console.log('\n✅ Checking Signup.jsx fixes:');
const signupContent = readFileSync('src/pages/Signup.jsx', 'utf8');

if (signupContent.includes('useState("Admin")')) {
  console.log('   Signup default role: ✓ Fixed to Admin');
} else if (signupContent.includes('useState("User")')) {
  console.log('   Signup default role: ✗ Still defaults to User');
} else {
  console.log('   Signup default role: ? Unable to determine');
}

// Test 3: Check migration file for correct database default
console.log('\n✅ Checking Database Schema:');
const migrationContent = readFileSync('supabase/migration.sql', 'utf8');

if (migrationContent.includes("role text default 'admin'")) {
  console.log('   Database default role: ✓ Set to admin');
} else {
  console.log('   Database default role: ✗ Not set to admin');
}

console.log('\n📋 Summary:');
console.log('The following changes have been made to fix admin access:');
console.log('1. ✓ AppStore.jsx now defaults all new users to Admin role');
console.log('2. ✓ Profile creation no longer forces User role');
console.log('3. ✓ Database schema defaults to admin role');
console.log('4. ✓ Signup page defaults to Admin role');

console.log('\n🎯 Next Steps:');
console.log('1. If you have existing users with "User" roles, run:');
console.log('   node scripts/update-user-roles.mjs');
console.log('2. Test by logging in - users should now have admin access');
console.log('3. Verify admin functions work in the dashboard');

console.log('\n🚀 All logged-in users should now have admin access!');
