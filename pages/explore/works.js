import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreWork, rank } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import styles from '@/styles/Explore.module.css';

export default function ExploreWorks({ works }) {
  return (
    <>
      <Head>
        <title>Explore Works — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Works</h1>
          <p className={styles.pageDesc}>Books, poems, essays and curiosities from across the community.</p>
        </div>

        <ExploreNav />

        {works.length === 0 ? (
          <p className={styles.empty}>No works yet.</p>
        ) : (
          <div className={styles.grid}>
            {works.map((w) => (
              <div key={w.id} className={styles.card}>
                <Link
                  href={w.profiles?.handle ? `/${w.profiles.handle}?tab=garden&item=${w.id}` : '#'}
                  className={styles.cardLink}
                >
                  <p className={styles.cardTitle}>{w.title}</p>
                  <p className={styles.cardMeta}>
                    {w.profiles?.display_name || w.profiles?.handle || 'Unknown'}
                    {w.category_name && ` · ${w.category_name}`}
                  </p>
                  {w.commentary && <p className={styles.cardBody}>{w.commentary}</p>}
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
  const [
    { data: worksData },
    { data: followerCounts },
  ] = await Promise.all([
    supabase
      .from('works')
      .select('id, title, commentary, category_id, user_id, featured, profiles!user_id(handle, display_name)')
      .limit(200),
    supabase.from('follows').select('following_id'),
  ]);

  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }

  // Fetch category names for display
  const categoryIds = [...new Set((worksData || []).map((w) => w.category_id))];
  let categoryMap = {};
  if (categoryIds.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds);
    for (const c of (cats || [])) {
      categoryMap[c.id] = c.name;
    }
  }

  const scored = (worksData || []).map((w) => {
    const enriched = { ...w, owner_followers: followerMap[w.user_id] || 0 };
    return {
      ...enriched,
      category_name: categoryMap[w.category_id] || '',
      _score: scoreWork(enriched),
    };
  });

  const works = rank(scored, 'works')
    .slice(0, 100)
    .map(({ _score, owner_followers, featured, user_id, category_id, ...rest }) => rest);

  return { props: { works } };
}
