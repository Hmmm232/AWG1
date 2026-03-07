import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreQuote, rank } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import styles from '@/styles/Explore.module.css';

export default function ExploreQuotes({ quotes }) {
  return (
    <>
      <Head>
        <title>Explore Quotes — A Walled Garden</title>
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
              <div key={q.id} className={styles.card}>
                <Link
                  href={q.profiles?.handle ? `/${q.profiles.handle}?tab=quotes&item=${q.id}` : '#'}
                  className={styles.cardLink}
                >
                  <p className={styles.cardQuote}>&ldquo;{q.quote_text}&rdquo;</p>
                  {q.attribution && (
                    <p className={styles.cardAttr}>
                      &mdash; {q.attribution}
                      {q.source && <span>, <em>{q.source}</em></span>}
                    </p>
                  )}
                  <p className={styles.cardMeta} style={{ marginTop: 'var(--space-sm)' }}>
                    Shared by {q.profiles?.display_name || q.profiles?.handle || 'Unknown'}
                  </p>
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
    { data: quotesData },
    { data: followerCounts },
  ] = await Promise.all([
    supabase
      .from('quotes')
      .select('id, quote_text, attribution, source, note, user_id, featured, profiles!user_id(handle, display_name)')
      .limit(200),
    supabase.from('follows').select('following_id'),
  ]);

  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }

  const scored = (quotesData || []).map((q) => {
    const enriched = { ...q, owner_followers: followerMap[q.user_id] || 0 };
    return { ...enriched, _score: scoreQuote(enriched) };
  });

  const quotes = rank(scored, 'quotes')
    .slice(0, 100)
    .map(({ _score, owner_followers, featured, user_id, note, ...rest }) => rest);

  return { props: { quotes } };
}
