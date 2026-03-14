import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { moderateFields } from '@/lib/moderation';
import styles from '@/styles/Garden.module.css';

export default function ReRecButton({ workTitle, recommenderHandle, recommenderName, tab, itemId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | saving | done

  if (!user) return null;

  async function handleReRec() {
    if (status !== 'idle') return;
    setStatus('saving');

    try {
      // Get current user's re-rec count for sort_order
      const { count } = await supabase
        .from('rerecs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const mod = await moderateFields({ work_title: workTitle });
      if (!mod.allowed) {
        setStatus('idle');
        return;
      }

      const itemUrl = `${window.location.origin}/${recommenderHandle}?tab=${tab}&item=${itemId}`;

      const { error } = await supabase
        .from('rerecs')
        .insert({
          user_id: user.id,
          work_title: workTitle,
          original_recommender: recommenderName || `@${recommenderHandle}`,
          commentary: '',
          source_url: itemUrl,
          sort_order: count || 0,
        });

      if (error) {
        console.error('Re-rec failed:', error);
        setStatus('idle');
        return;
      }

      setStatus('done');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('Re-rec failed:', err);
      setStatus('idle');
    }
  }

  return (
    <button
      className={`${styles.iconBtn} ${styles.rerecBtn}`}
      onClick={handleReRec}
      disabled={status === 'saving'}
      title="Add to your re-recs"
    >
      {status === 'done' ? 'Re-rec\'d!' : status === 'saving' ? '...' : 'Re-rec'}
    </button>
  );
}
