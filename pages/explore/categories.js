import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  // Fetch categories with owner profiles
  const { data: cats } = await supabase
    .from('categories')
    .select('id, name, introduction, created_at, profiles!user_id(handle, display_name)')
    .order('created_at', { ascending: false });

  // Get works counts per category
  const { data: works } = await supabase
    .from('works')
    .select('category_id');

  const countMap = {};
  for (const w of (works || [])) {
    countMap[w.category_id] = (countMap[w.category_id] || 0) + 1;
  }

  // Attach counts and sort: most works first, then newest
  const categories = (cats || [])
    .map((c) => ({ ...c, works_count: countMap[c.id] || 0 }))
    .sort((a, b) => b.works_count - a.works_count || new Date(b.created_at) - new Date(a.created_at));

  return { props: { categories } };
}
