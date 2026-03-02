import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Layout.module.css';

export default function Layout({ children }) {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          A Walled Garden
        </Link>
        <div className={styles.navLinks}>
          {loading ? null : user ? (
            <>
              {profile?.handle && (
                <Link href={`/${profile.handle}`} className={styles.navLink}>
                  My Garden
                </Link>
              )}
              <Link href="/settings" className={styles.navLink}>
                Settings
              </Link>
              <button onClick={signOut} className="btn btn-primary btn-small">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className={styles.navLink}>
                Sign in
              </Link>
              <Link href="/signup" className={`btn btn-primary btn-small`}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        A Walled Garden
      </footer>
    </div>
  );
}
