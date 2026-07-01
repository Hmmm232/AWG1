import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { isReservedHandle } from '@/lib/reservedHandles';
import styles from '@/styles/Auth.module.css';

export default function SignUp() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate handle: lowercase letters, numbers, hyphens only, 2-30 chars
    const cleanHandle = handle.toLowerCase().trim();
    if (cleanHandle.length < 2 || cleanHandle.length > 30) {
      setError('Handle must be between 2 and 30 characters.');
      return;
    }

    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleanHandle)) {
      setError('Handle must start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    if (isReservedHandle(cleanHandle)) {
      setError('That handle is reserved. Please choose another.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      // Check if handle is already taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', cleanHandle)
        .single();

      if (existing) {
        setError('That handle is already taken.');
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            handle: cleanHandle,
            display_name: displayName.trim() || cleanHandle,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Redirect to their new garden
      router.push(`/${cleanHandle}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create your garden</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            type="text"
            placeholder="Your Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="handle">Handle</label>
          <input
            id="handle"
            type="text"
            placeholder="This is your @"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
          />
        </div>

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className={styles.footer}>
        By creating an account you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <p className={styles.footer}>
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>
    </div>
  );
}
