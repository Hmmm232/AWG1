import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div>
      <section className={styles.hero}>
        <h1 className={styles.title}>A Walled Garden</h1>
        <p className={styles.subtitle}>
          A place to gather the works that have shaped you — books, essays, poems,
          anything worth remembering — and share them with others.
        </p>
        <div className={styles.cta}>
          {user ? (
            <Link href={profile?.handle ? `/${profile.handle}` : '/settings'} className="btn btn-primary">
              Go to your garden
            </Link>
          ) : (
            <>
              <Link href="/signup" className="btn btn-primary">
                Create your garden
              </Link>
              <Link href="/signin" className="btn btn-secondary">
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      <div className={styles.divider} />

      <section className={styles.about}>
        <h2>What is this?</h2>
        <p>
          Everyone has a personal canon — the works that changed how they think,
          the quotes they return to, the recommendations they trust. A Walled Garden
          gives those collections a home.
        </p>
        <p>
          Create categories, add works with your own commentary, collect your favourite
          quotes, and share recommendations from people you admire.
        </p>
      </section>
    </div>
  );
}
