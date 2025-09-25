#!/usr/bin/env node

/**
 * Update existing user roles to Admin
 * This script helps fix users who were previously created with "User" role
 * Run this script to ensure all existing users have admin access
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have set:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserRoles() {
  console.log('🔧 Updating user roles to Admin...\n');

  try {
    // First, check current users and their roles
    const { data: currentUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, role');

    if (fetchError) {
      console.error('❌ Error fetching current users:', fetchError);
      return;
    }

    if (!currentUsers || currentUsers.length === 0) {
      console.log('ℹ️  No users found in profiles table');
      return;
    }

    console.log('📊 Current Users:');
    currentUsers.forEach(user => {
      console.log(`   - ${user.full_name || 'Unnamed'} (${user.id}) - Role: ${user.role}`);
    });

    // Count non-admin users
    const nonAdminUsers = currentUsers.filter(user => 
      !user.role || user.role.toLowerCase() === 'user' || user.role === 'User'
    );

    if (nonAdminUsers.length === 0) {
      console.log('\n✅ All users already have admin roles!');
      return;
    }

    console.log(`\n🔄 Updating ${nonAdminUsers.length} users to Admin role...`);

    // Update all non-admin users to Admin
    const { data: updatedUsers, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'Admin' })
      .in('id', nonAdminUsers.map(user => user.id))
      .select('id, full_name, role');

    if (updateError) {
      console.error('❌ Error updating user roles:', updateError);
      return;
    }

    console.log('\n✅ Successfully updated user roles:');
    if (updatedUsers) {
      updatedUsers.forEach(user => {
        console.log(`   - ${user.full_name || 'Unnamed'} (${user.id}) - New Role: ${user.role}`);
      });
    }

    console.log('\n🎉 All users now have admin access!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateUserRoles().then(() => {
  console.log('\n✨ Role update complete');
}).catch(error => {
  console.error('❌ Script failed:', error);
});
