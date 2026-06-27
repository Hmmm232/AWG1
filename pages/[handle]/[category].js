import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import ShareButton from '@/components/ShareButton';
import ReRecButton from '@/components/ReRecButton';
import { workPath } from '@/lib/links';
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

export default function CategoryPage({ profile, category, works }) {
  const { user } = useAuth();

  if (!profile || !category) return null;

  const isOwner = user && user.id === profile.id;
  const ownerName = profile.display_name || profile.handle;
  const path = `/${profile.handle}/${category.slug}`;
  const canonical = `${SITE_URL}${path}`;

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
          <LikeButton itemId={category.id} itemType="category" />
          <SaveButton itemId={category.id} itemType="category" />
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
                  <LikeButton itemId={work.id} itemType="work" />
                  <SaveButton itemId={work.id} itemType="work" />
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

      <div className={styles.gardenCta}>
        <Link href={`/${profile.handle}`}>Explore {ownerName}&rsquo;s full garden &rarr;</Link>
      </div>
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

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .eq('category_id', category.id)
    .order('sort_order', { ascending: true });

  return {
    props: { profile, category, works: works || [] },
    revalidate: 60,
  };
}
