import Link from 'next/link';
import styles from '@/styles/Following.module.css';

export default function FollowingTab({ isOwner, following, profileName }) {
  if (!following || following.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>
        {isOwner
          ? "You're not following anyone yet."
          : `${profileName} isn't following anyone yet.`}
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {following.map((profile) => (
        <li key={profile.id} className={styles.item}>
          <Link href={`/${profile.handle}`} className={styles.link}>
            <span className={styles.name}>{profile.display_name || profile.handle}</span>
            <span className={styles.handle}>@{profile.handle}</span>
            {profile.bio && <span className={styles.bio}>{profile.bio}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
