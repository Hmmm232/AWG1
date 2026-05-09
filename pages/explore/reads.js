import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import ExploreNav from '@/components/ExploreNav';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import styles from '@/styles/Reads.module.css';

export default function ExploreReads({ reads }) {
  return (
    <>
      <Head>
        <title>{reads.length} Reads — A Walled Garden</title>
        <meta
          name="description"
          content="Short works you can read right now — handpicked essays, stories, poems and speeches, updated regularly."
        />
      </Head>

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{reads.length} Reads</h1>
          <p className={styles.subtitle}>
            Great short works you can read right now, ranging from five
            minutes to two hours. Handpicked and updated regularly.
          </p>
        </div>

        <ExploreNav />

        {reads.length === 0 ? (
          <p className={styles.empty}>No reads yet — check back soon.</p>
        ) : (
          <div className={styles.grid}>
            {reads.map((r, i) => (
              <article key={r.id} className={styles.readCard}>
                <div className={styles.readNum}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className={styles.readBody}>
                  <h2 className={styles.readTitle}>{r.title}</h2>
                  <p className={styles.readAuthor}>{r.author}</p>

                  {r.publication && (
                    <p className={styles.readPub}>{r.publication}</p>
                  )}

                  <div className={styles.readTime}>
                    {r.read_minutes} min read
                  </div>

                  {r.introduction && (
                    <p className={styles.readIntro}>{r.introduction}</p>
                  )}

                  {r.quote && (
                    <blockquote className={styles.readQuote}>
                      &ldquo;{r.quote}&rdquo;
                    </blockquote>
                  )}

                  <div className={styles.readFooter}>
                    <div className={styles.readActions}>
                      <LikeButton itemId={r.id} itemType="featured_read" />
                      <SaveButton itemId={r.id} itemType="featured_read" />
                    </div>
                    {r.source_url && (
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.readLink}
                      >
                        {r.source_label || 'Read the original'} &rarr;
                      </a>
                    )}
                  </div>
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
    return { props: { reads: [] }, revalidate: 1 };
  }

  const { data } = await supabase
    .from('featured_reads')
    .select('id, title, author, publication, introduction, quote, read_minutes, source_url, source_label, position')
    .eq('active', true)
    .order('position', { ascending: true })
    .limit(14);

  const reads = (data || []).map(({ position, ...rest }) => rest);

  return { props: { reads }, revalidate: 60 };
}
