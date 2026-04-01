import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

export default function LookupAccount() {
  const [handle, setHandle] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '***' + (local.length > 1 ? local.charAt(local.length - 1) : '');
    const parts = domain.split('.');
    const maskedDomain = parts[0].charAt(0) + '***' + (parts.length > 1 ? '.' + parts.slice(1).join('.') : '');
    return maskedLocal + '@' + maskedDomain;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const cleanHandle = handle.toLowerCase().trim();
    if (!cleanHandle) {
      setError('Please enter a handle.');
      setLoading(false);
      return;
    }

    // Look up the profile to confirm it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', cleanHandle)
      .single();

    if (!profile) {
      setError('No account found with that handle.');
      setLoading(false);
      return;
    }

    // We can't access auth.users from the client, so we just confirm the handle exists
    // and direct them to password reset
    setResult({
      handle: cleanHandle,
      message: `The handle @${cleanHandle} exists. Use the password reset flow with the email you signed up with.`,
    });

    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Find your account — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <h1 className={styles.title}>Find your account</h1>
        <p className={styles.subtitle}>
          Enter your handle to check if your account exists, then reset your password.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {result && (
            <div className={styles.success}>
              {result.message}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="handle">Handle</label>
            <input
              id="handle"
              type="text"
              placeholder="e.g. yourname"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
            {loading ? 'Looking up...' : 'Look up handle'}
          </button>
        </form>

        <p className={styles.footer}>
          Know your email? <Link href="/reset-password">Reset your password</Link>
          {' · '}
          <Link href="/signin">Sign in</Link>
        </p>
      </div>
    </>
  );
}
