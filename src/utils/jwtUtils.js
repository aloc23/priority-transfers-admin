// JWT validation and retrieval utilities for Supabase authentication

import supabase from './supabaseClient';

/**
 * Validates if a JWT token is valid
 * @param {string} jwt - The JWT token to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidJWT(jwt) {
  if (!jwt || typeof jwt !== 'string') {
    return false;
  }
  
  // Basic JWT format validation (3 parts separated by dots)
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Check minimum length (typical JWT is much longer than 50 characters)
  if (jwt.length < 50) {
    return false;
  }
  
  return true;
}

/**
 * Gets a valid JWT from Supabase session with robust error handling
 * @returns {Promise<{success: boolean, jwt: string|null, error: string|null}>}
 */
export async function getValidSupabaseJWT() {
  try {
    // Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase session error:', sessionError);
      return {
        success: false,
        jwt: null,
        error: `Session error: ${sessionError.message}`
      };
    }
    
    const jwt = session?.access_token;
    
    if (!isValidJWT(jwt)) {
      console.error('No valid JWT found in session:', { hasSession: !!session, hasToken: !!jwt });
      return {
        success: false,
        jwt: null,
        error: 'No valid authentication token found. Please log out and log in again with a Supabase account.'
      };
    }
    
    return {
      success: true,
      jwt,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error getting Supabase JWT:', error);
    return {
      success: false,
      jwt: null,
      error: `Authentication error: ${error.message}`
    };
  }
}

/**
 * Gets a valid JWT or shows user-friendly error
 * @param {Function} showErrorCallback - Function to call with error message for user feedback
 * @returns {Promise<string|null>} - Valid JWT or null if invalid
 */
export async function getValidJWTWithUserFeedback(showErrorCallback) {
  const result = await getValidSupabaseJWT();
  
  if (!result.success) {
    if (showErrorCallback && typeof showErrorCallback === 'function') {
      showErrorCallback(result.error);
    }
    return null;
  }
  
  return result.jwt;
}