import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { moderateFields } from '@/lib/moderation';
import { checkDailyLimit } from '@/lib/rateLimits';
import styles from '@/styles/Garden.module.css';

// source_url is stored in the database, so it must always use the canonical
// production origin — never window.location.origin, which would permanently
// record localhost/preview URLs when re-rec'ing from a non-prod host.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

export default function ReRecButton({ workTitle, recommenderHandle, recommenderName, tab, itemId, sourcePath }) {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | composing | saving | done
  const [commentary, setCommentary] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (status === 'composing' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [status]);

  if (!user) return null;

  async function handleSave() {
    setStatus('saving');

    try {
      const limit = await checkDailyLimit(user.id, 'rerecs');
      if (!limit.allowed) {
        alert(limit.message);
        setStatus('composing');
        return;
      }

      const { count } = await supabase
        .from('rerecs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const mod = await moderateFields({ work_title: workTitle, commentary: commentary.trim() });
      if (!mod.allowed) {
        setStatus('composing');
        return;
      }

      const itemUrl = sourcePath
        ? `${SITE_URL}${sourcePath}`
        : `${SITE_URL}/${recommenderHandle}?tab=${tab}&item=${itemId}`;

      const { error } = await supabase
        .from('rerecs')
        .insert({
          user_id: user.id,
          work_title: workTitle,
          original_recommender: recommenderName || `@${recommenderHandle}`,
          commentary: commentary.trim(),
          source_url: itemUrl,
          sort_order: count || 0,
        });

      if (error) {
        console.error('Re-rec failed:', error);
        setStatus('composing');
        return;
      }

      setStatus('done');
      setCommentary('');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      console.error('Re-rec failed:', err);
      setStatus('composing');
    }
  }

  if (status === 'composing' || status === 'saving') {
    return (
      <div className={styles.rerecCompose}>
        <textarea
          ref={textareaRef}
          className={styles.rerecTextarea}
          placeholder="Add a note (optional)..."
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          rows={2}
          maxLength={500}
          disabled={status === 'saving'}
        />
        <div className={styles.rerecActions}>
          <button
            className={`${styles.iconBtn} ${styles.rerecBtn}`}
            onClick={handleSave}
            disabled={status === 'saving'}
          >
            {status === 'saving' ? '...' : 'Save re-rec'}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => { setStatus('idle'); setCommentary(''); }}
            disabled={status === 'saving'}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className={`${styles.iconBtn} ${styles.rerecBtn}`}
      onClick={() => setStatus('composing')}
      title="Add to your re-recs"
    >
      {status === 'done' ? 'Re-rec\'d!' : 'Re-rec'}
    </button>
  );
}
