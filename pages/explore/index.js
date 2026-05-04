import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Explore.module.css';

const SECTIONS = [
  {
    href: '/explore/reads',
    label: '14 Reads',
    quote: '“Read in order to live.”',
    attr: 'Gustave Flaubert',
  },
  {
    href: '/explore/works',
    label: 'Works',
    quote: '“Because life is too short to read bad books.”',
    attr: 'Unknown',
  },
  {
    href: '/explore/quotes',
    label: 'Quotes',
    quote: '“I quote others only in order the better to express myself.”',
    attr: 'Michel de Montaigne',
  },
  {
    href: '/explore/categories',
    label: 'Categories',
    quote: '“We walk the corridors, searching the shelves and rearranging them, looking for lines of meaning amid leagues of cacophony and incoherence.”',
    attr: 'Borges',
  },
  {
    href: '/explore/gardens',
    label: 'Gardens',
    quote: '“A garden to walk in and immensity to dream in — what more could he ask? A few flowers at his feet and above him the stars.”',
    attr: 'Victor Hugo',
  },
];

export default function ExplorePage() {
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

        <div className={styles.grid}>
          {SECTIONS.map((s) => (
            <div key={s.href} className={styles.card}>
              <Link href={s.href} className={styles.cardLink}>
                <p className={styles.cardTitle}>{s.label}</p>
                <p className={styles.cardQuoteDesc}>{s.quote}</p>
                <p className={styles.cardQuoteAttr}>&mdash; {s.attr}</p>
                <span className={styles.browseHeading}>Browse {s.label} &rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
