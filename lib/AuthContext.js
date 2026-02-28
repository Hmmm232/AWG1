import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      // Only update profile if we got valid data back
      if (data && !error) {
        setProfile(data);
      }
    } catch (err) {
      // Silently handle AbortError and network issues —
      // keep existing profile data rather than wiping it
      console.warn('Profile fetch failed:', err.name);
    }
  }

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange fires INITIAL_SESSION automatically in Supabase JS v2.40+,
    // so we don't need a separate getSession() call (which causes race conditions).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        // Always clear loading — don't block on profile fetch
        setLoading(false);
        if (session?.user) {
          // Fire-and-forget: profile loads in the background
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile: () => user && fetchProfile(user.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
