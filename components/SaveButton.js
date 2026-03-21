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
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
