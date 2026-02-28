import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the Supabase client directly — no Proxy, no lazy wrapper.
// NEXT_PUBLIC_ env vars are inlined by Next.js at build time.
// The try/catch handles local builds where env vars aren't set.
let _supabase;
try {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch {
  // Build-time without env vars — client will be null.
  // At runtime on Vercel the env vars are always present.
  _supabase = null;
}

export const supabase = _supabase;
