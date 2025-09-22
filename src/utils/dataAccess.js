/**
 * Centralized data access layer that ensures admin users get full access
 * to all system data while maintaining proper access controls for other users
 */

import supabase from "./supabaseClient";
import { isAdmin, getEnhancedAdminQuery, validateAdminOperation } from "./adminUtils";

/**
 * Universal data fetch function that respects admin privileges
 * @param {Object} user - Current user object
 * @param {string} table - Table name to query
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Query results with admin access applied
 */
export async function fetchWithAdminAccess(user, table, options = {}) {
  try {
    // Get enhanced query options for admin users
    const queryOptions = getEnhancedAdminQuery(user, options);
    let query = supabase.from(table);

    // Apply select fields
    if (queryOptions.select) {
      query = query.select(queryOptions.select);
    } else {
      query = query.select('*');
    }

    // Apply filters (admin users bypass user-specific filters)
    if (!isAdmin(user) && queryOptions.userFilters) {
      Object.entries(queryOptions.userFilters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply any explicit filters
    if (queryOptions.eq) {
      Object.entries(queryOptions.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply ordering
    if (queryOptions.orderBy) {
      query = query.order(queryOptions.orderBy.column, {
        ascending: queryOptions.orderBy.ascending !== false
      });
    }

    // Apply limits
    if (queryOptions.limit) {
      query = query.limit(queryOptions.limit);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data || [],
      count,
      isAdminAccess: isAdmin(user),
      table
    };
  } catch (error) {
    console.error(`Error fetching ${table} with admin access:`, error);
    return {
      success: false,
      error: error.message,
      table
    };
  }
}

/**
 * Fetch all bookings with admin access
 * @param {Object} user - Current user object
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Bookings data
 */
export async function fetchBookings(user, filters = {}) {
  return await fetchWithAdminAccess(user, 'bookings', {
    select: '*',
    orderBy: { column: 'scheduled_at', ascending: false },
    eq: filters,
    userFilters: isAdmin(user) ? {} : { user_id: user.id } // Non-admin users see only their bookings
  });
}

/**
 * Fetch all customers with admin access
 * @param {Object} user - Current user object
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Customers data
 */
export async function fetchCustomers(user, filters = {}) {
  return await fetchWithAdminAccess(user, 'customers', {
    select: '*',
    orderBy: { column: 'name', ascending: true },
    eq: filters
  });
}

/**
 * Fetch all drivers with admin access
 * @param {Object} user - Current user object
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Drivers data
 */
export async function fetchDrivers(user, filters = {}) {
  return await fetchWithAdminAccess(user, 'drivers', {
    select: '*',
    orderBy: { column: 'name', ascending: true },
    eq: filters
  });
}

/**
 * Fetch all vehicles with admin access
 * @param {Object} user - Current user object
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Vehicles data
 */
export async function fetchVehicles(user, filters = {}) {
  return await fetchWithAdminAccess(user, 'vehicles', {
    select: '*',
    orderBy: { column: 'make', ascending: true },
    eq: filters
  });
}

/**
 * Fetch all invoices with admin access
 * @param {Object} user - Current user object
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Invoices data
 */
export async function fetchInvoices(user, filters = {}) {
  return await fetchWithAdminAccess(user, 'invoices', {
    select: '*',
    orderBy: { column: 'issued_at', ascending: false },
    eq: filters,
    userFilters: isAdmin(user) ? {} : { user_id: user.id } // Non-admin users see only their invoices
  });
}

/**
 * Fetch all partners with admin access
 * @param {Object} user - Current user object
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Partners data
 */
export async function fetchPartners(user, filters = {}) {
  const validation = validateAdminOperation(user, 'access_all_data');
  if (!validation.allowed && !isAdmin(user)) {
    return {
      success: false,
      error: "Partner data access requires admin privileges",
      data: []
    };
  }

  return await fetchWithAdminAccess(user, 'partners', {
    select: '*',
    orderBy: { column: 'name', ascending: true },
    eq: filters
  });
}

/**
 * Fetch all financial data (expenses, income) with admin access
 * @param {Object} user - Current user object
 * @param {string} type - 'expenses' or 'income'
 * @param {Object} filters - Additional filters
 * @returns {Promise<Object>} - Financial data
 */
export async function fetchFinancialData(user, type, filters = {}) {
  const validation = validateAdminOperation(user, 'access_all_data');
  if (!validation.allowed && !isAdmin(user)) {
    return {
      success: false,
      error: "Financial data access requires admin privileges",
      data: []
    };
  }

  return await fetchWithAdminAccess(user, type, {
    select: '*',
    orderBy: { column: 'date', ascending: false },
    eq: filters
  });
}

/**
 * Generic data mutation function with admin privilege validation
 * @param {Object} user - Current user object
 * @param {string} table - Table name
 * @param {string} operation - 'insert', 'update', 'delete'
 * @param {Object} data - Data to mutate
 * @param {Object} conditions - Conditions for update/delete
 * @returns {Promise<Object>} - Mutation result
 */
export async function mutateWithAdminAccess(user, table, operation, data, conditions = {}) {
  try {
    let query = supabase.from(table);

    switch (operation) {
      case 'insert':
        query = query.insert(data);
        break;
      case 'update':
        query = query.update(data);
        if (conditions.eq) {
          Object.entries(conditions.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;
      case 'delete':
        if (conditions.eq) {
          Object.entries(conditions.eq).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        query = query.delete();
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const { data: result, error } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: result,
      operation,
      table
    };
  } catch (error) {
    console.error(`Error in ${operation} operation on ${table}:`, error);
    return {
      success: false,
      error: error.message,
      operation,
      table
    };
  }
}

export default {
  fetchWithAdminAccess,
  fetchBookings,
  fetchCustomers,
  fetchDrivers,
  fetchVehicles,
  fetchInvoices,
  fetchPartners,
  fetchFinancialData,
  mutateWithAdminAccess
};