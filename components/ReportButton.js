import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Garden.module.css';

export default function ReportButton({ itemId, itemType, itemLabel }) {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | sending | done

  if (!user) return null;

  async function handleReport() {
    if (status !== 'idle') return;

    const reason = window.prompt(
      `Why are you reporting this ${itemType}?\n(Please describe briefly)`
    );
    if (!reason || !reason.trim()) return;

    setStatus('sending');

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          item_id: itemId,
          item_type: itemType,
          reason: reason.trim().slice(0, 1000),
        });

      if (error) {
        console.error('Report failed:', error);
        setStatus('idle');
        return;
      }

      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Report failed:', err);
      setStatus('idle');
    }
  }

  return (
    <button
      className={`${styles.iconBtn} ${styles.reportBtn}`}
      onClick={handleReport}
      disabled={status === 'sending'}
      title={`Report this ${itemType}`}
    >
      {status === 'done' ? 'Reported' : 'Report'}
    </button>
  );
}
