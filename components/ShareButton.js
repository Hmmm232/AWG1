import { useState } from 'react';
import styles from '@/styles/Garden.module.css';

// Always share the canonical production URL — window.location.origin would
// leak localhost/preview-deployment links when sharing from a non-prod host.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

export default function ShareButton({ tab, itemId, handle, path }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    // Prefer an explicit pretty path when provided; otherwise fall back to
    // the legacy deep link (which still resolves and self-upgrades).
    const url = path
      ? `${SITE_URL}${path}`
      : `${SITE_URL}${handle ? `/${handle}` : window.location.pathname}?tab=${tab}&item=${itemId}`;
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
