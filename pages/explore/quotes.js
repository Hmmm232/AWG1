import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { scoreQuote, rank, buildLikeMap } from '@/lib/ranking';
import ExploreNav from '@/components/ExploreNav';
import LikeButton from '@/components/LikeButton';
import ShareButton from '@/components/ShareButton';
import ReRecButton from '@/components/ReRecButton';
import { OrnateRule } from '@/components/CardOrnaments';
import styles from '@/styles/Explore.module.css';

export default function ExploreQuotes({ quotes }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState({});
  const [overflowing, setOverflowing] = useState({});
  const textRefs = useRef({});

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const checkOverflows = useCallback(() => {
    const next = {};
    for (const [id, el] of Object.entries(textRefs.current)) {
      if (el) next[id] = el.scrollHeight > el.clientHeight;
    }
    setOverflowing(next);
  }, []);

  useEffect(() => {
    checkOverflows();
    window.addEventListener('resize', checkOverflows);
    return () => window.removeEventListener('resize', checkOverflows);
  }, [checkOverflows]);

  // Scroll to and highlight a specific quote when ?item= is present
  useEffect(() => {
    const { item } = router.query;
    if (item) {
      setTimeout(() => {
        const el = document.getElementById(item);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('share-highlight');
          setTimeout(() => el.classList.remove('share-highlight'), 3000);
        }
      }, 150);
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>Explore Quotes — A Walled Garden</title>
        <meta name="description" content="Quotes that stay with people — words from books, poems, essays and more, shared by the community." />
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Quotes</h1>
          <p className={styles.pageDesc}>
            &ldquo;I quote others only in order the better to express myself.&rdquo;
            <span className={styles.pageDescAttr}>&mdash; Michel de Montaigne</span>
          </p>
        </div>

        <ExploreNav />

        {quotes.length === 0 ? (
          <p className={styles.empty}>No quotes yet.</p>
        ) : (
          <div className={styles.listGrid}>
            {quotes.map((q) => {
              const curator = q.profiles?.display_name || q.profiles?.handle || 'Unknown';
              return (
                <article key={q.id} id={q.id} className={styles.quoteCard}>
                  <div className={styles.quoteCardBody}>
                    <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
                    <blockquote
                      ref={(el) => { textRefs.current[q.id] = el; }}
                      className={expanded[q.id] ? styles.quoteTextExpanded : styles.quoteText}
                    >
                      {q.quote_text}
                    </blockquote>
                    {!expanded[q.id] && overflowing[q.id] && (
                      <button className={styles.readMore} onClick={() => toggle(q.id)}>
                        Read more
                      </button>
                    )}
                    {expanded[q.id] && (
                      <button className={styles.readMore} onClick={() => toggle(q.id)}>
                        Show less
                      </button>
                    )}
                    <OrnateRule className={styles.ornateRule} />
                    {(q.attribution || q.source) && (
                      <div className={styles.quoteAttr}>
                        {q.attribution && <>&mdash; <b>{q.attribution}</b></>}
                        {q.attribution && q.source && <span className={styles.quoteAttrSep}> / </span>}
                        {q.source && <em className={styles.quoteSourceInline}>{q.source}</em>}
                      </div>
                    )}
                    <div className={styles.quoteFooter}>
                      <div className={styles.eyebrow}>
                        saved by @{q.profiles?.handle || 'someone'}
                      </div>
                      <div className={styles.quoteFooterActions}>
                        <LikeButton itemId={q.id} itemType="quote" />
                        <ShareButton
                          handle={q.profiles?.handle}
                          tab="quotes"
                          itemId={q.id}
                        />
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
                    </div>
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
