import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreCategory, rank, buildLikeMap } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import { OrnateRule } from '@/components/CardOrnaments';
import styles from '@/styles/Explore.module.css';

export default function ExploreCategories({ categories }) {
  return (
    <>
      <Head>
        <title>Explore Categories — A Walled Garden</title>
        <meta name="description" content="Explore curated reading lists and collections from across the A Walled Garden community." />
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageDesc}>
            &ldquo;We walk the corridors, searching the shelves and rearranging them, looking for lines of meaning amid leagues of cacophony and incoherence.&rdquo;
            <span className={styles.pageDescAttr}>&mdash; Borges</span>
          </p>
        </div>

        <ExploreNav />

        {categories.length === 0 ? (
          <p className={styles.empty}>No categories yet.</p>
        ) : (
          <div className={styles.grid}>
            {categories.map((c) => {
              const owner = c.profiles?.display_name || c.profiles?.handle || 'Unknown';
              const sample = (c.sample || []).slice(0, 5);
              const worksCount = c.works_count ?? 0;
              const href = c.profiles?.handle
                ? `/${c.profiles.handle}?tab=garden&item=${c.id}`
                : '#';
              return (
                <article key={c.id} className={styles.categoryCard}>
                  <Link href={href} className={styles.categoryCardBody}>
                    <div className={styles.eyebrow}>{worksCount} works &middot; {owner}</div>
                    <p className={styles.cardTitle}>{c.name}</p>
                    {c.introduction && (
                      <p className={styles.categoryNote}>{c.introduction}</p>
                    )}
                    <OrnateRule className={styles.ornateRule} />
                    <div className={styles.eyebrow}>Contents</div>
                    <ul className={styles.categoryContents}>
                      {sample.length > 0 ? (
                        sample.map((t, i) => (
                          <li key={i} className={styles.categoryContentsRow}>
                            <span className={styles.categoryContentsNum}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className={styles.categoryContentsTitle}>{t}</span>
                          </li>
                        ))
                      ) : (
                        <li className={styles.categoryContentsEmpty}>
                          &mdash; empty plot &mdash;
                        </li>
                      )}
                    </ul>
                    {worksCount > 5 && (
                      <span className={styles.moreIndicator}>+{worksCount - 5} more</span>
                    )}
                  </Link>
                  <div className={styles.cardActions}>
                    <LikeButton itemId={c.id} itemType="category" />
                    <SaveButton itemId={c.id} itemType="category" />
                  </div>
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
    return { props: { categories: [] }, revalidate: 1 };
  }

  const [
    { data: cats },
    { data: workRows },
    { data: followerCounts },
    { data: likesData },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, introduction, user_id, featured, profiles!user_id(handle, display_name)'),
    supabase.from('works').select('id, title, category_id, sort_order').order('sort_order', { ascending: true }),
    supabase.from('follows').select('following_id'),
    supabase.from('likes').select('item_id').eq('item_type', 'category'),
  ]);

  const worksMap = {};
  const titlesPerCategory = {};
  for (const w of (workRows || [])) {
    worksMap[w.category_id] = (worksMap[w.category_id] || 0) + 1;
    if (w.category_id && w.title) {
      if (!titlesPerCategory[w.category_id]) titlesPerCategory[w.category_id] = [];
      if (titlesPerCategory[w.category_id].length < 6) {
        titlesPerCategory[w.category_id].push(w.title);
      }
    }
  }
  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }
  const likeMap = buildLikeMap(likesData);

  const scored = (cats || []).map((c) => {
    const enriched = {
      ...c,
      works_count: worksMap[c.id] || 0,
      owner_followers: followerMap[c.user_id] || 0,
      like_count: likeMap[c.id] || 0,
    };
    return {
      ...enriched,
      sample: titlesPerCategory[c.id] || [],
      _score: scoreCategory(enriched),
    };
  });

  const categories = rank(scored, 'categories').map(({ _score, owner_followers, like_count, featured, user_id, ...rest }) => rest);

  return { props: { categories }, revalidate: 120 };
}
