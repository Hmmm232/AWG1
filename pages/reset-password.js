import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Reset your password</h1>
      <p className={styles.subtitle}>We'll send you a link to reset it.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            Check your email for a password reset link.
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className={styles.footer}>
        <Link href="/signin">Back to sign in</Link>
      </p>
    </div>
  );
}
