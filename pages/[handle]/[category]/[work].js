import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import LikeButton from '@/components/LikeButton';
import SaveButton from '@/components/SaveButton';
import ShareButton from '@/components/ShareButton';
import ReRecButton from '@/components/ReRecButton';
import styles from '@/styles/Garden.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

export default function WorkPage({ profile, category, work }) {
  const { user } = useAuth();

  if (!profile || !category || !work) return null;

  const isOwner = user && user.id === profile.id;
  const ownerName = profile.display_name || profile.handle;
  const path = `/${profile.handle}/${category.slug}/${work.slug}`;
  const canonical = `${SITE_URL}${path}`;

  const description =
    work.commentary ||
    `${work.title} — kept by ${ownerName} in “${category.name}” on A Walled Garden.`;

  const ogImage =
    `${SITE_URL}/api/og?type=work` +
    `&title=${encodeURIComponent(work.title)}` +
    `&curator=${encodeURIComponent(ownerName)}` +
    `&meta=${encodeURIComponent(category.name)}` +
    `&subtitle=${encodeURIComponent(work.commentary || '')}`;

  return (
    <>
      <Head>
        <title>{work.title} — {ownerName} — A Walled Garden</title>
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

      <div className={styles.gardenCta}>
        <Link href={`/${profile.handle}/${category.slug}`}>
          &larr; More from {category.name}
        </Link>
      </div>
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

  return {
    props: { profile, category, work },
    revalidate: 60,
  };
}
