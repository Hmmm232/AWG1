import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import ShareButton from '@/components/ShareButton';
import ReRecButton from '@/components/ReRecButton';
import { workPath } from '@/lib/links';
import { OrnateRule } from '@/components/CardOrnaments';
import styles from '@/styles/Garden.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

// Keep meta descriptions within the ~155 chars search engines and social
// cards display, trimming on a word boundary.
function clampDescription(text, max = 155) {
  const s = (text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

export default function CategoryPage({ profile, category, works, gardenCategories = [], totalWorks = 0 }) {
  const { user } = useAuth();

  if (!profile || !category) return null;

  const isOwner = user && user.id === profile.id;
  const ownerName = profile.display_name || profile.handle;
  const path = `/${profile.handle}/${category.slug}`;
  const canonical = `${SITE_URL}${path}`;

  // Sibling categories, for "more lists" + previous/next chapter navigation
  const currentIndex = gardenCategories.findIndex((c) => c.slug === category.slug);
  const prevCategory = currentIndex > 0 ? gardenCategories[currentIndex - 1] : null;
  const nextCategory =
    currentIndex >= 0 && currentIndex < gardenCategories.length - 1
      ? gardenCategories[currentIndex + 1]
      : null;
  const otherCategories = gardenCategories.filter((c) => c.slug !== category.slug);
  const listsCount = gardenCategories.length;

  const countLabel = `${works.length} work${works.length === 1 ? '' : 's'}`;
  const pageTitle = `${category.name} — ${ownerName} — A Walled Garden`;
  const description = clampDescription(
    category.introduction ||
      `${category.name} — a reading list of ${countLabel} kept by ${ownerName} on A Walled Garden.`
  );

  const ogImage =
    `${SITE_URL}/api/og?type=category` +
    `&title=${encodeURIComponent(category.name)}` +
    `&curator=${encodeURIComponent(ownerName)}` +
    `&meta=${encodeURIComponent(countLabel)}` +
    `&items=${encodeURIComponent(works.slice(0, 4).map((w) => w.title).join('|'))}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${category.name} — ${ownerName}`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${category.name} — ${ownerName}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <nav className={styles.breadcrumb}>
        <Link href={`/${profile.handle}`}>{ownerName}&rsquo;s garden</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{category.name}</span>
      </nav>

      <header className={styles.itemPageHeader}>
        <h1 className={styles.itemPageTitle}>{category.name}</h1>
        <p className={styles.itemPageMeta}>
          {countLabel} &middot; kept by{' '}
          <Link href={`/${profile.handle}`}>{ownerName}</Link>
        </p>
      </header>

      {category.introduction && (
        <p className={styles.categoryIntro}>{category.introduction}</p>
      )}

      <div className={styles.categoryHeader} style={{ marginBottom: 'var(--space-lg)' }}>
        <div className={styles.actions}>
          {!isOwner && (
            <>
              <LikeButton itemId={category.id} itemType="category" />
              <SaveButton itemId={category.id} itemType="category" />
            </>
          )}
          <ShareButton tab="garden" itemId={category.id} handle={profile.handle} path={path} />
        </div>
      </div>

      {works.length > 0 ? (
        <ul className={styles.worksList}>
          {works.map((work) => (
            <li key={work.id} className={styles.work}>
              <div className={styles.workLayout}>
                <p className={styles.workTitle}>
                  <Link href={workPath(profile.handle, category.slug, work.slug, work.id)} className={styles.workTitleLink}>
                    {work.title}
                  </Link>
                </p>
                <div className={styles.workActions}>
                  {!isOwner && (
                    <>
                      <LikeButton itemId={work.id} itemType="work" />
                      <SaveButton itemId={work.id} itemType="work" />
                    </>
                  )}
                  {!isOwner && (
                    <ReRecButton
                      workTitle={work.title}
                      recommenderHandle={profile.handle}
                      recommenderName={ownerName}
                      tab="garden"
                      itemId={work.id}
                      sourcePath={workPath(profile.handle, category.slug, work.slug, work.id)}
                    />
                  )}
                  <ShareButton tab="garden" itemId={work.id} handle={profile.handle} path={workPath(profile.handle, category.slug, work.slug, work.id)} />
                </div>
                {work.commentary && (
                  <p className={styles.workCommentary}>{work.commentary}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyWorks}>No works in this category yet.</p>
      )}

      {/* Previous / next chapter — walking the paths of the garden */}
      {(prevCategory || nextCategory) && (
        <nav className={styles.chapterNav}>
          {prevCategory ? (
            <Link href={`/${profile.handle}/${prevCategory.slug}`} className={styles.chapterLink}>
              <span className={styles.chapterDir}>&larr; Previous list</span>
              <span className={styles.chapterName}>{prevCategory.name}</span>
            </Link>
          ) : <span />}
          {nextCategory ? (
            <Link href={`/${profile.handle}/${nextCategory.slug}`} className={`${styles.chapterLink} ${styles.chapterLinkNext}`}>
              <span className={styles.chapterDir}>Next list &rarr;</span>
              <span className={styles.chapterName}>{nextCategory.name}</span>
            </Link>
          ) : <span />}
        </nav>
      )}

      {/* Continue exploring — the gardener and the rest of their garden */}
      <section className={styles.exploreZone}>
        <OrnateRule className={styles.exploreRule} />

        <Link href={`/${profile.handle}`} className={styles.gardenerCard}>
          <span className={styles.gardenerAvatar}>{ownerName.charAt(0).toUpperCase()}</span>
          <span className={styles.gardenerInfo}>
            <span className={styles.gardenerName}>{ownerName}</span>
            {profile.bio && <span className={styles.gardenerBio}>{profile.bio}</span>}
            <span className={styles.gardenerMeta}>
              {totalWorks} work{totalWorks === 1 ? '' : 's'} &middot; {listsCount} list{listsCount === 1 ? '' : 's'}
            </span>
          </span>
          <span className={styles.gardenerVisit}>Visit garden &rarr;</span>
        </Link>

        {otherCategories.length > 0 && (
          <div className={styles.moreLists}>
            <p className={styles.exploreLabel}>More lists in {ownerName}&rsquo;s garden</p>
            <ul className={styles.moreListsGrid}>
              {otherCategories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${profile.handle}/${c.slug}`} className={styles.moreListLink}>
                    <span className={styles.moreListName}>{c.name}</span>
                    <span className={styles.moreListCount}>
                      {c.worksCount} work{c.worksCount === 1 ? '' : 's'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className={styles.discoverLine}>
          <Link href="/explore/gardens">Discover other gardens &rarr;</Link>
        </p>
      </section>
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  if (!supabase) return { notFound: true, revalidate: 1 };

  const { handle, category: slug } = params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, display_name, bio')
    .eq('handle', handle)
    .maybeSingle();

  if (!profile) return { notFound: true, revalidate: 60 };

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', slug)
    .maybeSingle();

  if (!category) return { notFound: true, revalidate: 60 };

  const [{ data: works }, { data: allCats }, { data: allWorks }] = await Promise.all([
    supabase
      .from('works')
      .select('*')
      .eq('category_id', category.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .eq('user_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('works')
      .select('id, category_id')
      .eq('user_id', profile.id),
  ]);

  // Per-category work counts, for the "more lists" previews
  const countByCat = {};
  for (const w of (allWorks || [])) {
    countByCat[w.category_id] = (countByCat[w.category_id] || 0) + 1;
  }
  const gardenCategories = (allCats || []).map((c) => ({
    name: c.name,
    slug: c.slug,
    worksCount: countByCat[c.id] || 0,
  }));

  return {
    props: {
      profile,
      category,
      works: works || [],
      gardenCategories,
      totalWorks: (allWorks || []).length,
    },
    revalidate: 60,
  };
}
