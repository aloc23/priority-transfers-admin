/**
 * AdminDashboard component for displaying admin-specific information and controls
 * Only visible to users with admin role
 */

import { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { isAdmin } from '../utils/adminUtils';
import { 
  getSystemStats, 
  getAllUserProfiles, 
  updateUserRole, 
  verifyAdminAccess 
} from '../api/adminSettings';

export default function AdminDashboard() {
  const { currentUser } = useAppStore();
  const [systemStats, setSystemStats] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only render for admin users
  if (!isAdmin(currentUser)) {
    return null;
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResult, profilesResult, accessResult] = await Promise.all([
        getSystemStats(currentUser),
        getAllUserProfiles(currentUser),
        verifyAdminAccess(currentUser)
      ]);

      if (statsResult.success) {
        setSystemStats(statsResult.stats);
      }

      if (profilesResult.success) {
        setUserProfiles(profilesResult.profiles);
      }

      if (accessResult.success) {
        setAccessStatus(accessResult);
      }

      if (!statsResult.success || !profilesResult.success || !accessResult.success) {
        setError('Some admin data could not be loaded');
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const result = await updateUserRole(currentUser, userId, newRole);
      if (result.success) {
        // Refresh user profiles
        const profilesResult = await getAllUserProfiles(currentUser);
        if (profilesResult.success) {
          setUserProfiles(profilesResult.profiles);
        }
      } else {
        alert('Failed to update user role: ' + result.error);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Dashboard</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Status Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="opacity-90">System-wide overview and management</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Admin Access Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Statistics */}
      {systemStats && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{systemStats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemStats.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemStats.totalCustomers}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStats.totalDrivers}</div>
                <div className="text-sm text-gray-600">Total Drivers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{systemStats.totalVehicles}</div>
                <div className="text-sm text-gray-600">Total Vehicles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemStats.totalInvoices}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Status */}
      {accessStatus && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Admin Access Status</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full mr-3 ${accessStatus.hasFullAccess ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className={`font-medium ${accessStatus.hasFullAccess ? 'text-green-700' : 'text-yellow-700'}`}>
                {accessStatus.message}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(accessStatus.accessChecks || {}).map(([key, hasAccess]) => (
                <div key={key} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${hasAccess ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {profile.full_name || 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-500">{profile.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={profile.role}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="Admin">Admin (Legacy)</option>
                        <option value="Dispatcher">Dispatcher</option>
                        <option value="Driver">Driver</option>
                        <option value="User">User</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.id === currentUser.id ? (
                        <span className="text-green-600 font-medium">Current User</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Admin Actions</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadAdminData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Refresh Data
            </button>
            <button
              onClick={() => window.location.hash = '#/settings'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              System Settings
            </button>
            <button
              onClick={() => window.location.hash = '#/reports'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}