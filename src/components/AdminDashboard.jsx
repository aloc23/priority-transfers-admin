/**
 * AdminDashboard component for displaying admin-specific information and controls
 * Only visible to users with admin role
 */

import { useAppStore } from '../context/AppStore';
import { isAdmin } from '../utils/adminUtils';

export default function AdminDashboard() {
  const { currentUser } = useAppStore();

  // Only render for admin users
  if (!isAdmin(currentUser)) {
    return null;
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

      {/* Quick Admin Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.hash = '#/user-management'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md text-sm font-medium flex flex-col items-center space-y-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span>User Management</span>
            </button>
            <button
              onClick={() => window.location.hash = '#/settings'}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium flex flex-col items-center space-y-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>System Settings</span>
            </button>
            <button
              onClick={() => window.location.hash = '#/reports'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md text-sm font-medium flex flex-col items-center space-y-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Reports</span>
            </button>
            <button
              onClick={() => window.location.hash = '#/fleet'}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md text-sm font-medium flex flex-col items-center space-y-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Fleet Management</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Admin Information</h3>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-2">
              <strong>Welcome, {currentUser?.name || 'Admin User'}!</strong>
            </p>
            <p className="text-blue-700 text-sm">
              You have full administrative access to all system features. Use the User Management section to view system statistics, manage user accounts, and monitor admin access status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}