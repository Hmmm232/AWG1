import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ExploreNav from '@/components/ExploreNav';
import styles from '@/styles/Explore.module.css';

export default function ExploreGardens({ gardens }) {
  return (
    <>
      <Head>
        <title>Explore Gardens — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Gardens</h1>
          <p className={styles.pageDesc}>Browse gardens planted by our community.</p>
        </div>

        <ExploreNav />

        {gardens.length === 0 ? (
          <p className={styles.empty}>No gardens yet.</p>
        ) : (
          <div className={styles.grid}>
            {gardens.map((g) => (
              <div key={g.id} className={styles.card}>
                <Link href={`/${g.handle}`} className={styles.cardLink}>
                  <p className={styles.cardTitle}>{g.display_name || g.handle}</p>
                  <p className={styles.cardMeta}>
                    @{g.handle}
                    {g.follower_count > 0 && ` · ${g.follower_count} ${g.follower_count === 1 ? 'follower' : 'followers'}`}
                  </p>
                  {g.bio && <p className={styles.cardBody}>{g.bio}</p>}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  // Fetch all profiles with follower counts for ranking
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, handle, display_name, bio, created_at')
    .order('created_at', { ascending: false });

  // Get follower counts in a single query
  const { data: followerCounts } = await supabase
    .from('follows')
    .select('following_id');

  // Count followers per profile
  const countMap = {};
  for (const f of (followerCounts || [])) {
    countMap[f.following_id] = (countMap[f.following_id] || 0) + 1;
  }

  // Attach counts and sort: most followers first, then newest
  const gardens = (profiles || [])
    .map((p) => ({ ...p, follower_count: countMap[p.id] || 0 }))
    .sort((a, b) => b.follower_count - a.follower_count || new Date(b.created_at) - new Date(a.created_at));

  return { props: { gardens } };
}
