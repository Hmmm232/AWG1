import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Explore.module.css';

const LINKS = [
  { href: '/explore/works', label: 'Works' },
  { href: '/explore/quotes', label: 'Quotes' },
  { href: '/explore/categories', label: 'Categories' },
  { href: '/explore/gardens', label: 'Gardens' },
];

export default function ExploreNav() {
  const router = useRouter();

  return (
    <nav className={styles.nav}>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`${styles.navLink} ${router.pathname === l.href ? styles.navLinkActive : ''}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
