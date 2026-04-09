import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreQuote, rank, buildLikeMap } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import ReRecButton from '@/components/ReRecButton';
import styles from '@/styles/Explore.module.css';

export default function ExploreQuotes({ quotes }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <Head>
        <title>Explore Quotes — A Walled Garden</title>
        <meta name="description" content="Quotes that stay with people — words from books, poems, essays and more, shared by the community." />
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Quotes</h1>
          <p className={styles.pageDesc}>Words that stay with people.</p>
        </div>

        <ExploreNav />

        {quotes.length === 0 ? (
          <p className={styles.empty}>No quotes yet.</p>
        ) : (
          <div className={styles.grid}>
            {quotes.map((q) => (
              <article key={q.id} className={styles.card}>
                <div className={styles.cardLink}>
                  <p className={expanded[q.id] ? styles.cardQuoteExpanded : styles.cardQuote}>
                    &ldquo;{q.quote_text}&rdquo;
                  </p>
                  {q.attribution && (
                    <p className={styles.cardAttr}>
                      &mdash; {q.attribution}
                      {q.source && <span>, <em>{q.source}</em></span>}
                    </p>
                  )}
                  <p className={styles.cardMeta} style={{ marginTop: 'var(--space-sm)' }}>
                    Shared by {q.profiles?.display_name || q.profiles?.handle || 'Unknown'}
                  </p>
                  <button className={styles.readMore} onClick={() => toggle(q.id)}>
                    {expanded[q.id] ? 'Show less' : 'Read more'}
                  </button>
                </div>
                <div className={styles.cardActions}>
                  <LikeButton itemId={q.id} itemType="quote" />
                  <SaveButton itemId={q.id} itemType="quote" />
                  {q.profiles?.handle && (
                    <ReRecButton
                      workTitle={`"${q.quote_text.slice(0, 80)}${q.quote_text.length > 80 ? '...' : ''}"`}
                      recommenderHandle={q.profiles.handle}
                      recommenderName={q.profiles.display_name}
                      tab="quotes"
                      itemId={q.id}
                    />
                  )}
                  {q.profiles?.handle && (
                    <Link
                      href={`/${q.profiles.handle}?tab=quotes&item=${q.id}`}
                      className={styles.goToLink}
                    >
                      Go to quote &rarr;
                    </Link>
                  )}
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
    return { props: { quotes: [] }, revalidate: 1 };
  }

  const [
    { data: quotesData },
    { data: followerCounts },
    { data: likesData },
  ] = await Promise.all([
    supabase
      .from('quotes')
      .select('id, quote_text, attribution, source, note, user_id, featured, profiles!user_id(handle, display_name)')
      .limit(200),
    supabase.from('follows').select('following_id'),
    supabase.from('likes').select('item_id').eq('item_type', 'quote'),
  ]);

  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }
  const likeMap = buildLikeMap(likesData);

  const scored = (quotesData || []).map((q) => {
    const enriched = { ...q, owner_followers: followerMap[q.user_id] || 0, like_count: likeMap[q.id] || 0 };
    return { ...enriched, _score: scoreQuote(enriched) };
  });

  const quotes = rank(scored, 'quotes')
    .slice(0, 100)
    .map(({ _score, owner_followers, like_count, featured, user_id, note, ...rest }) => rest);

  return { props: { quotes }, revalidate: 120 };
}
