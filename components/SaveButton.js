import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Garden.module.css';

export default function SaveButton({ itemId, itemType }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!itemId || !user) return;

    supabase
      .from('saves')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .single()
      .then(({ data }) => setSaved(!!data));
  }, [itemId, user]);

  if (!user) return null;

  async function handleToggle() {
    if (busy) return;
    setBusy(true);

    try {
      if (saved) {
        const { error } = await supabase
          .from('saves')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);
        if (!error) setSaved(false);
      } else {
        const { error } = await supabase
          .from('saves')
          .insert({ user_id: user.id, item_id: itemId, item_type: itemType });
        if (!error) setSaved(true);
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`${styles.iconBtn} ${styles.saveBtn} ${saved ? styles.saveBtnActive : ''}`}
      onClick={handleToggle}
      disabled={busy}
      title={saved ? 'Remove from saved' : 'Save'}
    >
      <svg width="12" height="14" viewBox="0 0 12 14" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M1 1h10v12L6 9.5 1 13V1z" />
      </svg>
    </button>
  );
}
