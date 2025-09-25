import supabase, { SUPABASE_ANON_KEY, getSupabaseConfig } from './supabaseClient';

/**
 * Authentication utilities for managing Supabase JWT tokens
 */

/**
 * Validate Supabase configuration
 * @returns {Object} - Configuration validation result
 */
export function validateSupabaseConfig() {
  return getSupabaseConfig();
}

/**
 * Get standardized headers for Supabase direct API calls (REST/functions)
 * Includes CORS-compatible headers for Edge Functions
 * @param {string} accessToken - The user's JWT access token
 * @returns {Object} - Headers object with both Authorization and apikey
 */
export function getSupabaseApiHeaders(accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add Authorization header if access token is provided
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  // Always include the apikey for Supabase authentication
  // This is required for both authenticated and unauthenticated requests
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
  } else {
    console.warn('SUPABASE_ANON_KEY is missing - requests may fail');
  }
  
  return headers;
}

/**
 * Get the current Supabase JWT token with validation
 * @returns {Promise<{success: boolean, jwt?: string, error?: string}>}
 */
export async function getSupabaseJWT() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase session error:', sessionError);
      return {
        success: false,
        error: `Session error: ${sessionError.message}`
      };
    }

    const jwt = sessionData?.session?.access_token;
    
    // Validate JWT exists and is a proper string
    if (!jwt || typeof jwt !== 'string' || jwt.length < 20) {
      console.error('No valid Supabase JWT found. Session:', sessionData);
      return {
        success: false,
        error: 'No valid authentication token found. Please log in again.'
      };
    }

    console.log('Valid Supabase JWT retrieved');
    return {
      success: true,
      jwt
    };
  } catch (error) {
    console.error('Could not get Supabase JWT:', error);
    return {
      success: false,
      error: `Authentication error: ${error.message}`
    };
  }
}

/**
 * Check if the current user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { success } = await getSupabaseJWT();
  return success;
}

/**
 * Handle 401 Unauthorized responses from API calls
 * @param {Response} response - The fetch response object
 * @returns {boolean} - Returns true if response is 401, false otherwise
 */
export function handle401Response(response) {
  if (response.status === 401) {
    console.error('401 Unauthorized: JWT missing or invalid');
    return true;
  }
  return false;
}