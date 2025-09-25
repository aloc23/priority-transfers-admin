import { testSupabaseConnection, getSupabaseConfig } from './supabaseClient';

/**
 * Comprehensive connection health check
 */
export async function performHealthCheck() {
  console.log('🔍 Starting Supabase Connection Verification');
  console.log('==========================================');
  
  const config = getSupabaseConfig();
  const results = {
    config: config,
    connection: null,
    overall: 'unknown',
    recommendations: []
  };

  // Check configuration first
  if (!config.isValid) {
    results.overall = 'failed';
    results.recommendations.push(
      'Fix environment variables in .env file',
      'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly set',
      'Check Supabase dashboard under Settings → API for correct values'
    );
    console.error('❌ Configuration validation failed:', config.issues);
    return results;
  }

  console.log('✅ Configuration validation passed');

  // Test connection
  console.log('🔌 Testing Supabase connection...');
  try {
    const connectionResult = await testSupabaseConnection();
    results.connection = connectionResult;

    if (connectionResult.success) {
      if (connectionResult.needsSchema) {
        results.overall = 'warning';
        results.recommendations.push(
          'Database schema needs setup',
          'Run the migration.sql file in your Supabase SQL editor',
          'Check TROUBLESHOOTING.md for detailed migration instructions'
        );
        console.warn('⚠️  Connection successful but database schema needs setup');
      } else {
        results.overall = 'success';
        console.log('✅ Connection test passed - Database ready');
      }
    } else {
      results.overall = 'failed';
      
      if (connectionResult.networkError) {
        results.recommendations.push(
          'Check your internet connection',
          'Verify Supabase service status',
          'Try accessing Supabase dashboard directly'
        );
      } else {
        results.recommendations.push(
          'Check if your Supabase project is active',
          'Verify your API keys are correct and not expired',
          'Check RLS policies if authentication errors persist'
        );
      }
      
      console.error('❌ Connection test failed:', connectionResult.error);
    }
  } catch (error) {
    results.connection = { success: false, error: error.message };
    results.overall = 'failed';
    results.recommendations.push(
      'Unexpected connection error occurred',
      'Check browser console for detailed error information',
      'Consider enabling demo mode temporarily'
    );
    console.error('❌ Connection verification failed with unexpected error:', error);
  }

  console.log(`🏁 Connection verification complete: ${results.overall.toUpperCase()}`);
  if (results.overall !== 'success') {
    console.log('📋 Falling back to demo mode for offline development');
  }

  return results;
}

/**
 * Show user-friendly error message based on health check results
 */
export function getHealthCheckMessage(results) {
  switch (results.overall) {
    case 'success':
      return {
        type: 'success',
        title: 'Supabase Connection Healthy',
        message: 'All systems are working properly.'
      };
      
    case 'warning':
      return {
        type: 'warning',
        title: 'Setup Required',
        message: results.connection?.warning || 'Database schema setup needed.',
        recommendations: results.recommendations
      };
      
    case 'failed':
      return {
        type: 'error',
        title: 'Supabase Connection Failed',
        message: results.connection?.error || 'Configuration issues detected.',
        recommendations: results.recommendations
      };
      
    default:
      return {
        type: 'info',
        title: 'Checking Connection',
        message: 'Testing Supabase connection...'
      };
  }
}