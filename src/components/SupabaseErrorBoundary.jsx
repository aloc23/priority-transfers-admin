import React, { Component } from 'react';
import { getHealthCheckMessage } from '../utils/connectionHealthCheck';

class SupabaseErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      healthCheck: null
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a Supabase-related error
    const isSupabaseError = 
      error.message?.includes('supabase') ||
      error.message?.includes('Failed to fetch') ||
      error.stack?.includes('supabaseClient') ||
      window.__SUPABASE_CONFIG_ERROR__;

    if (isSupabaseError) {
      return { hasError: true, error };
    }

    // Let other error boundaries handle non-Supabase errors
    return null;
  }

  componentDidCatch(error, errorInfo) {
    console.error('Supabase Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
      healthCheck: {
        overall: 'failed',
        config: { 
          isValid: !window.__SUPABASE_CONFIG_ERROR__,
          issues: window.__SUPABASE_CONFIG_ERROR__ || []
        },
        connection: { success: false, error: error.message },
        recommendations: [
          'Check your internet connection',
          'Verify Supabase credentials in .env file',
          'Try refreshing the page',
          'Check TROUBLESHOOTING.md for detailed help'
        ]
      }
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      healthCheck: null
    });
    // Force a page refresh to reinitialize everything
    window.location.reload();
  };

  handleDemoMode = () => {
    // Set demo mode in localStorage and reload
    localStorage.setItem('VITE_DEMO_MODE', 'true');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const message = getHealthCheckMessage(this.state.healthCheck || {});
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
              Supabase Connection Error
            </h1>
            
            {/* Error Message */}
            <p className="text-gray-600 text-center mb-4">
              {message.message || 'Unable to connect to the database.'}
            </p>
            
            {/* Recommendations */}
            {message.recommendations && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Fixes:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {message.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Configuration Issues */}
            {this.state.healthCheck?.config?.issues && this.state.healthCheck.config.issues.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-red-900 mb-2">Configuration Issues:</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  {this.state.healthCheck.config.issues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry Connection
              </button>
              <button
                onClick={this.handleDemoMode}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Use Demo Mode
              </button>
            </div>
            
            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="text-gray-500 cursor-pointer">Debug Information</summary>
                <pre className="mt-2 text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            {/* Help Link */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Need help? Check{' '}
                <a href="#" className="text-indigo-600 hover:underline" onClick={() => window.open('/TROUBLESHOOTING.md')}>
                  TROUBLESHOOTING.md
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SupabaseErrorBoundary;