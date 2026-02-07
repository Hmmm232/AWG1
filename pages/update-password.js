import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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

    // Redirect to sign in
    router.push('/signin');
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
            placeholder="At least 6 characters"
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
