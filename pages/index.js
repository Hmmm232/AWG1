import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { scoreGarden, scoreCategory, scoreWork, scoreQuote, rank } from '@/lib/ranking';
import styles from '@/styles/Home.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

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

function OrnateRule({ soft = false }) {
  return (
    <div className={soft ? styles.ornateRuleSoft : styles.ornateRule} aria-hidden="true">
      <span className={styles.ornateLine} />
      <svg width="6" height="6" viewBox="0 0 6 6">
        <rect x="3" y="0" width="4.24" height="4.24" transform="rotate(45 3 3)" fill="currentColor" />
      </svg>
      <span className={styles.ornateLine} />
    </div>
  );
}

function Leaf() {
  return (
    <svg className={styles.leaf} width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 C 6 6, 4 12, 4 20 C 10 20, 18 16, 20 8 C 16 6, 14 4, 12 2 Z"
            fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 18 Q 12 12, 18 8" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

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
                {works.map((w) => {
                  const owner = w.profiles?.display_name || w.profiles?.handle || 'Unknown';
                  const href = w.profiles?.handle
                    ? `/${w.profiles.handle}?tab=garden&item=${w.id}`
                    : '#';
                  const tag = w.category_name || 'A Work';
                  return (
                    <li key={w.id} className={styles.workCard}>
                      <Link href={href} className={styles.workCardInner}>
                        <div className={styles.eyebrow}>{tag}</div>
                        <div className={styles.workTitle}>{w.title}</div>
                        <div className={styles.workAuthor}>kept by {owner}</div>
                        {w.commentary ? (
                          <>
                            <OrnateRule />
                            <div className={styles.workNote}>
                              <span className={styles.dropCap}>{w.commentary.charAt(0)}</span>
                              {w.commentary.slice(1)}
                            </div>
                          </>
                        ) : (
                          <div className={styles.workNote} aria-hidden="true" />
                        )}
                        <div className={styles.workFooter}>
                          <span className={styles.eyebrow}>{owner}</span>
                          <span className={styles.readArrow}>read &rarr;</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
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
                {quotes.map((q) => {
                  const curator = q.profiles?.handle || 'someone';
                  return (
                    <li key={q.id} className={styles.quoteCard}>
                      <Link
                        href={`/explore/quotes?item=${q.id}`}
                        className={styles.quoteCardInner}
                      >
                        <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
                        <blockquote className={styles.quoteText}>{q.quote_text}</blockquote>
                        <OrnateRule />
                        {(q.attribution || q.source) && (
                          <div className={styles.quoteAttr}>
                            {q.attribution && <>&mdash; <b>{q.attribution}</b></>}
                            {q.source && (
                              <div className={styles.quoteSource}>
                                <em>{q.source}</em>
                              </div>
                            )}
                          </div>
                        )}
                        <div className={styles.eyebrow}>saved by @{curator}</div>
                      </Link>
                    </li>
                  );
                })}
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
                {gardens.map((g) => {
                  const name = g.display_name || g.handle;
                  const cats = (g.categories || []).slice(0, 5);
                  return (
                    <li key={g.id} className={styles.gardenCard}>
                      <Link href={`/${g.handle}`} className={styles.gardenCardInner}>
                        <div className={styles.gardenHeader}>
                          <span className={styles.gardenName}>{name}</span>
                          <span className={styles.gardenHandle}>@{g.handle}</span>
                        </div>
                        {g.bio && <div className={styles.gardenBio}>{g.bio}</div>}
                        {cats.length > 0 && (
                          <>
                            <div className={styles.eyebrow}>A peek inside</div>
                            <ul className={styles.gardenPeek}>
                              {cats.map((c, i) => (
                                <li key={i} className={styles.gardenPeekRow}>
                                  <span className={styles.gardenPeekNum}>
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <span className={styles.gardenPeekName}>{c}</span>
                                  <Leaf />
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        <div className={styles.gardenFooter}>
                          <span className={styles.gardenCounts}>
                            <b>{g.works_count ?? 0}</b>&middot;works
                            &nbsp;
                            <b>{g.quotes_count ?? 0}</b>&middot;quotes
                          </span>
                          <span className={styles.readArrow}>visit &rarr;</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
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
                {categories.map((c) => {
                  const owner = c.profiles?.display_name || c.profiles?.handle || 'someone';
                  const sample = (c.sample || []).slice(0, 5);
                  const href = c.profiles?.handle
                    ? `/${c.profiles.handle}?tab=garden&item=${c.id}`
                    : '#';
                  return (
                    <li key={c.id} className={styles.categoryCard}>
                      <Link href={href} className={styles.categoryCardInner}>
                        <div className={styles.eyebrow}>
                          {c.works_count ?? 0} works &middot; {owner}
                        </div>
                        <div className={styles.categoryName}>{c.name}</div>
                        {c.introduction && (
                          <div className={styles.categoryNote}>{c.introduction}</div>
                        )}
                        <OrnateRule />
                        <div className={styles.eyebrow}>Contents</div>
                        <ul className={styles.categoryContents}>
                          {sample.length > 0 ? (
                            sample.map((t, i) => (
                              <li key={i} className={styles.categoryContentsRow}>
                                <span className={styles.categoryContentsNum}>
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className={styles.categoryContentsTitle}>{t}</span>
                              </li>
                            ))
                          ) : (
                            <li className={styles.categoryContentsEmpty}>
                              &mdash; empty plot &mdash;
                            </li>
                          )}
                        </ul>
                      </Link>
                    </li>
                  );
                })}
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
          <Link href="/about#tips" className="btn btn-secondary">
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
    { data: workRows },
    { data: categoryCounts },
    { data: categoryNameData },
    { data: quoteCounts },
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
      .select('id, title, commentary, user_id, featured, category_id, categories!category_id(name), profiles!user_id(handle, display_name)')
      .limit(60),
    supabase
      .from('quotes')
      .select('id, quote_text, attribution, source, note, user_id, featured, profiles!user_id(handle)')
      .neq('attribution', '')
      .limit(60),
    supabase.from('follows').select('following_id'),
    supabase.from('works').select('id, title, category_id, user_id, sort_order').order('sort_order', { ascending: true }),
    supabase.from('categories').select('user_id'),
    supabase.from('categories').select('user_id, name, sort_order').order('sort_order', { ascending: true }),
    supabase.from('quotes').select('user_id'),
  ]);

  // Build lookup maps
  const followerMap = {};
  for (const f of (followerCounts || [])) {
    followerMap[f.following_id] = (followerMap[f.following_id] || 0) + 1;
  }

  const worksPerCategory = {};
  const worksPerUser = {};
  const titlesPerCategory = {};
  for (const w of (workRows || [])) {
    worksPerCategory[w.category_id] = (worksPerCategory[w.category_id] || 0) + 1;
    worksPerUser[w.user_id] = (worksPerUser[w.user_id] || 0) + 1;
    if (w.category_id && w.title) {
      if (!titlesPerCategory[w.category_id]) titlesPerCategory[w.category_id] = [];
      if (titlesPerCategory[w.category_id].length < 6) {
        titlesPerCategory[w.category_id].push(w.title);
      }
    }
  }

  const catsPerUser = {};
  for (const c of (categoryCounts || [])) {
    catsPerUser[c.user_id] = (catsPerUser[c.user_id] || 0) + 1;
  }

  const quotesPerUser = {};
  for (const q of (quoteCounts || [])) {
    quotesPerUser[q.user_id] = (quotesPerUser[q.user_id] || 0) + 1;
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
    works_count: worksPerUser[g.id] || 0,
    quotes_count: quotesPerUser[g.id] || 0,
    categories_count: catsPerUser[g.id] || 0,
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
    sample: titlesPerCategory[c.id] || [],
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
    category_name: w.categories?.name || null,
    _score: scoreWork({
      ...w,
      owner_followers: followerMap[w.user_id] || 0,
    }),
  }));
  const works = rank(scoredWorks, 'works').slice(0, 12);

  // Score and rank quotes
  const scoredQuotes = (siteQuotes || []).map((q) => ({
    ...q,
    _score: scoreQuote({
      ...q,
      owner_followers: followerMap[q.user_id] || 0,
    }),
  }));
  const quotes = rank(scoredQuotes, 'quotes').slice(0, 10);

  // Strip internal-only scoring fields before sending to client
  const strip = (arr, extra = []) =>
    arr.map((item) => {
      const copy = { ...item };
      delete copy._score;
      for (const k of extra) delete copy[k];
      return copy;
    });

  return {
    props: {
      gardens: strip(gardens),
      categories: strip(categories),
      works: strip(works, ['categories']),
      quotes: strip(quotes),
    },
    revalidate: 120,
  };
}
