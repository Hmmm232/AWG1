import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreWork, rank, buildLikeMap } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import ReRecButton from '@/components/ReRecButton';
import styles from '@/styles/Explore.module.css';

export default function ExploreWorks({ works }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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
                <div className={styles.cardLink}>
                  <p className={styles.cardTitle}>{w.title}</p>
                  <p className={styles.cardMeta}>
                    {w.profiles?.display_name || w.profiles?.handle || 'Unknown'}
                    {w.category_name && ` · ${w.category_name}`}
                  </p>
                  {w.commentary && (
                    <>
                      <p className={expanded[w.id] ? styles.cardBodyExpanded : styles.cardBody}>
                        {w.commentary}
                      </p>
                      <button className={styles.readMore} onClick={() => toggle(w.id)}>
                        {expanded[w.id] ? 'Show less' : 'Read more'}
                      </button>
                    </>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <LikeButton itemId={w.id} itemType="work" />
                  <SaveButton itemId={w.id} itemType="work" />
                  {w.profiles?.handle && (
                    <ReRecButton
                      workTitle={w.title}
                      recommenderHandle={w.profiles.handle}
                      recommenderName={w.profiles.display_name}
                      tab="garden"
                      itemId={w.id}
                    />
                  )}
                  {w.profiles?.handle && (
                    <Link
                      href={`/${w.profiles.handle}?tab=garden&item=${w.id}`}
                      className={styles.goToLink}
                    >
                      Go to work &rarr;
                    </Link>
                  )}
                </div>
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
    return { props: { works: [] }, revalidate: 1 };
  }

  const [
    { data: worksData },
    { data: followerCounts },
    { data: likesData },
  ] = await Promise.all([
    supabase
      .from('works')
      .select('id, title, commentary, category_id, user_id, featured, profiles!user_id(handle, display_name)')
      .limit(200),
    supabase.from('follows').select('following_id'),
    supabase.from('likes').select('item_id').eq('item_type', 'work'),
  ]);

  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }
  const likeMap = buildLikeMap(likesData);

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
    const enriched = { ...w, owner_followers: followerMap[w.user_id] || 0, like_count: likeMap[w.id] || 0 };
    return {
      ...enriched,
      category_name: categoryMap[w.category_id] || '',
      _score: scoreWork(enriched),
    };
  });

  const works = rank(scored, 'works')
    .slice(0, 100)
    .map(({ _score, owner_followers, like_count, featured, user_id, category_id, ...rest }) => rest);

  return { props: { works }, revalidate: 120 };
}
