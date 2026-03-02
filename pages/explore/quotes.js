import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, quote_text, attribution, source, created_at, profiles!user_id(handle, display_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  return { props: { quotes: quotes || [] } };
}
