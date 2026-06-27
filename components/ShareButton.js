import { useState } from 'react';
import styles from '@/styles/Garden.module.css';

export default function ShareButton({ tab, itemId, handle, path }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    // Prefer an explicit pretty path when provided; otherwise fall back to
    // the legacy deep link (which still resolves and self-upgrades).
    const url = path
      ? `${window.location.origin}${path}`
      : `${window.location.origin}${handle ? `/${handle}` : window.location.pathname}?tab=${tab}&item=${itemId}`;
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
