import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy singleton — avoids crashing at build time when env vars aren't set
let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      );
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Proxy that forwards property access to the lazily-created Supabase client.
// Methods are explicitly bound to the real client so that internal `this`
// references resolve correctly (e.g. auth header resolution in PostgREST).
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
