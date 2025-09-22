/**
 * User Management page for admin users
 * Contains system statistics, admin access status, and user management functionality
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

export default function UserManagement() {
  const { currentUser } = useAppStore();
  const [systemStats, setSystemStats] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  // Only allow access to admin users
  if (!isAdmin(currentUser)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access user management.</p>
      </div>
    );
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
      setError('Failed to load user management data');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading user management data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="opacity-90">System administration and user controls</p>
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Statistics
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'access'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Access Status
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Profiles
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'actions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Admin Actions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* System Statistics Tab */}
          {activeTab === 'stats' && systemStats && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
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
          )}

          {/* Access Status Tab */}
          {activeTab === 'access' && accessStatus && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access Status</h3>
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
          )}

          {/* User Profiles Tab */}
          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Profiles</h3>
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
          )}

          {/* Admin Actions Tab */}
          {activeTab === 'actions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
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
          )}
        </div>
      </div>
    </div>
  );
}
