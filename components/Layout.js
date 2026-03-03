import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Layout.module.css';

export default function Layout({ children }) {
  const { user, profile, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Close menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          A Walled Garden
        </Link>

        {/* Desktop nav links */}
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
              <button onClick={signOut} className={styles.signOutBtn}>
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

        {/* Mobile hamburger button */}
        {!loading && (
          <button
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {user ? (
            <>
              {profile?.handle && (
                <Link href={`/${profile.handle}`} className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                  My Garden
                </Link>
              )}
              <Link href="/settings" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                Settings
              </Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className={styles.mobileMenuBtn}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link href="/signup" className={styles.mobileMenuLink} onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}

      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        A Walled Garden
      </footer>
    </div>
  );
}
