import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import supabase from "../utils/supabaseClient";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useDemoLogin, setUseDemoLogin] = useState(true);
  const { currentUser, login } = useAppStore();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (useDemoLogin) {
      // -----------------------------
      // DEMO LOGIN
      // -----------------------------
      const demoUsers = [
        { id: 1, name: "Admin User", email: "admin@priority.com", role: "Admin" },
        { id: 2, name: "Dispatcher", email: "dispatcher@priority.com", role: "Dispatcher" },
        { id: 3, name: "Viewer", email: "viewer@priority.com", role: "Viewer" },
      ];
      await new Promise((resolve) => setTimeout(resolve, 800));
      const user = demoUsers.find((u) => u.email === email);
      if (user && password === "demo123") {
        login(user); // update global app state
      } else {
        setError("Invalid demo email or password. Please try again.");
      }
      setIsLoading(false);
      return;
    }

    // -----------------------------
    // SUPABASE LOGIN
    // -----------------------------
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Supabase login error: " + loginError.message);
      setIsLoading(false);
      return;
    }

    // fetch role from profiles after login
    const userId = data.user.id;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      setError("Unable to fetch user profile.");
      setIsLoading(false);
      return;
    }

    // login into app store with profile role
    login({
      id: userId,
      name: profile.full_name || data.user.email,
      email: data.user.email,
      role: profile.role || "User",
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 rounded-2xl p-3 shadow-lg">
              <img src="./logo.svg" alt="Priority Transfers Logo" className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your Priority Transfers admin account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Demo Login Toggle */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="demoLogin"
                checked={useDemoLogin}
                onChange={(e) => setUseDemoLogin(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="demoLogin" className="ml-2 text-sm text-gray-900">
                Use Demo Login
              </label>
            </div>

            {useDemoLogin && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                <strong>Demo Accounts:</strong>
                <br /> Admin: admin@priority.com
                <br /> Dispatcher: dispatcher@priority.com
                <br /> Viewer: viewer@priority.com
                <br /> Password: demo123
              </div>
            )}
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="#/signup" className="text-indigo-600 hover:underline">
              Sign up
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          © 2024 Priority Transfers. All rights reserved.
        </div>
      </div>
    </div>
  );
}
