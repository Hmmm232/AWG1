import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Leaf } from '@/components/CardOrnaments';
import styles from '@/styles/Explore.module.css';

const SECTIONS = [
  {
    href: '/explore/works',
    label: 'Works',
    quote: '”Because life is too short to read bad books.”',
    attr: 'Unknown',
  },
  {
    href: '/explore/quotes',
    label: 'Quotes',
    quote: '”I quote others only in order the better to express myself.”',
    attr: 'Michel de Montaigne',
  },
  {
    href: '/explore/categories',
    label: 'Categories',
    quote: '”We walk the corridors, searching the shelves and rearranging them, looking for lines of meaning amid leagues of cacophony and incoherence.”',
    attr: 'Borges',
  },
  {
    href: '/explore/gardens',
    label: 'Gardens',
    quote: '”A garden to walk in and immensity to dream in — what more could he ask? A few flowers at his feet and above him the stars.”',
    attr: 'Victor Hugo',
  },
  {
    href: '/explore/reads',
    labelKey: 'reads',
    quote: '”Read in order to live.”',
    attr: 'Gustave Flaubert',
  },
];

export default function ExplorePage({ readsCount }) {
  return (
    <>
      <Head>
        <title>Explore — A Walled Garden</title>
        <meta name="description" content="Discover gardens, categories, works and quotes from the A Walled Garden community." />
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Explore</h1>
          <p className={styles.pageDesc}>
            &ldquo;The many great gardens of the world, of literature and poetry, of painting and music, of religion and architecture, all make the point as clear as possible: The soul cannot thrive in the absence of a garden.&rdquo;
            <span className={styles.pageDescAttr}>&mdash; Sir Thomas More</span>
          </p>
        </div>

        <div className={styles.indexGrid}>
          {SECTIONS.map((s) => {
            const label = s.labelKey === 'reads' ? `${readsCount} Reads` : s.label;
            return (
              <Link key={s.href} href={s.href} className={styles.indexCard}>
                <span className={styles.indexLeaf} aria-hidden="true">
                  <Leaf className={styles.indexLeafSvg} />
                </span>
                <div className={styles.indexContent}>
                  <h2 className={styles.indexTitle}>{label}</h2>
                  <p className={styles.indexQuote}>{s.quote}</p>
                  <p className={styles.indexAttr}>&mdash; {s.attr}</p>
                </div>
                <span className={styles.indexBrowse}>
                  Browse {label} <span className={styles.indexArrow}>&rarr;</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  let readsCount = 0;

  if (supabase) {
    const { count } = await supabase
      .from('featured_reads')
      .select('id', { count: 'exact', head: true })
      .eq('active', true);
    readsCount = count || 0;
  }

  return { props: { readsCount }, revalidate: 60 };
}
