/**
 * Comprehensive admin access verification and testing utility
 * This module provides tools to verify that admin users have proper access
 * to all system features and data
 */

import { isAdmin, validateAdminOperation } from './adminUtils';
import { verifyAdminAccess, getAllSystemData, getSystemStats } from '../api/adminSettings';
import { fetchWithAdminAccess } from './dataAccess';

/**
 * Run comprehensive admin access test
 * @param {Object} user - Current user object
 * @returns {Promise<Object>} - Comprehensive test results
 */
export async function runAdminAccessTest(user) {
  console.log('🔍 Running comprehensive admin access test...');
  
  const results = {
    userValidation: null,
    roleCheck: null,
    dataAccess: null,
    systemAccess: null,
    operationValidation: null,
    overall: null
  };

  try {
    // 1. User validation
    results.userValidation = {
      hasUser: !!user,
      hasRole: !!(user && user.role),
      roleValue: user?.role,
      isAdminRole: isAdmin(user)
    };

    // 2. Role check
    results.roleCheck = {
      passesIsAdmin: isAdmin(user),
      roleFormats: {
        'admin': user?.role?.toLowerCase() === 'admin',
        'Admin': user?.role === 'Admin', 
        'administrator': user?.role?.toLowerCase() === 'administrator'
      }
    };

    // 3. Data access test
    if (isAdmin(user)) {
      console.log('📊 Testing data access for admin user...');
      
      const dataTests = await Promise.allSettled([
        fetchWithAdminAccess(user, 'bookings', { limit: 1 }),
        fetchWithAdminAccess(user, 'customers', { limit: 1 }),
        fetchWithAdminAccess(user, 'drivers', { limit: 1 }),
        fetchWithAdminAccess(user, 'vehicles', { limit: 1 }),
        fetchWithAdminAccess(user, 'profiles', { limit: 1 })
      ]);

      results.dataAccess = {
        bookings: dataTests[0].status === 'fulfilled' && dataTests[0].value.success,
        customers: dataTests[1].status === 'fulfilled' && dataTests[1].value.success,
        drivers: dataTests[2].status === 'fulfilled' && dataTests[2].value.success,
        vehicles: dataTests[3].status === 'fulfilled' && dataTests[3].value.success,
        profiles: dataTests[4].status === 'fulfilled' && dataTests[4].value.success,
        details: dataTests.map(test => ({
          status: test.status,
          success: test.status === 'fulfilled' ? test.value.success : false,
          error: test.status === 'rejected' ? test.reason?.message : test.value?.error
        }))
      };
    } else {
      results.dataAccess = { 
        error: 'User is not admin - skipping data access tests',
        skipped: true 
      };
    }

    // 4. System access test
    if (isAdmin(user)) {
      console.log('⚙️ Testing system access for admin user...');
      
      try {
        const systemTests = await Promise.allSettled([
          verifyAdminAccess(user),
          getSystemStats(user)
        ]);

        results.systemAccess = {
          adminVerification: systemTests[0].status === 'fulfilled' && systemTests[0].value.success,
          systemStats: systemTests[1].status === 'fulfilled' && systemTests[1].value.success,
          details: {
            verification: systemTests[0].status === 'fulfilled' ? systemTests[0].value : { error: systemTests[0].reason?.message },
            stats: systemTests[1].status === 'fulfilled' ? systemTests[1].value : { error: systemTests[1].reason?.message }
          }
        };
      } catch (error) {
        results.systemAccess = {
          error: `System access test failed: ${error.message}`,
          failed: true
        };
      }
    } else {
      results.systemAccess = { 
        error: 'User is not admin - skipping system access tests',
        skipped: true 
      };
    }

    // 5. Operation validation test
    const sensitiveOperations = [
      'delete_user', 'modify_user_role', 'access_all_data',
      'system_settings', 'bulk_operations', 'export_data'
    ];

    results.operationValidation = {};
    sensitiveOperations.forEach(operation => {
      const validation = validateAdminOperation(user, operation);
      results.operationValidation[operation] = {
        allowed: validation.allowed,
        isAdmin: validation.isAdmin,
        error: validation.error
      };
    });

    // 6. Overall assessment
    const adminUser = isAdmin(user);
    const dataAccessPassed = !adminUser || (results.dataAccess && !results.dataAccess.error);
    const systemAccessPassed = !adminUser || (results.systemAccess && !results.systemAccess.error);
    const operationsAllAllowed = adminUser ? 
      Object.values(results.operationValidation).every(op => op.allowed) : 
      Object.values(results.operationValidation).every(op => !op.allowed);

    results.overall = {
      isAdmin: adminUser,
      allTestsPassed: adminUser && dataAccessPassed && systemAccessPassed && operationsAllAllowed,
      summary: {
        userValidation: results.userValidation.hasUser && results.userValidation.hasRole,
        roleCheck: results.roleCheck.passesIsAdmin,
        dataAccess: dataAccessPassed,
        systemAccess: systemAccessPassed,
        operationValidation: operationsAllAllowed
      },
      recommendations: []
    };

    // Add recommendations
    if (!adminUser && user) {
      results.overall.recommendations.push('User does not have admin role - this is expected for non-admin users');
    }
    if (adminUser && !dataAccessPassed) {
      results.overall.recommendations.push('Admin user has data access issues - check Supabase RLS policies');
    }
    if (adminUser && !systemAccessPassed) {
      results.overall.recommendations.push('Admin user has system access issues - verify API functions');
    }
    if (adminUser && !operationsAllAllowed) {
      results.overall.recommendations.push('Admin user cannot perform all sensitive operations - check validateAdminOperation function');
    }

    console.log('✅ Admin access test completed');
    return {
      success: true,
      results,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Admin access test failed:', error);
    return {
      success: false,
      error: error.message,
      results,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Quick admin status check
 * @param {Object} user - Current user object
 * @returns {Object} - Quick status check result
 */
export function quickAdminCheck(user) {
  const adminStatus = isAdmin(user);
  const hasRole = !!(user && user.role);
  
  return {
    isAdmin: adminStatus,
    hasUser: !!user,
    hasRole: hasRole,
    role: user?.role,
    userId: user?.id,
    adminAccess: adminStatus,
    status: adminStatus ? '✅ Admin Access Granted' : hasRole ? '👤 Regular User' : '❌ No User/Role'
  };
}

/**
 * Log admin access status to console
 * @param {Object} user - Current user object
 */
export function logAdminStatus(user) {
  const status = quickAdminCheck(user);
  
  console.log('🔐 Admin Access Status:');
  console.log(`   User: ${status.hasUser ? '✅' : '❌'} ${user?.email || user?.name || 'No user'}`);
  console.log(`   Role: ${status.hasRole ? '✅' : '❌'} ${status.role || 'No role'}`);
  console.log(`   Admin: ${status.isAdmin ? '✅' : '❌'} ${status.status}`);
  
  if (status.isAdmin) {
    console.log('🚀 Full system access enabled for admin user');
  }
}

export default {
  runAdminAccessTest,
  quickAdminCheck,
  logAdminStatus
};