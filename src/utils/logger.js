/**
 * Production-safe logger utility
 * Replaces console.log statements to prevent information disclosure in production
 */

const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

export const logger = {
  /**
   * Development-only logging
   * @param {...any} args - Arguments to log
   */
  log: (isDevelopment || isTest) ? console.log : () => {},
  
  /**
   * Development-only debug logging  
   * @param {...any} args - Arguments to log
   */
  debug: (isDevelopment || isTest) ? console.debug : () => {},
  
  /**
   * Development-only warnings
   * @param {...any} args - Arguments to log
   */
  warn: (isDevelopment || isTest) ? console.warn : () => {},
  
  /**
   * Always log errors (production safe)
   * @param {...any} args - Arguments to log
   */
  error: console.error,
  
  /**
   * Always log important information (production safe)
   * @param {...any} args - Arguments to log
   */
  info: console.info,
  
  /**
   * Performance timing (development only)
   * @param {string} label - Timer label
   */
  time: (isDevelopment || isTest) ? console.time : () => {},
  
  /**
   * End performance timing (development only)
   * @param {string} label - Timer label
   */
  timeEnd: (isDevelopment || isTest) ? console.timeEnd : () => {}
};

/**
 * Security-focused logging for audit trails
 */
export const auditLogger = {
  /**
   * Log authentication events
   * @param {string} event - Auth event type
   * @param {Object} data - Event data (sanitized)
   */
  auth: (event, data) => {
    console.info('[AUTH]', event, {
      timestamp: new Date().toISOString(),
      userId: data?.userId || 'unknown',
      // Never log passwords, tokens, or sensitive data
      event: event
    });
  },
  
  /**
   * Log admin actions for compliance
   * @param {string} action - Admin action taken  
   * @param {Object} data - Action data (sanitized)
   */
  admin: (action, data) => {
    console.info('[ADMIN]', action, {
      timestamp: new Date().toISOString(),
      userId: data?.userId || 'unknown',
      action: action,
      resourceId: data?.resourceId || null
    });
  }
};

export default logger;