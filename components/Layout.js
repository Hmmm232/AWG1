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

  // Close menu on escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          A Walled Garden
        </Link>

        {/* Desktop nav links */}
        <div className={styles.navLinks}>
          <Link href="/explore" className={styles.navLink}>
            Explore
          </Link>
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

        {/* Hamburger button (mobile only) */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.hamburgerBar} ${menuOpen ? styles.hamburgerOpen : ''}`} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/explore" className={styles.mobileLink}>
            Explore
          </Link>
          {loading ? null : user ? (
            <>
              {profile?.handle && (
                <Link href={`/${profile.handle}`} className={styles.mobileLink}>
                  My Garden
                </Link>
              )}
              <Link href="/settings" className={styles.mobileLink}>
                Settings
              </Link>
              <button onClick={handleSignOut} className={styles.mobileLink}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className={styles.mobileLink}>
                Sign in
              </Link>
              <Link href="/signup" className={styles.mobileLink}>
                Create your garden
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
