import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Garden.module.css';

export default function LikeButton({ itemId, itemType }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!itemId) return;

    // Fetch public like count
    supabase
      .from('likes')
      .select('user_id', { count: 'exact', head: true })
      .eq('item_id', itemId)
      .then(({ count: c }) => setCount(c || 0));

    // Check if current user has liked
    if (user) {
      supabase
        .from('likes')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .single()
        .then(({ data }) => setLiked(!!data));
    }
  }, [itemId, user]);

  async function handleToggle() {
    if (!user || busy) return;
    setBusy(true);

    try {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);
        if (!error) {
          setLiked(false);
          setCount((c) => Math.max(0, c - 1));
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, item_id: itemId, item_type: itemType });
        if (!error) {
          setLiked(true);
          setCount((c) => c + 1);
        }
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`${styles.iconBtn} ${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
      onClick={handleToggle}
      disabled={busy || !user}
      title={user ? (liked ? 'Unlike' : 'Like') : 'Sign in to like'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>{count > 0 ? ` ${count}` : ''}
    </button>
  );
}
