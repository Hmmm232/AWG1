/**
 * Client-side write failure logger.
 * Sends errors to /api/log-error so we can track when saves fail in production.
 */
export function logWriteFailure({ action, error, context }) {
  try {
    const payload = {
      action,
      error: typeof error === 'string' ? error : error?.message || 'Unknown error',
      context,
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Fire-and-forget — don't block the UI on logging
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // Logging should never throw
  }
}
