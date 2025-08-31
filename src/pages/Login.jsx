import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { currentUser, login } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Simple demo authentication - in real app this would call an API
    const demoUsers = [
      { id: 1, name: "Admin User", email: "admin@priority.com", role: "Admin" },
      { id: 2, name: "Dispatcher", email: "dispatcher@priority.com", role: "Dispatcher" },
      { id: 3, name: "Viewer", email: "viewer@priority.com", role: "Viewer" }
    ];

    const user = demoUsers.find(u => u.email === email);
    if (user && password === "demo123") {
      login(user);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src="./logo.svg" alt="Priority Transfers" className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Priority Transfers</h2>
          <p className="text-gray-600">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <div className="space-y-1">
            <p>Admin: admin@priority.com</p>
            <p>Dispatcher: dispatcher@priority.com</p>
            <p>Viewer: viewer@priority.com</p>
            <p className="mt-2">Password: <span className="font-mono">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}