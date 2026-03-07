import Head from 'next/head';
import styles from '@/styles/Explore.module.css';

export default function About() {
  return (
    <>
      <Head>
        <title>About — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>About A Walled Garden</h1>
        </div>
      </div>
    </>
  );
}
