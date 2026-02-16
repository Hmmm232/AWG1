import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Home.module.css';

export default function Home({ gardens }) {
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

      {gardens && gardens.length > 0 && (
        <>
          <div className={styles.divider} />
          <section className={styles.gardens}>
            <div className={styles.gardensHeader}>
              <h2>Gardens</h2>
            </div>
            <ul className={styles.gardenGrid}>
              {gardens.map((g) => (
                <li key={g.id} className={styles.gardenCard}>
                  <Link href={`/${g.handle}`} className={styles.gardenLink}>
                    <span className={styles.gardenName}>{g.display_name || g.handle}</span>
                    <span className={styles.gardenHandle}>@{g.handle}</span>
                    {g.bio && <span className={styles.gardenBio}>{g.bio}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

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

export async function getServerSideProps() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, handle, display_name, bio')
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    props: {
      gardens: profiles || [],
    },
  };
}
