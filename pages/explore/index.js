import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Explore.module.css';

const SECTIONS = [
  { href: '/explore/works', label: 'Works', desc: 'Books, poems, essays and curiosities.' },
  { href: '/explore/quotes', label: 'Quotes', desc: 'Words that stay with people.' },
  { href: '/explore/categories', label: 'Categories', desc: 'Curated reading lists and collections.' },
  { href: '/explore/gardens', label: 'Gardens', desc: 'Browse gardens planted by our community.' },
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
                <p className={styles.cardBody}>{s.desc}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
