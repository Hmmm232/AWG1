import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { scoreGarden, scoreCategory, scoreWork, scoreQuote, rank } from '@/lib/ranking';
import styles from '@/styles/Home.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'A Walled Garden',
  url: SITE_URL,
  description:
    'A new home for culture on the internet — curate your favourite books, poems, essays and curios, and share them with the world.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/explore?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function Home({ gardens, categories, works, quotes }) {
  const { user, profile } = useAuth();

  return (
    <div>
      <Head>
        <meta
          name="description"
          content="A Walled Garden — a new home for culture on the internet. Curate your favourite books, poems, essays and curios, and share them with the world."
        />
        <meta
          property="og:description"
          content="A Walled Garden — a new home for culture on the internet. Curate your favourite books, poems, essays and curios, and share them with the world."
        />
        <meta
          name="twitter:description"
          content="A Walled Garden — a new home for culture on the internet. Curate your favourite books, poems, essays and curios, and share them with the world."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.title}>A Walled Garden</h1>
        <p className={styles.epigraph}>
          &ldquo;I know also,&rdquo; said Candide, &ldquo;that we must cultivate our garden.&rdquo;
        </p>
        <p className={styles.heroBody}>
          A new home for culture on the internet, a place to gather the books,
          poems, essays and curios you love, and share them with the world.
        </p>
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
          <Link href="/about" className="btn btn-secondary">
            Read more
          </Link>
        </div>
      </section>

      {/* Works */}
      {works && works.length > 0 && (
        <>
          <div className={styles.divider} />
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Works</h2>
              <Link href="/explore/works" className={styles.exploreLink}>Explore more works &rarr;</Link>
            </div>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {works.map((w) => (
                  <li key={w.id} className={styles.card}>
                    <Link
                      href={w.profiles?.handle ? `/${w.profiles.handle}?tab=garden&item=${w.id}` : '#'}
                      className={styles.cardInner}
                    >
                      <span className={styles.cardName}>{w.title}</span>
                      <span className={styles.cardBy}>
                        {w.profiles?.display_name || w.profiles?.handle || 'Unknown'}
                      </span>
                      {w.commentary && (
                        <span className={styles.workCommentary}>{w.commentary}</span>
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
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Quotes</h2>
              <Link href="/explore/quotes" className={styles.exploreLink}>Explore more quotes &rarr;</Link>
            </div>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {quotes.map((q) => (
                  <li key={q.id} className={styles.card}>
                    <Link
                      href={q.profiles?.handle ? `/${q.profiles.handle}?tab=quotes&item=${q.id}` : '#'}
                      className={styles.cardInner}
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

      {/* Gardens */}
      {gardens && gardens.length > 0 && (
        <>
          <div className={styles.divider} />
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Gardens</h2>
              <Link href="/explore/gardens" className={styles.exploreLink}>Explore more gardens &rarr;</Link>
            </div>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {gardens.map((g) => (
                  <li key={g.id} className={styles.card}>
                    <Link href={`/${g.handle}`} className={styles.cardInner}>
                      <span className={styles.gardenName}>{g.display_name || g.handle}</span>
                      <span className={styles.gardenHandle}>@{g.handle}</span>
                      {g.bio && <span className={styles.gardenBio}>{g.bio}</span>}
                      {g.categories && g.categories.length > 0 && (
                        <span className={styles.gardenCategories}>
                          {g.categories.join(' · ')}
                        </span>
                      )}
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
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Categories</h2>
              <Link href="/explore/categories" className={styles.exploreLink}>Explore more categories &rarr;</Link>
            </div>
            <div className={styles.scrollContainer}>
              <ul className={styles.scrollRow}>
                {categories.map((c) => (
                  <li key={c.id} className={styles.card}>
                    <Link
                      href={c.profiles?.handle ? `/${c.profiles.handle}?tab=garden&item=${c.id}` : '#'}
                      className={styles.cardInner}
                    >
                      <span className={styles.cardName}>{c.name}</span>
                      {c.profiles && (
                        <span className={styles.cardBy}>
                          {c.profiles.display_name || c.profiles.handle}
                        </span>
                      )}
                      {c.introduction && (
                        <span className={styles.cardIntro}>{c.introduction}</span>
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
      <section className={styles.about}>
        <h2 className={styles.aboutTitle}>About A Walled Garden</h2>
        <p>
          I intended this website first as a place where I could talk about my
          favourite books and poems, reading lists of favourite works, share
          interesting articles, quotes and curios with little bits of commentary.
        </p>
        <p>
          I have extended things now so that anyone can create a garden of their
          own, centered around whatever they please, I think it&rsquo;s pretty
          intuitive to do so. You can read more about the ins and outs of doing
          so <Link href="/about">here</Link>.
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
          <Link href="/explore" className="btn btn-secondary">
            Explore
          </Link>
          <Link href="/about" className="btn btn-secondary">
            Guide to creating a garden
          </Link>
        </div>
      </section>

    </div>
  );
}

export async function getStaticProps() {
  // During build without env vars, return empty data — ISR will populate on first request
  if (!supabase) {
    return { props: { gardens: [], categories: [], works: [], quotes: [] }, revalidate: 1 };
  }

  // Fetch more than we display so scoring + rotation have a decent pool
  const [
    { data: profiles },
    { data: siteCategories },
    { data: siteWorks },
    { data: siteQuotes },
    { data: followerCounts },
    { data: workCounts },
    { data: categoryCounts },
    { data: categoryNameData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, handle, display_name, bio, featured')
      .limit(60),
    supabase
      .from('categories')
      .select('id, name, introduction, user_id, featured, profiles!user_id(handle, display_name)')
      .limit(60),
    supabase
      .from('works')
      .select('id, title, commentary, user_id, featured, profiles!user_id(handle, display_name)')
      .limit(60),
    supabase
      .from('quotes')
      .select('id, quote_text, attribution, source, note, user_id, featured, profiles!user_id(handle)')
      .neq('attribution', '')
      .limit(60),
    supabase.from('follows').select('following_id'),
    supabase.from('works').select('category_id, user_id'),
    supabase.from('categories').select('user_id'),
    supabase.from('categories').select('user_id, name, sort_order').order('sort_order', { ascending: true }),
  ]);

  // Build lookup maps
  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }

  const worksPerCategory = {};
  const worksPerUser = {};
  for (const w of (workCounts || [])) {
    worksPerCategory[w.category_id] = (worksPerCategory[w.category_id] || 0) + 1;
    worksPerUser[w.user_id] = (worksPerUser[w.user_id] || 0) + 1;
  }

  const catsPerUser = {};
  for (const c of (categoryCounts || [])) {
    catsPerUser[c.user_id] = (catsPerUser[c.user_id] || 0) + 1;
  }

  const userCategories = {};
  for (const c of (categoryNameData || [])) {
    if (!userCategories[c.user_id]) userCategories[c.user_id] = [];
    userCategories[c.user_id].push(c.name);
  }

  // Score and rank gardens
  const scoredGardens = (profiles || []).map((g) => ({
    ...g,
    categories: userCategories[g.id] || [],
    follower_count: followerMap[g.id] || 0,
    category_count: catsPerUser[g.id] || 0,
    work_count: worksPerUser[g.id] || 0,
    _score: scoreGarden({
      ...g,
      follower_count: followerMap[g.id] || 0,
      category_count: catsPerUser[g.id] || 0,
      work_count: worksPerUser[g.id] || 0,
    }),
  }));
  const gardens = rank(scoredGardens, 'gardens').slice(0, 12);

  // Score and rank categories
  const scoredCategories = (siteCategories || []).map((c) => ({
    ...c,
    works_count: worksPerCategory[c.id] || 0,
    owner_followers: followerMap[c.user_id] || 0,
    _score: scoreCategory({
      ...c,
      works_count: worksPerCategory[c.id] || 0,
      owner_followers: followerMap[c.user_id] || 0,
    }),
  }));
  const categories = rank(scoredCategories, 'categories').slice(0, 12);

  // Score and rank works
  const scoredWorks = (siteWorks || []).map((w) => ({
    ...w,
    owner_followers: followerMap[w.user_id] || 0,
    _score: scoreWork({
      ...w,
      owner_followers: followerMap[w.user_id] || 0,
    }),
  }));
  const works = rank(scoredWorks, 'works').slice(0, 12);

  // Score and rank quotes
  const scoredQuotes = (siteQuotes || []).map((q) => ({
    ...q,
    owner_followers: followerMap[q.user_id] || 0,
    _score: scoreQuote({
      ...q,
      owner_followers: followerMap[q.user_id] || 0,
    }),
  }));
  const quotes = rank(scoredQuotes, 'quotes').slice(0, 10);

  // Strip internal scoring fields before sending to client
  const clean = (arr) => arr.map(({ _score, owner_followers, follower_count, category_count, work_count, works_count, ...rest }) => rest);

  return {
    props: {
      gardens: clean(gardens),
      categories: clean(categories),
      works: clean(works),
      quotes: clean(quotes),
    },
    revalidate: 120,
  };
}
