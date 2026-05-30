import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Auth.module.css';

const RESET_NOTICES = {
  success: 'Your password has been updated. Please sign in with your new password.',
  incomplete: 'For your security, your reset link expired before a new password was set. Request a new link if you still need to reset.',
};

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const notice = RESET_NOTICES[router.query.reset];

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Defensively clear any leftover recovery quarantine before a real login.
    if (typeof window !== 'undefined') localStorage.removeItem('awg_password_recovery');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Fetch the user's profile to get their handle for redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('handle')
      .eq('id', data.user.id)
      .single();

    if (profile?.handle) {
      router.push(`/${profile.handle}`);
    } else {
      router.push('/settings');
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your garden.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {notice && <div className={styles.success}>{notice}</div>}
        {error && <div className={styles.error}>{error}</div>}

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

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className={styles.footer}>
        <Link href="/reset-password">Forgot your password?</Link>
        {' · '}
        <Link href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
