import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

// Marks that the active session originated from a password-reset link.
// Such a session must NOT grant access to the app — it may only be used to
// set a new password on /update-password. Persisted so it survives reloads
// (the recovery token lives in localStorage and would otherwise re-hydrate
// as a normal login).
const RECOVERY_KEY = 'awg_password_recovery';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isRecovery: false,
  signOut: async () => {},
  endRecovery: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

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

    // A reset-link session that was never completed must stay quarantined
    // across reloads, not silently become a normal login.
    if (typeof window !== 'undefined' && localStorage.getItem(RECOVERY_KEY)) {
      setIsRecovery(true);
    }

    // onAuthStateChange fires INITIAL_SESSION automatically in Supabase JS v2.40+,
    // so we don't need a separate getSession() call (which causes race conditions).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'PASSWORD_RECOVERY') {
          // The reset link just established a session. Flag it so the rest
          // of the app refuses to treat it as a real login.
          if (typeof window !== 'undefined') localStorage.setItem(RECOVERY_KEY, '1');
          setIsRecovery(true);
        }
        if (event === 'SIGNED_OUT') {
          if (typeof window !== 'undefined') localStorage.removeItem(RECOVERY_KEY);
          setIsRecovery(false);
        }

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
    if (typeof window !== 'undefined') localStorage.removeItem(RECOVERY_KEY);
    setUser(null);
    setProfile(null);
    setIsRecovery(false);
  }

  // Called once a new password has actually been set, lifting the quarantine.
  function endRecovery() {
    if (typeof window !== 'undefined') localStorage.removeItem(RECOVERY_KEY);
    setIsRecovery(false);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isRecovery, signOut, endRecovery, refreshProfile: () => user && fetchProfile(user.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
