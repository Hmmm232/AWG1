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

  const isActive = (href) => router.pathname === href;
  const isGardenActive =
    profile?.handle && router.asPath === `/${profile.handle}`;

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
            <span className={styles.mobileBrand}>
              <svg className={styles.mobileBrandMark} width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 4c-1 3-1.5 6.5-1 10.5.5 4 1.8 7.5 3 10.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M16 8c-3-2-6.5-2.5-9-1.5 1.5 2.5 4.5 4 8 4.5" fill="currentColor" opacity="0.85"/>
                <path d="M16 8c3-2 6.5-2.5 9-1.5-1.5 2.5-4.5 4-8 4.5" fill="currentColor" opacity="0.6"/>
                <path d="M15.5 14c-3.5-1-7-0.5-9.5 1 2 2 5 3 9 2.5" fill="currentColor" opacity="0.7"/>
                <path d="M16.5 14c3.5-1 7-0.5 9.5 1-2 2-5 3-9 2.5" fill="currentColor" opacity="0.5"/>
                <path d="M16 20c-2.5 0-5 0.5-7 2 2 1 4.5 1 7-0.5" fill="currentColor" opacity="0.6"/>
                <path d="M16 20c2.5 0 5 0.5 7 2-2 1-4.5 1-7-0.5" fill="currentColor" opacity="0.4"/>
              </svg>
              <span className={styles.mobileBrandText}>A Walled Garden</span>
            </span>
            <button
              className={styles.mobileClose}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </button>
          </div>

          <nav className={styles.mobileNav}>
            <Link href="/search" className={`${styles.mobileLink} ${isActive('/search') ? styles.mobileLinkActive : ''}`}>
              <span className={styles.mobileLinkIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
              </span>
              Search
              <span className={styles.mobileLinkChevron} aria-hidden="true">&#8250;</span>
            </Link>
            <Link href="/explore" className={`${styles.mobileLink} ${isActive('/explore') ? styles.mobileLinkActive : ''}`}>
              <span className={styles.mobileLinkIcon}>&#10047;</span>
              Explore
              <span className={styles.mobileLinkChevron} aria-hidden="true">&#8250;</span>
            </Link>
            {loading ? null : user ? (
              <>
                {profile?.handle && (
                  <Link href={`/${profile.handle}`} className={`${styles.mobileLink} ${isGardenActive ? styles.mobileLinkActive : ''}`}>
                    <span className={styles.mobileLinkIcon}>&#9672;</span>
                    My Garden
                    <span className={styles.mobileLinkChevron} aria-hidden="true">&#8250;</span>
                  </Link>
                )}
                <Link href="/saved" className={`${styles.mobileLink} ${isActive('/saved') ? styles.mobileLinkActive : ''}`}>
                  <span className={styles.mobileLinkIcon}>&#9733;</span>
                  Saved
                  <span className={styles.mobileLinkChevron} aria-hidden="true">&#8250;</span>
                </Link>
                <Link href="/settings" className={`${styles.mobileLink} ${isActive('/settings') ? styles.mobileLinkActive : ''}`}>
                  <span className={styles.mobileLinkIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  </span>
                  Settings
                  <span className={styles.mobileLinkChevron} aria-hidden="true">&#8250;</span>
                </Link>
                <div className={styles.mobileMenuDivider} />
                <button onClick={handleSignOut} className={styles.mobileLinkBtn}>
                  <span className={styles.mobileLinkBtnIcon} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </span>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className={`${styles.mobileLink} ${isActive('/signin') ? styles.mobileLinkActive : ''}`}>
                  <span className={styles.mobileLinkIcon}>&#10132;</span>
                  Sign in
                  <span className={styles.mobileLinkChevron} aria-hidden="true">&#8250;</span>
                </Link>
                <Link href="/signup" className={styles.mobileCta}>
                  Create your garden
                </Link>
              </>
            )}
          </nav>

          <div className={styles.mobileMenuFooter} aria-hidden="true">
            <span className={styles.mobileMenuFleuron}>&#10086;</span>
            <span className={styles.mobileMenuTagline}>A quiet place to keep what you love</span>
          </div>
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
