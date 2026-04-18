import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreGarden, rank } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import { Leaf } from '@/components/CardOrnaments';
import styles from '@/styles/Explore.module.css';

export default function ExploreGardens({ gardens }) {
  return (
    <>
      <Head>
        <title>Explore Gardens — A Walled Garden</title>
        <meta name="description" content="Browse gardens planted by our community — personal collections of favourite books, essays, poems and more." />
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
            {gardens.map((g) => {
              const name = g.display_name || g.handle;
              const cats = (g.categories || []).slice(0, 5);
              const totalCats = (g.categories || []).length;
              return (
                <article key={g.id} className={styles.gardenCard}>
                  <Link href={`/${g.handle}`} className={styles.gardenCardBody}>
                    <div className={styles.gardenHeader}>
                      <span className={styles.gardenName}>{name}</span>
                      <span className={styles.gardenHandle}>@{g.handle}</span>
                    </div>
                    {g.bio && <p className={styles.gardenBio}>{g.bio}</p>}
                    {cats.length > 0 && (
                      <>
                        <div className={styles.eyebrow}>A peek inside</div>
                        <ul className={styles.gardenPeek}>
                          {cats.map((c, i) => (
                            <li key={i} className={styles.gardenPeekRow}>
                              <span className={styles.gardenPeekNum}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span className={styles.gardenPeekName}>{c}</span>
                              <Leaf className={styles.leaf} />
                            </li>
                          ))}
                        </ul>
                        {totalCats > 5 && (
                          <span className={styles.moreIndicator}>+{totalCats - 5} more</span>
                        )}
                      </>
                    )}
                    <div className={styles.gardenFooter}>
                      <span className={styles.gardenCounts}>
                        <b>{g.works_count ?? 0}</b>&middot;works
                        &nbsp;
                        <b>{g.quotes_count ?? 0}</b>&middot;quotes
                      </span>
                      <span className={styles.readArrow}>visit &rarr;</span>
                    </div>
                  </Link>
                </article>
              );
            })}
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
    { data: quoteCounts },
  ] = await Promise.all([
    supabase.from('profiles').select('id, handle, display_name, bio, featured'),
    supabase.from('follows').select('following_id'),
    supabase.from('works').select('user_id'),
    supabase.from('categories').select('user_id'),
    supabase.from('categories').select('user_id, name, sort_order').order('sort_order', { ascending: true }),
    supabase.from('quotes').select('user_id'),
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
  const quotesMap = {};
  for (const q of (quoteCounts || [])) {
    quotesMap[q.user_id] = (quotesMap[q.user_id] || 0) + 1;
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
    return {
      ...enriched,
      categories: userCategories[p.id] || [],
      works_count: worksMap[p.id] || 0,
      quotes_count: quotesMap[p.id] || 0,
      _score: scoreGarden(enriched),
    };
  });

  const gardens = rank(scored, 'gardens').map(({ _score, category_count, work_count, follower_count, featured, ...rest }) => rest);

  return { props: { gardens }, revalidate: 120 };
}
