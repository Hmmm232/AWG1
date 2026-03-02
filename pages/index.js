import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Home.module.css';

export default function Home({ gardens, categories, quotes }) {
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

      {/* Categories */}
      {categories && categories.length > 0 && (
        <>
          <div className={styles.divider} />
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Categories</h2>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {categories.map((c) => (
                  <li key={c.id} className={styles.categoryCard}>
                    <Link
                      href={c.profiles?.handle ? `/${c.profiles.handle}?tab=garden&item=${c.id}` : '#'}
                      className={styles.categoryLink}
                    >
                      <span className={styles.categoryName}>{c.name}</span>
                      {c.profiles && (
                        <span className={styles.categoryBy}>
                          {c.profiles.display_name || c.profiles.handle}
                        </span>
                      )}
                      {c.introduction && (
                        <span className={styles.categoryIntro}>{c.introduction}</span>
                      )}
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
                    <Link
                      href={q.profiles?.handle ? `/${q.profiles.handle}?tab=quotes&item=${q.id}` : '#'}
                      className={styles.quoteLink}
                    >
                      <blockquote className={styles.quoteText}>
                        &ldquo;{q.quote_text}&rdquo;
                      </blockquote>
                      {q.attribution && (
                        <p className={styles.quoteAttr}>
                          &mdash; {q.attribution}
                          {q.source && <span>, <em>{q.source}</em></span>}
                        </p>
                      )}
                    </Link>
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
          I intended this website first as a place where I could talk about my
          favourite books and poems, reading lists of favourite works, share
          interesting articles, quotes and curios with little bits of commentary.
        </p>
        <p>
          I have extended things now so that anyone can create a garden of their
          own, centred around whatever they please, I think it&rsquo;s pretty
          intuitive to do so.
        </p>
        <p>
          I do not intend for this site, like many other places on the internet,
          to commoditise your time and attention, we do not want to immerse you
          in the deliberately upsetting and controversial, the emotionally but
          not intellectually provocative. We want this to be a jumping off point
          to better things, a mode for sharing and discovering.
        </p>
        <p>
          If successful this site will direct you outwards and onwards, to
          curiosities and works of art that add to life, we will not keep you
          captive in an endless stream of ephemeral slop that detracts from it.
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
    { data: siteCategories },
    { data: siteQuotes },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, handle, display_name, bio')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('categories')
      .select('id, name, introduction, user_id, profiles!user_id(handle, display_name)')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('quotes')
      .select('id, quote_text, attribution, source, user_id, profiles!user_id(handle)')
      .neq('attribution', '')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    props: {
      gardens: profiles || [],
      categories: siteCategories || [],
      quotes: siteQuotes || [],
    },
  };
}
