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
          A Walled Garden<span className={styles.logoSuffix}>.org</span>
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
              <span className={styles.mobileLinkIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
              </span>
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
                  <span className={styles.mobileLinkIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </span>
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
        <nav className={styles.footerNav}>
          <Link href="/explore">Explore</Link>
          <Link href="/search">Search</Link>
          <Link href="/about">About</Link>
        </nav>
        <nav className={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
