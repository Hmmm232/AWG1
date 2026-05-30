import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Auth.module.css';

export default function UpdatePassword() {
  const router = useRouter();
  const { endRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for Supabase to pick up the session from the URL hash tokens.
    // The PASSWORD_RECOVERY event confirms the reset link was valid.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // The new password is set — lift the recovery quarantine, then revoke the
    // reset-link session everywhere (scope: 'global') so it can never be reused
    // as a login. The user must sign in fresh with their new password.
    endRecovery();
    await supabase.auth.signOut({ scope: 'global' });
    router.push('/signin?reset=success');
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Set a new password</h1>
        <p className={styles.subtitle}>Verifying your reset link...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Set a new password</h1>
      <p className={styles.subtitle}>Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
