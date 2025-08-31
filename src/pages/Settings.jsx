import { useState } from "react";
import { useAppStore } from "../context/AppStore";

export default function Settings() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("profile");
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
      currency: "USD",
      taxRate: "8.5",
      paymentTerms: "30"
    }
  });

  const handleSave = (section) => {
    alert(`${section} settings saved successfully!`);
  };

  const tabs = [
    { id: "profile", label: "Company Profile", icon: "◪" },
    { id: "notifications", label: "Notifications", icon: "◉" },
    { id: "booking", label: "Booking Settings", icon: "□" },
    { id: "billing", label: "Billing & Payment", icon: "$" },
    { id: "users", label: "User Management", icon: "◎" },
    { id: "integrations", label: "Integrations", icon: "⚙" }
  ];

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
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded hover:bg-gray-100 ${
                      activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
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
                <button
                  onClick={() => handleSave("Profile")}
                  className="btn btn-primary"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
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
                <button
                  onClick={() => handleSave("Notifications")}
                  className="btn btn-primary"
                >
                  Save Preferences
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

          {activeTab === "users" && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Current User</h3>
                  <p className="text-blue-700">Name: {currentUser?.name}</p>
                  <p className="text-blue-700">Role: {currentUser?.role}</p>
                  <p className="text-blue-700">Email: {currentUser?.email}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary">Add User</button>
                  <button className="btn btn-outline">Manage Roles</button>
                  <button className="btn btn-outline">View Audit Log</button>
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
        </div>
      </div>
    </div>
  );
}