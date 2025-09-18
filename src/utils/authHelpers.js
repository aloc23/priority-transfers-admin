// Authentication utilities for Supabase integration
import supabase from './supabaseClient';

/**
 * Checks if user has a valid Supabase session and returns the JWT token
 * @returns {Promise<{success: boolean, jwt?: string, error?: string}>}
 */
export async function getSupabaseAuthToken() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase session error:', sessionError);
      return {
        success: false,
        error: `Authentication error: ${sessionError.message}`
      };
    }

    const jwt = sessionData?.session?.access_token;
    
    if (!jwt || typeof jwt !== 'string' || jwt.length < 20) {
      console.error('No valid Supabase JWT found. Session:', sessionData);
      return {
        success: false,
        error: 'No valid authentication token found. Please log in with a Supabase account.'
      };
    }

    return {
      success: true,
      jwt
    };
  } catch (error) {
    console.error('Error getting Supabase JWT:', error);
    return {
      success: false,
      error: `Authentication check failed: ${error.message}`
    };
  }
}

/**
 * Checks if the current user is authenticated via Supabase (not demo login)
 * @returns {Promise<boolean>}
 */
export async function isSupabaseAuthenticated() {
  const authResult = await getSupabaseAuthToken();
  return authResult.success;
}

/**
 * Provides user-friendly error messages for authentication issues
 * @param {string} context - Context where authentication is needed (e.g., "send email")
 * @returns {string} User-friendly error message
 */
export function getAuthenticationErrorMessage(context = "perform this action") {
  return `Authentication required to ${context}. Please log out and log in again using a Supabase account (not demo login) to access email features.`;
}

/**
 * Shows appropriate alert/prompt for authentication issues
 * @param {string} context - Context where authentication is needed
 * @param {string} error - Specific error message
 */
export function handleAuthenticationError(context = "perform this action", error = null) {
  const message = error || getAuthenticationErrorMessage(context);
  
  // Show user-friendly alert
  alert(`🔐 ${message}\n\nTo use email features:\n1. Log out from the current session\n2. Uncheck "Use demo login"\n3. Log in with your Supabase account credentials`);
  
  console.error(`Authentication error for ${context}:`, error || 'No valid Supabase session');
}