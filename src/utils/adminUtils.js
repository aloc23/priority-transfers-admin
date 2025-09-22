/**
 * Admin utility functions to ensure full access for admin users
 */

import supabase from "./supabaseClient";

/**
 * Check if current user is an admin
 * @param {Object} user - Current user object with role property
 * @returns {boolean} - True if user has admin role
 */
export function isAdmin(user) {
  return user?.role === 'Admin' || user?.role === 'admin';
}

/**
 * Check if current user should have full data access
 * Admins get full access, other roles get filtered access
 * @param {Object} user - Current user object
 * @returns {boolean} - True if user should have full access
 */
export function hasFullDataAccess(user) {
  return isAdmin(user);
}

/**
 * Get admin-appropriate query options for Supabase
 * For admins, returns no additional filters
 * For other users, could add user-specific filters (not implemented yet)
 * @param {Object} user - Current user object
 * @returns {Object} - Query options for Supabase
 */
export function getAdminQueryOptions(user) {
  if (isAdmin(user)) {
    // Admins get full access - no additional filters
    return {};
  }
  
  // For future enhancement: add user-specific filters for non-admin roles
  return {};
}

/**
 * Verify admin profile exists and is properly configured
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} - Result with success status and profile data
 */
export async function verifyAdminProfile(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', userId)
      .single();
    
    if (error) {
      return { 
        success: false, 
        error: error.message,
        isAdmin: false 
      };
    }
    
    const isAdminUser = profile.role === 'admin' || profile.role === 'Admin';
    
    return {
      success: true,
      profile,
      isAdmin: isAdminUser,
      hasFullAccess: isAdminUser
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isAdmin: false
    };
  }
}

/**
 * Ensure admin users can bypass standard access controls
 * This function can be used in API calls to provide admin overrides
 * @param {Object} user - Current user object
 * @param {Function} standardQuery - Standard query function
 * @param {Function} adminQuery - Admin override query function (optional)
 * @returns {Promise} - Query result
 */
export async function executeWithAdminOverride(user, standardQuery, adminQuery = null) {
  if (isAdmin(user) && adminQuery) {
    // Execute admin-specific query if provided
    return await adminQuery();
  } else {
    // Execute standard query
    return await standardQuery();
  }
}

export default {
  isAdmin,
  hasFullDataAccess,
  getAdminQueryOptions,
  verifyAdminProfile,
  executeWithAdminOverride
};