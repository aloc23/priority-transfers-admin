import { useState } from "react";
import { useAppStore } from "../context/AppStore";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoOption, setShowDemoOption] = useState(false);
  const { currentUser, login } = useAppStore();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setShowDemoOption(false);

    try {
      // Use Supabase authentication via AppStore
      const result = await login({ email, password });

      if (!result.success) {
        setError(result.error || "Login failed. Please check your credentials.");
        
        // Show demo option if it's a network error
        if (result.networkError) {
          setShowDemoOption(true);
        }
      }
      // If successful, the auth state change will handle navigation
    } catch (error) {
      console.error('Login error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setIsLoading(true);
    setShowDemoOption(false);

    try {
      // Force demo mode by setting demo credentials
      const result = await login({ 
        email: email || "demo@prioritytransfers.ie", 
        password: "demo123",
        forceDemo: true 
      });

      if (!result.success) {
        setError("Demo mode is not available. Please try again later.");
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setError("Unable to start demo mode. Please try again later.");
    } finally {
      setIsLoading(false);
    }
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
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email"
                required
                autoComplete="email"
                disabled={isLoading}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isLoading}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>

            {error && (
              <div 
                id="error-message"
                className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {showDemoOption && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700 mb-3">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Try Demo Mode</span>
                  </div>
                  <p>Experience the application with sample data while the service is unavailable.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Demo...
                    </div>
                  ) : (
                    'Continue with Demo Mode'
                  )}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby="loading-state"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <span>Don't have an account? </span>
            <a href="#/signup" style={{ color: '#6366f1', textDecoration: 'underline', cursor: 'pointer' }}>Sign up</a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          © 2024 Priority Transfers Ireland. All rights reserved.
        </div>
      </div>
    </div>
  );
}