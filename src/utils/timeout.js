/**
 * Timeout utility for wrapping async operations
 */

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operation - Operation name for error messages
 * @returns {Promise} Promise that resolves/rejects with timeout
 */
export function withTimeout(promise, timeoutMs, operation = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}

/**
 * Network error detection utility
 * @param {Error} error - Error to check
 * @returns {boolean} True if it's a network-related error
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';
  
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('offline') ||
    code.includes('network') ||
    code.includes('timeout') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && message.includes('failed to fetch')
  );
}