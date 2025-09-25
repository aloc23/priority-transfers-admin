/**
 * Timeout utility for wrapping async operations
 */

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} label - Operation name for error messages
 * @returns {Promise} Promise that resolves/rejects with timeout
 */
export async function withTimeout(promise, ms, label = "operation") {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms}ms`)),
      ms
    );
  });

  try {
    // ⚡ Return whichever finishes first
    const result = await Promise.race([promise, timeout]);

    // ✅ Supabase can return [] (empty array) → that's valid, not an error
    return result;
  } finally {
    // ✅ Always clear timeout
    clearTimeout(timeoutId);
  }
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