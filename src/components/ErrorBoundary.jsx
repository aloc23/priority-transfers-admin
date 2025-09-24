import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info for debugging
    this.setState({
      errorInfo
    });
    
    // Check if error is a minified React error #31 (non-Error object thrown)
    if (error && (error.toString().includes('Minified React error #31') || 
        (error.name === 'Error' && error.message.includes('31')))) {
      console.error('React minified error #31 detected - likely a non-Error object was thrown:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: '#fff3f3', border: '1px solid #f99', borderRadius: '8px' }}>
          <h2>Something went wrong.</h2>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
          </div>
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details (for developers)</summary>
              {this.state.error && this.state.error.stack}
              <br />
              <strong>Component Stack:</strong>
              {this.state.errorInfo.componentStack}
            </details>
          )}
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
