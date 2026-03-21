import { supabase } from './supabase';

/**
 * Check content against AI moderation before saving.
 * Returns { allowed: true } or { allowed: false, reason: '...' }
 */
export async function moderateContent(text) {
  if (!text || text.trim().length < 5) {
    return { allowed: true };
  }

  try {
    // Pass auth token so the API can verify the caller
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      // If the moderation endpoint is unreachable, allow content through
      return { allowed: true };
    }

    return await res.json();
  } catch {
    // Network error — fail open
    return { allowed: true };
  }
}

/**
 * Moderate multiple fields at once (e.g. title + commentary).
 * Concatenates non-empty fields and checks them together.
 */
export async function moderateFields(fields) {
  const text = Object.values(fields).filter(Boolean).join('\n\n');
  return moderateContent(text);
}
