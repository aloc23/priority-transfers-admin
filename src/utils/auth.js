// Authentication utility functions for Supabase JWT handling

import supabase from './supabaseClient';

/**
 * Validates if a JWT token appears to be valid (basic checks)
 * @param {string} jwt - The JWT token to validate
 * @returns {boolean} - True if JWT appears valid
 */
export function isValidJWT(jwt) {
  if (!jwt || typeof jwt !== 'string') {
    return false;
  }
  
  // Basic JWT format check (should have 3 parts separated by dots)
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Check minimum length (valid JWTs are typically much longer than 20 chars)
  if (jwt.length < 20) {
    return false;
  }
  
  return true;
}

/**
 * Gets a valid JWT from Supabase session with robust error handling
 * @returns {Promise<{jwt: string|null, error: string|null, user: object|null}>}
 */
export async function getValidJWT() {
  try {
    // Try to get current session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Supabase session error:', sessionError);
      return {
        jwt: null,
        error: `Session error: ${sessionError.message}`,
        user: null
      };
    }

    // Check if we have a session and access token
    if (session?.access_token) {
      const jwt = session.access_token;
      
      // Validate the JWT format
      if (isValidJWT(jwt)) {
        return {
          jwt,
          error: null,
          user: session.user
        };
      } else {
        return {
          jwt: null,
          error: 'Retrieved JWT is invalid or malformed',
          user: session.user
        };
      }
    }

    // If no valid session, try to get user (this might refresh the session)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Supabase user error:', userError);
      return {
        jwt: null,
        error: `User authentication error: ${userError.message}`,
        user: null
      };
    }

    // If we have a user but no session, the session might have expired
    if (user && !session) {
      return {
        jwt: null,
        error: 'User session has expired. Please log out and log in again.',
        user: null
      };
    }

    // No user authenticated
    return {
      jwt: null,
      error: 'No authenticated user found. Please log in with a Supabase account.',
      user: null
    };
    
  } catch (error) {
    console.error('Unexpected error getting JWT:', error);
    return {
      jwt: null,
      error: `Unexpected authentication error: ${error.message}`,
      user: null
    };
  }
}

/**
 * Gets a valid JWT with user-friendly error handling
 * Shows alert to user if JWT is invalid and returns null
 * @param {boolean} showAlert - Whether to show alert dialogs to user
 * @returns {Promise<string|null>} - Valid JWT or null if invalid/missing
 */
export async function getValidJWTWithUserFeedback(showAlert = true) {
  const { jwt, error, user } = await getValidJWT();
  
  if (!jwt && showAlert && error) {
    alert(error);
    console.error('JWT validation failed:', error);
  }
  
  return jwt;
}