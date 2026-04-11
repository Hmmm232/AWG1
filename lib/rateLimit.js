/**
 * Simple in-memory rate limiter for API routes.
 *
 * On Vercel serverless, each warm function instance maintains its own map.
 * This won't catch abuse spread across cold starts, but it stops sustained
 * hammering from a single IP — which is the main threat vector.
 */

const windows = new Map();

const CLEANUP_INTERVAL = 60_000; // purge stale entries every 60s
let lastCleanup = Date.now();

function cleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of windows) {
    if (now - entry.start > windowMs) {
      windows.delete(key);
    }
  }
}

/**
 * Check if a request should be rate-limited.
 *
 * @param {string} key - identifier (usually IP + route)
 * @param {number} maxRequests - max requests per window
 * @param {number} windowMs - window size in milliseconds
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function rateLimit(key, maxRequests, windowMs) {
  cleanup(windowMs);

  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || now - entry.start > windowMs) {
    windows.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Get the client IP from a Next.js API request.
 */
export function getClientIp(req) {
  return req.headers['x-real-ip']
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || 'unknown';
}
