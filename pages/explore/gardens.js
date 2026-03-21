import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreGarden, rank } from '@/lib/ranking';
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
                  {g.categories && g.categories.length > 0 && (
                    <div className={styles.cardCategories}>
                      {g.categories.map((name, i) => (
                        <span key={i} className={styles.cardCategoryTag}>{name}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function getStaticProps() {
  if (!supabase) {
    return { props: { gardens: [] }, revalidate: 1 };
  }

  const [
    { data: profiles },
    { data: followerCounts },
    { data: workCounts },
    { data: categoryCounts },
    { data: categoryNames },
  ] = await Promise.all([
    supabase.from('profiles').select('id, handle, display_name, bio, featured'),
    supabase.from('follows').select('following_id'),
    supabase.from('works').select('user_id'),
    supabase.from('categories').select('user_id'),
    supabase.from('categories').select('user_id, name, sort_order').order('sort_order', { ascending: true }),
  ]);

  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }
  const worksMap = {};
  for (const w of (workCounts || [])) {
    worksMap[w.user_id] = (worksMap[w.user_id] || 0) + 1;
  }
  const catsMap = {};
  for (const c of (categoryCounts || [])) {
    catsMap[c.user_id] = (catsMap[c.user_id] || 0) + 1;
  }

  const userCategories = {};
  for (const c of (categoryNames || [])) {
    if (!userCategories[c.user_id]) userCategories[c.user_id] = [];
    userCategories[c.user_id].push(c.name);
  }

  const scored = (profiles || []).map((p) => {
    const enriched = {
      ...p,
      follower_count: followerMap[p.id] || 0,
      category_count: catsMap[p.id] || 0,
      work_count: worksMap[p.id] || 0,
    };
    return { ...enriched, categories: userCategories[p.id] || [], _score: scoreGarden(enriched) };
  });

  const gardens = rank(scored, 'gardens').map(({ _score, category_count, work_count, featured, ...rest }) => rest);

  return { props: { gardens }, revalidate: 120 };
}
