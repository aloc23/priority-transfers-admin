import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validate Supabase configuration
 */
function validateConfig(url, key) {
  const issues = [];
  
  if (!url) {
    issues.push('VITE_SUPABASE_URL is missing');
  } else {
    if (!url.startsWith('https://')) {
      issues.push('VITE_SUPABASE_URL should start with https://');
    }
    if (!url.includes('.supabase.co')) {
      issues.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
    }
  }
  
  if (!key) {
    issues.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (key.length < 100) {
    issues.push('VITE_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    url,
    hasKey: !!key
  };
}

// Validate configuration
const config = validateConfig(supabaseUrl, supabaseAnonKey);

console.log("Supabase Configuration Check:");
console.log(`URL: ${config.url || 'Missing'}`);
console.log(`Key: ${config.hasKey ? '✓ Present' : '✗ Missing'}`);

if (!config.isValid) {
  console.error('\n❌ Supabase Configuration Issues:');
  config.issues.forEach(issue => console.error(`   • ${issue}`));
  console.error('\nPlease check your .env file and ensure:');
  console.error('   • VITE_SUPABASE_URL is set to your project URL');
  console.error('   • VITE_SUPABASE_ANON_KEY is set to your anon key');
  console.error('\nFind these values in your Supabase dashboard under Settings → API');
  
  // Still create client for graceful fallback, but with error tracking
  window.__SUPABASE_CONFIG_ERROR__ = config.issues;
} else {
  console.log('✅ Supabase configuration appears valid');
}

// Create client with enhanced error handling
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  // Add global error handling
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000)
      }).catch(error => {
        console.error('Supabase request error:', error);
        // Re-throw to let calling code handle
        throw error;
      });
    }
  }
});

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection() {
  try {
    if (!config.isValid) {
      return {
        success: false,
        error: 'Invalid configuration',
        issues: config.issues
      };
    }

    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .maybeSingle();

    if (error) {
      // If it's a table not found error, that might be OK (database not set up yet)
      if (error.code === 'PGRST116' || error.message?.includes('relation "profiles" does not exist')) {
        return {
          success: true,
          warning: 'Connection successful but database schema may not be set up. Run migration.sql in Supabase SQL editor.',
          needsSchema: true
        };
      }
      
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    return {
      success: true,
      message: 'Connection successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Connection test failed',
      networkError: error.name === 'AbortError' || error.message?.includes('fetch')
    };
  }
}

/**
 * Get configuration validation result
 */
export function getSupabaseConfig() {
  return config;
}

// Export the anon key for use in direct API calls that require both Authorization and apikey headers
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export default supabase;
