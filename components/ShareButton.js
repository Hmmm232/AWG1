import { useState } from 'react';
import styles from '@/styles/Garden.module.css';

export default function ShareButton({ tab, itemId, handle }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const path = handle ? `/${handle}` : window.location.pathname;
    const url = `${window.location.origin}${path}?tab=${tab}&item=${itemId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className={`${styles.iconBtn} ${styles.shareBtn}`}
      onClick={handleShare}
      title="Copy link to share"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
