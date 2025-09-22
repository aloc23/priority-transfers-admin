import { useState, useEffect } from "react";
import { useAppStore } from "../context/AppStore";
import { fetchSettings, saveSettings } from "../api/settings";
import { getAllUserProfiles, updateUserRole } from "../api/adminSettings";
import { isAdmin } from "../utils/adminUtils";
import { 
  CustomerIcon, 
  NotificationIcon, 
  SettingsListIcon, 
  RevenueIcon, 
  BookingIcon,
  SettingsIcon 
} from "../components/Icons";

export default function Settings() {
  const { currentUser, clearDemoData, loadRealData, resetToDemo, refreshAllData } = useAppStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfiles, setUserProfiles] = useState([]);
  const [settings, setSettings] = useState({
    companyName: "Priority Transfers",
    email: currentUser?.email || "",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, City, ST 12345",
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    booking: {
      autoAssign: true,
      requireConfirmation: true,
      allowOnlineBooking: true
    },
    billing: {
      currency: "EUR",
      taxRate: "8.5",
      paymentTerms: "30"
    }
  });

  // Load settings from Supabase on component mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const savedSettings = await fetchSettings();
        
        if (savedSettings) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...savedSettings,
            // Ensure email is updated from current user if available
            email: currentUser?.email || savedSettings.email || ""
          }));
        } else {
          // No settings found, use defaults with current user email if available
          setSettings(prevSettings => ({
            ...prevSettings,
            email: currentUser?.email || ""
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load settings. Using defaults.' 
        });
        setTimeout(() => setMessage(""), 5000);
      }
    }
    
    loadSettings();
  }, [currentUser]);

  const handleSave = async (section) => {
    try {
      setIsLoading(true);
      setMessage("");

      // Save settings using Supabase API
      const result = await saveSettings(settings);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `${section} settings saved successfully!` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || `Failed to save ${section} settings. Please try again.` 
        });
      }
      
      // Clear message after 3-5 seconds
      setTimeout(() => setMessage(""), result.success ? 3000 : 5000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to save ${section} settings. Please try again.` 
      });
      
      // Clear error message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataOperation = async (operation, operationName) => {
    setIsLoading(true);
    setMessage("");
    
    try {
      const result = await operation();
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to ${operationName}` });
    } finally {
      setIsLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Load user profiles for admin users
  useEffect(() => {
    if (isAdmin(currentUser)) {
      async function loadUserProfiles() {
        try {
          const result = await getAllUserProfiles(currentUser);
          if (result.success) {
            setUserProfiles(result.profiles);
          }
        } catch (error) {
          console.error('Error loading user profiles:', error);
        }
      }
      loadUserProfiles();
    }
  }, [currentUser]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const result = await updateUserRole(currentUser, userId, newRole);
      if (result.success) {
        // Refresh user profiles
        const profilesResult = await getAllUserProfiles(currentUser);
        if (profilesResult.success) {
          setUserProfiles(profilesResult.profiles);
          setMessage("User role updated successfully!");
        }
      } else {
        setMessage("Failed to update user role: " + result.error);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setMessage("Failed to update user role");
    }
  };

  const allTabs = [
    { id: "profile", label: "Profile & Notifications", icon: CustomerIcon },
    { id: "booking", label: "Booking Settings", icon: SettingsListIcon },
    { id: "billing", label: "Billing & Payment", icon: RevenueIcon },
    { id: "users", label: "User Management", icon: BookingIcon, adminOnly: true },
    { id: "data", label: "Data Management", icon: SettingsIcon },
    { id: "integrations", label: "Integrations", icon: SettingsIcon }
  ];

  // Filter tabs based on user role
  const tabs = isAdmin(currentUser) 
    ? allTabs 
    : allTabs.filter(tab => !tab.adminOnly);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="card p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Settings</h2>
            </div>
            <ul className="p-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded hover:bg-gray-100 ${
                        activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Company Profile Section */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Phone</label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Address</label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      rows="3"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences Section */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Email Notifications</label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">SMS Notifications</label>
                      <p className="text-sm text-gray-600">Receive updates via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Push Notifications</label>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: e.target.checked }
                      })}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSave("Profile & Notifications")}
                  className="btn btn-primary"
                >
                  Save All Settings
                </button>
                <button className="btn btn-outline">
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Booking Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Auto-assign Drivers</label>
                    <p className="text-sm text-gray-600">Automatically assign available drivers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.booking.autoAssign}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, autoAssign: e.target.checked }
                    })}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Require Confirmation</label>
                    <p className="text-sm text-gray-600">Require booking confirmation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.booking.requireConfirmation}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, requireConfirmation: e.target.checked }
                    })}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Allow Online Booking</label>
                    <p className="text-sm text-gray-600">Enable customer self-booking</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.booking.allowOnlineBooking}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, allowOnlineBooking: e.target.checked }
                    })}
                    className="rounded"
                  />
                </div>
                <button
                  onClick={() => handleSave("Booking")}
                  className="btn btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Billing & Payment</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Currency</label>
                    <select
                      value={settings.billing.currency}
                      onChange={(e) => setSettings({
                        ...settings,
                        billing: { ...settings.billing, currency: e.target.value }
                      })}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.billing.taxRate}
                      onChange={(e) => setSettings({
                        ...settings,
                        billing: { ...settings.billing, taxRate: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Payment Terms (days)</label>
                  <input
                    type="number"
                    value={settings.billing.paymentTerms}
                    onChange={(e) => setSettings({
                      ...settings,
                      billing: { ...settings.billing, paymentTerms: e.target.value }
                    })}
                  />
                </div>
                <button
                  onClick={() => handleSave("Billing")}
                  className="btn btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "users" && isAdmin(currentUser) && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                  {message}
                </div>
              )}
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Current Admin User</h3>
                  <p className="text-blue-700">Name: {currentUser?.name}</p>
                  <p className="text-blue-700">Role: {currentUser?.role}</p>
                  <p className="text-blue-700">Email: {currentUser?.email}</p>
                  <p className="text-blue-700">ID: {currentUser?.id}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-4">All System Users</h3>
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
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userProfiles.map((profile) => (
                          <tr key={profile.id} className={profile.id === currentUser.id ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {profile.full_name || 'Unnamed User'}
                                </div>
                                <div className="text-sm text-gray-500">{profile.id.substring(0, 8)}...</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={profile.role}
                                onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                className="text-sm border rounded px-2 py-1"
                                disabled={profile.id === currentUser.id}
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
                              {profile.phone || '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(profile.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {profile.id === currentUser.id ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Current User
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-medium text-amber-900 mb-2">Admin Notes</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Admin users have full access to all system features and data</li>
                    <li>• Dispatchers can manage bookings, customers, and drivers</li>
                    <li>• Drivers have limited access to their assigned bookings</li>
                    <li>• Users and Viewers have read-only access to basic features</li>
                    <li>• You cannot change your own role for security reasons</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Integrations</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Google Maps API</h3>
                      <p className="text-sm text-gray-600">Route optimization and mapping</p>
                    </div>
                    <button className="btn btn-outline">Configure</button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Stripe Payment</h3>
                      <p className="text-sm text-gray-600">Online payment processing</p>
                    </div>
                    <button className="btn btn-outline">Configure</button>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Twilio SMS</h3>
                      <p className="text-sm text-gray-600">SMS notifications</p>
                    </div>
                    <button className="btn btn-outline">Configure</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Data Management</h2>
              
              {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-6">
                <div className="border rounded-lg p-6 bg-gradient-to-br from-slate-50 to-granite-50">
                  <h3 className="font-semibold text-lg mb-2 text-slate-800">Demo Data Management</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Manage your application data for testing and production use. Always maintain demo login for testing purposes.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-medium text-slate-800 mb-2">Refresh All Data</h4>
                      <p className="text-sm text-slate-600 mb-3">Sync and refresh all KPIs, analytics, and dashboard data</p>
                      <button 
                        onClick={() => handleDataOperation(refreshAllData, 'refresh all data')}
                        disabled={isLoading}
                        className="btn btn-primary w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isLoading ? 'Refreshing...' : 'Refresh All Data'}
                      </button>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-medium text-slate-800 mb-2">Reset to Demo</h4>
                      <p className="text-sm text-slate-600 mb-3">Restore original demo data</p>
                      <button 
                        onClick={() => handleDataOperation(resetToDemo, 'reset to demo')}
                        disabled={isLoading}
                        className="btn btn-outline w-full text-amber-600 border-amber-300 hover:bg-amber-50"
                      >
                        {isLoading ? 'Resetting...' : 'Reset to Demo'}
                      </button>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-medium text-slate-800 mb-2">Clear Demo Data</h4>
                      <p className="text-sm text-slate-600 mb-3">Remove all demo data from the system</p>
                      <button 
                        onClick={() => handleDataOperation(clearDemoData, 'clear demo data')}
                        disabled={isLoading}
                        className="btn btn-outline w-full text-red-600 border-red-300 hover:bg-red-50"
                      >
                        {isLoading ? 'Clearing...' : 'Clear Demo Data'}
                      </button>
                    </div>

                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-medium text-slate-800 mb-2">Load Real Data</h4>
                      <p className="text-sm text-slate-600 mb-3">Load production-ready data sample</p>
                      <button 
                        onClick={() => handleDataOperation(loadRealData, 'load real data')}
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                      >
                        {isLoading ? 'Loading...' : 'Load Real Data'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4 text-slate-800">Data Export & Backup</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="btn btn-outline">
                      Export All Data (CSV)
                    </button>
                    <button className="btn btn-outline">
                      Create Data Backup
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4 text-slate-800">System Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Data Storage:</span>
                      <span className="ml-2 text-slate-800">Local Storage</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Environment:</span>
                      <span className="ml-2 text-slate-800">Development</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Version:</span>
                      <span className="ml-2 text-slate-800">1.0.0</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Last Updated:</span>
                      <span className="ml-2 text-slate-800">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}