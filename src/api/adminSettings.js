/**
 * Admin-specific settings and management functions
 * These functions provide admin users with system-wide access and controls
 */

import supabase from "../utils/supabaseClient";
import { isAdmin } from "../utils/adminUtils";

/**
 * Get system-wide statistics for admin dashboard
 * Only available to admin users
 * @param {Object} user - Current user object
 * @returns {Promise<Object>} - System statistics
 */
export async function getSystemStats(user) {
  if (!isAdmin(user)) {
    return { 
      success: false, 
      error: "Access denied. Admin privileges required." 
    };
  }

  try {
    // Get counts from various tables
    const [
      { count: totalUsers },
      { count: totalBookings },
      { count: totalCustomers },
      { count: totalDrivers },
      { count: totalVehicles },
      { count: totalInvoices }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('invoices').select('*', { count: 'exact', head: true })
    ]);

    return {
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0,
        totalCustomers: totalCustomers || 0,
        totalDrivers: totalDrivers || 0,
        totalVehicles: totalVehicles || 0,
        totalInvoices: totalInvoices || 0
      }
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      success: false,
      error: "Failed to fetch system statistics"
    };
  }
}

/**
 * Get all user profiles for admin management
 * Only available to admin users
 * @param {Object} user - Current user object
 * @returns {Promise<Object>} - User profiles data
 */
export async function getAllUserProfiles(user) {
  if (!isAdmin(user)) {
    return { 
      success: false, 
      error: "Access denied. Admin privileges required." 
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        phone,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      profiles: data || []
    };
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return {
      success: false,
      error: "Failed to fetch user profiles"
    };
  }
}

/**
 * Update user role (admin only)
 * @param {Object} currentUser - Current admin user
 * @param {string} userId - Target user ID
 * @param {string} newRole - New role to assign
 * @returns {Promise<Object>} - Update result
 */
export async function updateUserRole(currentUser, userId, newRole) {
  if (!isAdmin(currentUser)) {
    return { 
      success: false, 
      error: "Access denied. Admin privileges required." 
    };
  }

  const validRoles = ['admin', 'Admin', 'Dispatcher', 'Driver', 'User', 'Viewer'];
  if (!validRoles.includes(newRole)) {
    return {
      success: false,
      error: "Invalid role specified"
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      updatedProfile: data
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: "Failed to update user role"
    };
  }
}

/**
 * Get system-wide data access for admin users
 * This provides unrestricted access to all data for admin purposes
 * @param {Object} user - Current user object
 * @param {string} tableName - Table to query
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query results
 */
export async function getSystemWideData(user, tableName, options = {}) {
  if (!isAdmin(user)) {
    return { 
      success: false, 
      error: "Access denied. Admin privileges required." 
    };
  }

  const allowedTables = [
    'bookings', 'customers', 'drivers', 'vehicles', 'partners', 
    'invoices', 'expenses', 'income', 'estimations', 'profiles'
  ];

  if (!allowedTables.includes(tableName)) {
    return {
      success: false,
      error: "Invalid table specified"
    };
  }

  try {
    let query = supabase.from(tableName).select(options.select || '*');

    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending !== false 
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error(`Error fetching ${tableName} data:`, error);
    return {
      success: false,
      error: `Failed to fetch ${tableName} data`
    };
  }
}

/**
 * Verify admin has proper access to all required features
 * @param {Object} user - Current user object
 * @returns {Promise<Object>} - Access verification result
 */
export async function verifyAdminAccess(user) {
  if (!isAdmin(user)) {
    return {
      success: false,
      isAdmin: false,
      error: "User is not an admin"
    };
  }

  const accessChecks = {
    canAccessAllBookings: false,
    canAccessAllCustomers: false,
    canAccessAllDrivers: false,
    canAccessFleetManagement: false,
    canAccessPartnerManagement: false,
    canAccessFinancialData: false,
    canAccessSettings: false,
    canManageUsers: false
  };

  try {
    // Test access to each major data area
    const testQueries = await Promise.allSettled([
      supabase.from('bookings').select('id').limit(1),
      supabase.from('customers').select('id').limit(1),
      supabase.from('drivers').select('id').limit(1),
      supabase.from('vehicles').select('id').limit(1),
      supabase.from('partners').select('id').limit(1),
      supabase.from('invoices').select('id').limit(1),
      supabase.from('user_settings').select('id').limit(1),
      supabase.from('profiles').select('id').limit(1)
    ]);

    accessChecks.canAccessAllBookings = testQueries[0].status === 'fulfilled';
    accessChecks.canAccessAllCustomers = testQueries[1].status === 'fulfilled';
    accessChecks.canAccessAllDrivers = testQueries[2].status === 'fulfilled';
    accessChecks.canAccessFleetManagement = testQueries[3].status === 'fulfilled';
    accessChecks.canAccessPartnerManagement = testQueries[4].status === 'fulfilled';
    accessChecks.canAccessFinancialData = testQueries[5].status === 'fulfilled';
    accessChecks.canAccessSettings = testQueries[6].status === 'fulfilled';
    accessChecks.canManageUsers = testQueries[7].status === 'fulfilled';

    const hasFullAccess = Object.values(accessChecks).every(access => access);

    return {
      success: true,
      isAdmin: true,
      hasFullAccess,
      accessChecks,
      message: hasFullAccess 
        ? "Admin has full access to all features" 
        : "Admin access is partially restricted"
    };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return {
      success: false,
      isAdmin: true,
      error: "Failed to verify admin access"
    };
  }
}

export default {
  getSystemStats,
  getAllUserProfiles,
  updateUserRole,
  getSystemWideData,
  verifyAdminAccess
};