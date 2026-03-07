import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreCategory, rank } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import styles from '@/styles/Explore.module.css';

export default function ExploreCategories({ categories }) {
  return (
    <>
      <Head>
        <title>Explore Categories — A Walled Garden</title>
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
              <div key={c.id} className={styles.card}>
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
    { data: cats },
    { data: works },
    { data: followerCounts },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, introduction, user_id, featured, profiles!user_id(handle, display_name)'),
    supabase.from('works').select('category_id'),
    supabase.from('follows').select('following_id'),
  ]);

  const worksMap = {};
  for (const w of (works || [])) {
    worksMap[w.category_id] = (worksMap[w.category_id] || 0) + 1;
  }
  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }

  const scored = (cats || []).map((c) => {
    const enriched = {
      ...c,
      works_count: worksMap[c.id] || 0,
      owner_followers: followerMap[c.user_id] || 0,
    };
    return { ...enriched, _score: scoreCategory(enriched) };
  });

  const categories = rank(scored, 'categories').map(({ _score, owner_followers, featured, user_id, ...rest }) => rest);

  return { props: { categories } };
}
