import Link from 'next/link';
import styles from '@/styles/Auth.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.subtitle}>
        This garden doesn't exist — or hasn't been planted yet.
      </p>
      <Link href="/" className="btn btn-secondary">
        Go home
      </Link>
    </div>
  );
}
