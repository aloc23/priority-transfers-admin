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
  if (!user || !user.role) return false;
  
  // Support multiple admin role formats for flexibility
  const role = user.role.toLowerCase();
  return role === 'admin' || role === 'administrator' || role === 'super_admin';
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
    
    const isAdminUser = isAdmin({ role: profile.role });
    
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
  } else if (isAdmin(user)) {
    // For admin users, execute standard query without restrictions
    return await standardQuery();
  } else {
    // Execute standard query (may have user-specific filters)
    return await standardQuery();
  }
}

/**
 * Get enhanced query options for admins that bypass normal restrictions
 * @param {Object} user - Current user object
 * @param {Object} baseOptions - Base query options
 * @returns {Object} - Enhanced query options for admins
 */
export function getEnhancedAdminQuery(user, baseOptions = {}) {
  if (isAdmin(user)) {
    // For admin users, ensure no restrictive filters are applied
    return {
      ...baseOptions,
      // Remove any user-specific filters that might restrict admin access
      filters: {},
      // Ensure admin sees all data
      includeDeleted: true,
      includeArchived: true,
      bypassRLS: false, // RLS policies handle admin access in database
    };
  }
  return baseOptions;
}

/**
 * Validate admin permissions for sensitive operations
 * @param {Object} user - Current user object
 * @param {string} operation - Operation being performed
 * @returns {Object} - Validation result
 */
export function validateAdminOperation(user, operation) {
  const adminUser = isAdmin(user);
  
  const sensitiveOperations = [
    'delete_user', 'modify_user_role', 'access_all_data',
    'system_settings', 'bulk_operations', 'export_data'
  ];
  
  if (sensitiveOperations.includes(operation) && !adminUser) {
    return {
      allowed: false,
      error: `Operation '${operation}' requires admin privileges`
    };
  }
  
  return {
    allowed: true,
    isAdmin: adminUser,
    userRole: user?.role
  };
}

export default {
  isAdmin,
  hasFullDataAccess,
  getAdminQueryOptions,
  getEnhancedAdminQuery,
  verifyAdminProfile,
  executeWithAdminOverride,
  validateAdminOperation
};