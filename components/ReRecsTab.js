import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import ShareButton from './ShareButton';
import styles from '@/styles/Garden.module.css';

function ReRecForm({ initial, onSave, onCancel }) {
  const [workTitle, setWorkTitle] = useState(initial?.work_title || '');
  const [originalRecommender, setOriginalRecommender] = useState(initial?.original_recommender || '');
  const [commentary, setCommentary] = useState(initial?.commentary || '');
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!workTitle.trim()) return;
    setSaving(true);
    try {
      await onSave({
        work_title: workTitle.trim(),
        original_recommender: originalRecommender.trim(),
        commentary: commentary.trim(),
        source_url: sourceUrl.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.formTitle}>{initial ? 'Edit re-rec' : 'Add a re-rec'}</p>
      <div className={styles.field}>
        <label htmlFor="workTitle">What are you recommending?</label>
        <input
          id="workTitle"
          type="text"
          placeholder='e.g. "Gilead by Marilynne Robinson"'
          value={workTitle}
          onChange={(e) => setWorkTitle(e.target.value)}
          required
          maxLength={300}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="recommender">Who originally recommended it?</label>
        <input
          id="recommender"
          type="text"
          placeholder='e.g. "Ryan Holiday" or "@ryan"'
          value={originalRecommender}
          onChange={(e) => setOriginalRecommender(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="commentary">Why are you resharing this? (optional)</label>
        <textarea
          id="commentary"
          placeholder="What makes this recommendation worth passing on..."
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          rows={3}
          maxLength={5000}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="sourceUrl">Link to original recommendation (optional)</label>
        <input
          id="sourceUrl"
          type="text"
          placeholder="https://..."
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          maxLength={2000}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Save' : 'Add re-rec'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ReRecsTab({ userId, isOwner, initialReRecs }) {
  const [rerecs, setRerecs] = useState(initialReRecs || []);
  const [showNewReRec, setShowNewReRec] = useState(false);
  const [editingReRecId, setEditingReRecId] = useState(null);
  const [error, setError] = useState('');

  async function addReRec({ work_title, original_recommender, commentary, source_url }) {
    setError('');
    const sortOrder = rerecs.length;
    const { error: insertErr } = await supabase
      .from('rerecs')
      .insert({ user_id: userId, work_title, original_recommender, commentary, source_url, sort_order: sortOrder });
    if (insertErr) { setError(insertErr.message); return; }

    // Fetch fresh re-recs after successful insert
    const { data: freshReRecs } = await supabase
      .from('rerecs')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    setRerecs(freshReRecs || []);
    setShowNewReRec(false);
  }

  async function updateReRec(id, { work_title, original_recommender, commentary, source_url }) {
    setError('');
    const { error: err } = await supabase
      .from('rerecs')
      .update({ work_title, original_recommender, commentary, source_url })
      .eq('id', id);
    if (err) { setError(err.message); return; }
    setRerecs(rerecs.map((r) => r.id === id ? { ...r, work_title, original_recommender, commentary, source_url } : r));
    setEditingReRecId(null);
  }

  async function deleteReRec(id) {
    if (!window.confirm('Delete this re-rec?')) return;
    setError('');
    const { error: err } = await supabase.from('rerecs').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setRerecs(rerecs.filter((r) => r.id !== id));
  }

  async function reorderReRec(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= rerecs.length) return;
    const oldRerecs = rerecs;
    const newRerecs = [...rerecs];
    const [moved] = newRerecs.splice(index, 1);
    newRerecs.splice(newIndex, 0, moved);
    const updates = newRerecs.map((r, i) => ({ ...r, sort_order: i }));
    setRerecs(updates);
    try {
      const results = await Promise.all(
        updates.map((r) =>
          supabase.from('rerecs').update({ sort_order: r.sort_order }).eq('id', r.id)
        )
      );
      if (results.some((r) => r.error)) {
        setError('Failed to save new order');
        setRerecs(oldRerecs);
      }
    } catch {
      setError('Failed to save new order');
      setRerecs(oldRerecs);
    }
  }

  if (rerecs.length === 0 && !isOwner) {
    return <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>No re-recs yet.</p>;
  }

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}

      {isOwner && !showNewReRec && (
        <button className={`${styles.addBtn} ${styles.addCategoryBtn}`} onClick={() => setShowNewReRec(true)}>
          + Add a re-rec
        </button>
      )}
      {isOwner && showNewReRec && (
        <ReRecForm onSave={addReRec} onCancel={() => setShowNewReRec(false)} />
      )}

      {rerecs.length === 0 && isOwner && !showNewReRec && (
        <p style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>
          No re-recs yet. Share a recommendation you received that deserves a wider audience.
        </p>
      )}

      {rerecs.map((rerec, index) => (
        <div key={rerec.id} id={rerec.id} className={styles.category}>
          {editingReRecId === rerec.id ? (
            <ReRecForm
              initial={rerec}
              onSave={(data) => updateReRec(rerec.id, data)}
              onCancel={() => setEditingReRecId(null)}
            />
          ) : (
            <>
              <div className={styles.categoryHeader}>
                <div style={{ flex: 1 }}>
                  <p className={styles.workTitle}>{rerec.work_title}</p>
                  {rerec.original_recommender && (
                    <p className={styles.rerecMeta}>
                      Recommended by {rerec.original_recommender}
                    </p>
                  )}
                  {rerec.commentary && (
                    <p className={styles.workCommentary}>{rerec.commentary}</p>
                  )}
                  {rerec.source_url && /^https?:\/\//i.test(rerec.source_url) && (
                    <p className={styles.rerecLink}>
                      <a href={rerec.source_url} target="_blank" rel="noopener noreferrer">
                        Original recommendation &#8599;
                      </a>
                    </p>
                  )}
                </div>
                <div className={styles.actions}>
                  <ShareButton tab="rerecs" itemId={rerec.id} />
                  {isOwner && (
                    <>
                      <div className={styles.reorderGroup}>
                        <button className={styles.reorderBtn} onClick={() => reorderReRec(index, -1)} disabled={index === 0} title="Move up">&#9650;</button>
                        <button className={styles.reorderBtn} onClick={() => reorderReRec(index, 1)} disabled={index === rerecs.length - 1} title="Move down">&#9660;</button>
                      </div>
                      <button className={styles.iconBtn} onClick={() => setEditingReRecId(rerec.id)} title="Edit">Edit</button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => deleteReRec(rerec.id)} title="Delete">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
