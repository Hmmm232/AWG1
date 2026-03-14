import Head from 'next/head';
import styles from '@/styles/Explore.module.css';

export default function About({ buildTime }) {
  return (
    <>
      <Head>
        <title>About — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>About A Walled Garden</h1>
        </div>

        {buildTime && (
          <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.7rem', color: 'var(--color-ink-faint)', letterSpacing: '0.02em' }}>
            Build {buildTime}
          </p>
        )}
      </div>
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      buildTime: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    },
  };
}
