#!/usr/bin/env node

/**
 * Diagnostic script for connection errors
 * This will help identify the real cause of connection issues
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Connection Error Diagnostic\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
  console.log('📊 Basic Connection Test:');
  
  // Test 1: Basic API availability
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { 'apikey': supabaseKey }
    });
    console.log(`   API Status: ✅ ${response.status}`);
  } catch (error) {
    console.log(`   API Status: ❌ ${error.message}`);
  }

  // Test 2: Auth service
  console.log('\n🔐 Authentication Test:');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`   Session Check: ⚠️  ${error.message}`);
    } else {
      console.log(`   Session Check: ✅ Working`);
      if (data.session) {
        console.log(`   Current User: ${data.session.user.email}`);
      } else {
        console.log(`   Current User: None (not logged in)`);
      }
    }
  } catch (error) {
    console.log(`   Session Check: ❌ ${error.message}`);
  }

  // Test 3: Database access (profiles table)
  console.log('\n📋 Database Access Test:');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .limit(5);

    if (error) {
      console.log(`   Profiles Access: ❌ ${error.message}`);
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        console.log('   🔍 This looks like a Row Level Security (RLS) issue');
        console.log('   💡 Users may need proper admin roles to access data');
      }
    } else {
      console.log(`   Profiles Access: ✅ Found ${data.length} profiles`);
      if (data.length > 0) {
        console.log('   📝 Sample profiles:');
        data.forEach(profile => {
          console.log(`      - ${profile.full_name || 'Unnamed'} (Role: ${profile.role})`);
        });
      }
    }
  } catch (error) {
    console.log(`   Profiles Access: ❌ ${error.message}`);
  }

  // Test 4: Other table access
  console.log('\n📊 Data Tables Access Test:');
  const tables = ['customers', 'drivers', 'vehicles', 'bookings'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`   ${table}: ❌ ${error.message}`);
      } else {
        console.log(`   ${table}: ✅ Accessible`);
      }
    } catch (error) {
      console.log(`   ${table}: ❌ ${error.message}`);
    }
  }

  // Test 5: Performance test
  console.log('\n⚡ Performance Test:');
  const startTime = Date.now();
  try {
    await supabase.from('profiles').select('id').limit(1);
    const duration = Date.now() - startTime;
    console.log(`   Response Time: ${duration}ms ${duration > 3000 ? '⚠️ Slow' : '✅ Good'}`);
  } catch (error) {
    console.log(`   Response Time: ❌ Failed (${error.message})`);
  }

  console.log('\n🎯 Recommendations:');
  console.log('Based on the test results above:');
  console.log('1. If you see RLS/permission errors, users need admin roles');
  console.log('2. If response time is slow, increase timeout values');
  console.log('3. If auth fails, check session handling in the app');
  console.log('4. Run: node scripts/update-user-roles.mjs to fix user roles');
}

runDiagnostics().catch(console.error);
