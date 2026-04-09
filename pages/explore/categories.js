import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreCategory, rank, buildLikeMap } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
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
          <p className={styles.pageDesc}>Curated reading lists and collections from across the community.</p>
        </div>

        <ExploreNav />

        {categories.length === 0 ? (
          <p className={styles.empty}>No categories yet.</p>
        ) : (
          <div className={styles.grid}>
            {categories.map((c) => (
              <article key={c.id} className={styles.card}>
                <Link
                  href={c.profiles?.handle ? `/${c.profiles.handle}?tab=garden&item=${c.id}` : '#'}
                  className={styles.cardLink}
                >
                  <p className={styles.cardTitle}>{c.name}</p>
                  <p className={styles.cardMeta}>
                    {c.profiles?.display_name || c.profiles?.handle || 'Unknown'}
                    {c.works_count > 0 && ` · ${c.works_count} ${c.works_count === 1 ? 'work' : 'works'}`}
                  </p>
                  {c.introduction && <p className={styles.cardBodyItalic}>{c.introduction}</p>}
                </Link>
                <div className={styles.cardActions}>
                  <LikeButton itemId={c.id} itemType="category" />
                  <SaveButton itemId={c.id} itemType="category" />
                </div>
              </article>
            ))}
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
    { data: works },
    { data: followerCounts },
    { data: likesData },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, introduction, user_id, featured, profiles!user_id(handle, display_name)'),
    supabase.from('works').select('category_id'),
    supabase.from('follows').select('following_id'),
    supabase.from('likes').select('item_id').eq('item_type', 'category'),
  ]);

  const worksMap = {};
  for (const w of (works || [])) {
    worksMap[w.category_id] = (worksMap[w.category_id] || 0) + 1;
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
    return { ...enriched, _score: scoreCategory(enriched) };
  });

  const categories = rank(scored, 'categories').map(({ _score, owner_followers, like_count, featured, user_id, ...rest }) => rest);

  return { props: { categories }, revalidate: 120 };
}
