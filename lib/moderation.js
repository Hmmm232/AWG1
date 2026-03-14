/**
 * Check content against AI moderation before saving.
 * Returns { allowed: true } or { allowed: false, reason: '...' }
 */
export async function moderateContent(text) {
  if (!text || text.trim().length < 5) {
    return { allowed: true };
  }

  try {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
