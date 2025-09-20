/**
 * Demo mode detection utility
 * Demo mode is explicitly enabled via VITE_DEMO_MODE environment variable
 */

export function isDemoModeEnabled() {
  // Check environment variable first - explicit demo mode
  const envDemoMode = import.meta.env.VITE_DEMO_MODE;
  return envDemoMode === 'true' || envDemoMode === true;
}

/**
 * Check if we should use localStorage/sessionStorage
 * Only use local storage in demo mode
 */
export function shouldUseLocalStorage() {
  return isDemoModeEnabled();
}

/**
 * Safe localStorage utility - only works in demo mode
 */
export const demoStorage = {
  getItem: (key) => {
    if (!isDemoModeEnabled()) {
      console.warn(`Attempted to access localStorage in production mode for key: ${key}`);
      return null;
    }
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage access failed, using sessionStorage fallback:', error);
      try {
        return sessionStorage.getItem(key);
      } catch (sessionError) {
        console.warn('sessionStorage access also failed:', sessionError);
        return null;
      }
    }
  },
  
  setItem: (key, value) => {
    if (!isDemoModeEnabled()) {
      console.warn(`Attempted to write to localStorage in production mode for key: ${key}`);
      return;
    }
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage write failed, using sessionStorage fallback:', error);
      try {
        sessionStorage.setItem(key, value);
      } catch (sessionError) {
        console.warn('sessionStorage write also failed:', sessionError);
      }
    }
  },
  
  removeItem: (key) => {
    if (!isDemoModeEnabled()) {
      console.warn(`Attempted to remove from localStorage in production mode for key: ${key}`);
      return;
    }
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage remove failed, using sessionStorage fallback:', error);
      try {
        sessionStorage.removeItem(key);
      } catch (sessionError) {
        console.warn('sessionStorage remove also failed:', sessionError);
      }
    }
  }
};