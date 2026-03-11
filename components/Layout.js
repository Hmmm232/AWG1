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

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
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
          <Link href="/search" className={styles.navLink}>
            Search
          </Link>
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
              <Link href="/saved" className={styles.navLink}>
                Saved
              </Link>
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

      {/* Mobile menu — always rendered, animated via CSS */}
      <div
        className={`${styles.mobileBackdrop} ${menuOpen ? styles.mobileBackdropOpen : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          <div className={styles.mobileMenuHeader}>
            <span className={styles.mobileMenuTitle}>Menu</span>
            <button
              className={styles.mobileClose}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>

          <div className={styles.mobileMenuDivider} />

          <nav className={styles.mobileNav}>
            <Link href="/search" className={styles.mobileLink}>
              <span className={styles.mobileLinkIcon}>&#8981;</span>
              Search
            </Link>
            <Link href="/explore" className={styles.mobileLink}>
              <span className={styles.mobileLinkIcon}>&#10047;</span>
              Explore
            </Link>
            {loading ? null : user ? (
              <>
                {profile?.handle && (
                  <Link href={`/${profile.handle}`} className={styles.mobileLink}>
                    <span className={styles.mobileLinkIcon}>&#9672;</span>
                    My Garden
                  </Link>
                )}
                <Link href="/saved" className={styles.mobileLink}>
                  <span className={styles.mobileLinkIcon}>&#9733;</span>
                  Saved
                </Link>
                <Link href="/settings" className={styles.mobileLink}>
                  <span className={styles.mobileLinkIcon}>&#9881;</span>
                  Settings
                </Link>
                <div className={styles.mobileMenuDivider} />
                <button onClick={handleSignOut} className={styles.mobileLinkBtn}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className={styles.mobileLink}>
                  <span className={styles.mobileLinkIcon}>&#10132;</span>
                  Sign in
                </Link>
                <div className={styles.mobileMenuDivider} />
                <Link href="/signup" className={styles.mobileCta}>
                  Create your garden
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <span>A Walled Garden</span>
        <span className={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </span>
      </footer>
    </div>
  );
}
