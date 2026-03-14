import { supabase } from './supabase';

// Daily creation limits per user
const DAILY_LIMITS = {
  categories: 20,
  works: 50,
  quotes: 50,
  rerecs: 50,
};

/**
 * Check if the user has exceeded their daily creation limit for a content type.
 * Returns { allowed: true } or { allowed: false, message: '...' }
 */
export async function checkDailyLimit(userId, table) {
  const limit = DAILY_LIMITS[table];
  if (!limit) return { allowed: true };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', todayStart.toISOString());

  if (error) {
    // If we can't check, allow the action — the DB-level policy will catch abuse
    return { allowed: true };
  }

  if (count >= limit) {
    return {
      allowed: false,
      message: `Daily limit reached — you can add up to ${limit} ${table} per day. This resets at midnight.`,
    };
  }

  return { allowed: true };
}
