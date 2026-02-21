import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Home.module.css';

export default function Home({ gardens, quotes }) {
  const { user, profile } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.title}>A Walled Garden</h1>
        <p className={styles.epigraph}>
          &ldquo;I know also,&rdquo; said Candide, &ldquo;that we must cultivate our garden.&rdquo;
        </p>
        <div className={styles.heroBody}>
          <p>
            A place to gather the books, poems, essays and curiosities that have
            shaped you &mdash; with your own commentary, in your own time.
          </p>
          <p>
            Anyone can plant a garden, centred around whatever they please.
          </p>
        </div>
        <div className={styles.cta}>
          {user ? (
            <Link href={profile?.handle ? `/${profile.handle}` : '/settings'} className="btn btn-primary">
              Go to your garden
            </Link>
          ) : (
            <Link href="/signup" className="btn btn-primary">
              Create your garden
            </Link>
          )}
          <a href="#about" className="btn btn-secondary">
            Read more
          </a>
        </div>
      </section>

      {/* Gardens */}
      {gardens && gardens.length > 0 && (
        <>
          <div className={styles.divider} />
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Gardens</h2>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {gardens.map((g) => (
                  <li key={g.id} className={styles.gardenCard}>
                    <Link href={`/${g.handle}`} className={styles.gardenLink}>
                      <span className={styles.gardenName}>{g.display_name || g.handle}</span>
                      <span className={styles.gardenHandle}>@{g.handle}</span>
                      {g.bio && <span className={styles.gardenBio}>{g.bio}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      {/* Quotes */}
      {quotes && quotes.length > 0 && (
        <>
          <div className={styles.divider} />
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quotes</h2>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {quotes.map((q) => (
                  <li key={q.id} className={styles.quoteCard}>
                    <blockquote className={styles.quoteText}>
                      &ldquo;{q.quote_text}&rdquo;
                    </blockquote>
                    {q.attribution && (
                      <p className={styles.quoteAttr}>
                        &mdash; {q.attribution}
                        {q.source && <span>, <em>{q.source}</em></span>}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      {/* About */}
      <div className={styles.divider} />
      <section id="about" className={styles.about}>
        <h2>About A Walled Garden</h2>
        <p>
          This site began as a place to gather the books, poems, essays and
          curiosities worth remembering &mdash; reading lists with commentary,
          favourite quotes, articles and curios worth passing on.
        </p>
        <p>
          It has since grown, and now anyone can plant a garden of their own,
          centred around whatever they please. Create categories, add works with
          your own commentary, collect the quotes you return to, and share
          recommendations from people you trust.
        </p>
        <p>
          We do not intend, like so many places on the internet, to commoditise
          your time and attention. We have no interest in the deliberately
          upsetting, the emotionally but not intellectually provocative, the
          endless scroll. This is a jumping-off point to better things, a means
          of sharing and discovering.
        </p>
        <p>
          If this site works as it should, it will direct you outwards and
          onwards &mdash; to curiosities and works of art that add to life, not
          distract from it.
        </p>
        <div className={styles.cta} style={{ marginTop: 'var(--space-xl)' }}>
          {user ? (
            <Link href={profile?.handle ? `/${profile.handle}` : '/settings'} className="btn btn-primary">
              Go to your garden
            </Link>
          ) : (
            <Link href="/signup" className="btn btn-primary">
              Create your garden
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  const [
    { data: profiles },
    { data: siteQuotes },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, handle, display_name, bio')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('quotes')
      .select('id, quote_text, attribution, source')
      .neq('attribution', '')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    props: {
      gardens: profiles || [],
      quotes: siteQuotes || [],
    },
  };
}
