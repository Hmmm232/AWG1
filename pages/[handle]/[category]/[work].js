import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import ShareButton from '@/components/ShareButton';
import ReRecButton from '@/components/ReRecButton';
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

export default function WorkPage({ profile, category, work, siblingWorks = [], totalWorks = 0, listsCount = 0 }) {
  const { user } = useAuth();

  if (!profile || !category || !work) return null;

  const isOwner = user && user.id === profile.id;
  const ownerName = profile.display_name || profile.handle;
  const path = `/${profile.handle}/${category.slug}/${work.slug}`;
  const canonical = `${SITE_URL}${path}`;
  const workHref = (w) => `/${profile.handle}/${category.slug}/${w.slug}`;

  // Sibling works in this list, for previous/next + "more from this list"
  const currentIndex = siblingWorks.findIndex((w) => w.slug === work.slug);
  const prevWork = currentIndex > 0 ? siblingWorks[currentIndex - 1] : null;
  const nextWork =
    currentIndex >= 0 && currentIndex < siblingWorks.length - 1
      ? siblingWorks[currentIndex + 1]
      : null;
  const otherWorks = siblingWorks.filter((w) => w.slug !== work.slug).slice(0, 6);

  const pageTitle = `${work.title} — ${ownerName} — A Walled Garden`;
  const description = clampDescription(
    work.commentary ||
      `${work.title} — kept by ${ownerName} in “${category.name}” on A Walled Garden.`
  );

  const ogImage =
    `${SITE_URL}/api/og?type=work` +
    `&title=${encodeURIComponent(work.title)}` +
    `&curator=${encodeURIComponent(ownerName)}` +
    `&meta=${encodeURIComponent(category.name)}` +
    `&subtitle=${encodeURIComponent(work.commentary || '')}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={`${work.title} — ${ownerName}`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${work.title} — ${ownerName}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <nav className={styles.breadcrumb}>
        <Link href={`/${profile.handle}`}>{ownerName}&rsquo;s garden</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href={`/${profile.handle}/${category.slug}`}>{category.name}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{work.title}</span>
      </nav>

      <header className={styles.itemPageHeader}>
        <h1 className={styles.itemPageTitle}>{work.title}</h1>
        <p className={styles.itemPageMeta}>
          kept by <Link href={`/${profile.handle}`}>{ownerName}</Link> in{' '}
          <Link href={`/${profile.handle}/${category.slug}`}>{category.name}</Link>
        </p>
      </header>

      {work.commentary && (
        <p className={styles.workCommentary} style={{ fontSize: '1.05rem' }}>
          {work.commentary}
        </p>
      )}

      <div className={styles.actionsBelow}>
        <LikeButton itemId={work.id} itemType="work" />
        <SaveButton itemId={work.id} itemType="work" />
        {!isOwner && (
          <ReRecButton
            workTitle={work.title}
            recommenderHandle={profile.handle}
            recommenderName={ownerName}
            tab="garden"
            itemId={work.id}
            sourcePath={path}
          />
        )}
        <ShareButton tab="garden" itemId={work.id} handle={profile.handle} path={path} />
      </div>

      {/* Previous / next work within the list */}
      {(prevWork || nextWork) && (
        <nav className={styles.chapterNav}>
          {prevWork ? (
            <Link href={workHref(prevWork)} className={styles.chapterLink}>
              <span className={styles.chapterDir}>&larr; Previous</span>
              <span className={styles.chapterName}>{prevWork.title}</span>
            </Link>
          ) : <span />}
          {nextWork ? (
            <Link href={workHref(nextWork)} className={`${styles.chapterLink} ${styles.chapterLinkNext}`}>
              <span className={styles.chapterDir}>Next &rarr;</span>
              <span className={styles.chapterName}>{nextWork.title}</span>
            </Link>
          ) : <span />}
        </nav>
      )}

      {/* Continue exploring — the rest of the list, then the gardener */}
      <section className={styles.exploreZone}>
        <OrnateRule className={styles.exploreRule} />

        {otherWorks.length > 0 && (
          <div className={styles.moreLists}>
            <p className={styles.exploreLabel}>
              More from{' '}
              <Link href={`/${profile.handle}/${category.slug}`} className={styles.exploreLabelLink}>
                {category.name}
              </Link>
            </p>
            <ul className={styles.moreListsGrid}>
              {otherWorks.map((w) => (
                <li key={w.slug}>
                  <Link href={workHref(w)} className={styles.moreListLink}>
                    <span className={styles.moreListName}>{w.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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

  const { handle, category: categorySlug, work: workSlug } = params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, display_name, bio')
    .eq('handle', handle)
    .maybeSingle();

  if (!profile) return { notFound: true, revalidate: 60 };

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('user_id', profile.id)
    .eq('slug', categorySlug)
    .maybeSingle();

  if (!category) return { notFound: true, revalidate: 60 };

  const { data: work } = await supabase
    .from('works')
    .select('*')
    .eq('category_id', category.id)
    .eq('slug', workSlug)
    .maybeSingle();

  if (!work) return { notFound: true, revalidate: 60 };

  const [{ data: siblingWorks }, { count: totalWorks }, { count: listsCount }] = await Promise.all([
    supabase
      .from('works')
      .select('id, title, slug, sort_order')
      .eq('category_id', category.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('works')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id),
    supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id),
  ]);

  return {
    props: {
      profile,
      category,
      work,
      siblingWorks: siblingWorks || [],
      totalWorks: totalWorks || 0,
      listsCount: listsCount || 0,
    },
    revalidate: 60,
  };
}
