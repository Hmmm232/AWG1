import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { checkDailyLimit } from '@/lib/rateLimits';
import { moderateFields } from '@/lib/moderation';
import ShareButton from './ShareButton';
import gardenStyles from '@/styles/Garden.module.css';
import styles from '@/styles/ReRecs.module.css';

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
    <form onSubmit={handleSubmit} className={gardenStyles.form}>
      <p className={gardenStyles.formTitle}>{initial ? 'Edit re-rec' : 'Add a re-rec'}</p>
      <div className={gardenStyles.field}>
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
      <div className={gardenStyles.field}>
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
      <div className={gardenStyles.field}>
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
      <div className={gardenStyles.field}>
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
      <div className={gardenStyles.formActions}>
        <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Save' : 'Add re-rec'}
        </button>
        <button type="button" className={gardenStyles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ReRecsTab({ userId, isOwner, initialReRecs }) {
  const [rerecs, setRerecs] = useState(initialReRecs || []);
  const [editingReRecId, setEditingReRecId] = useState(null);
  const [error, setError] = useState('');

  async function updateReRec(id, { work_title, original_recommender, commentary, source_url }) {
    setError('');
    const mod = await moderateFields({ work_title, original_recommender, commentary });
    if (!mod.allowed) { setError(mod.reason); return; }
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
      {error && <p className={gardenStyles.error}>{error}</p>}

      {rerecs.length === 0 && isOwner && (
        <p style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>
          No re-recs yet.
        </p>
      )}

      {rerecs.map((rerec, index) => (
        <div key={rerec.id} id={rerec.id} className={styles.item}>
          {editingReRecId === rerec.id ? (
            <ReRecForm
              initial={rerec}
              onSave={(data) => updateReRec(rerec.id, data)}
              onCancel={() => setEditingReRecId(null)}
            />
          ) : (
            <>
              <div className={styles.itemHeader}>
                <div className={styles.itemContent}>
                  <p className={styles.title}>{rerec.work_title}</p>
                  {rerec.original_recommender && (
                    <p className={styles.recommender}>
                      Recommended by {rerec.original_recommender}
                    </p>
                  )}
                  {rerec.commentary && (
                    <p className={styles.commentary}>{rerec.commentary}</p>
                  )}
                  {rerec.source_url && /^https?:\/\//i.test(rerec.source_url) && (
                    <p className={styles.sourceLink}>
                      <a href={rerec.source_url} target="_blank" rel="noopener noreferrer">
                        Original recommendation &#8599;
                      </a>
                    </p>
                  )}
                </div>
                <div className={gardenStyles.actions}>
                  <ShareButton tab="rerecs" itemId={rerec.id} />
                  {isOwner && (
                    <>
                      <div className={gardenStyles.reorderGroup}>
                        <button className={gardenStyles.reorderBtn} onClick={() => reorderReRec(index, -1)} disabled={index === 0} title="Move up">&#9650;</button>
                        <button className={gardenStyles.reorderBtn} onClick={() => reorderReRec(index, 1)} disabled={index === rerecs.length - 1} title="Move down">&#9660;</button>
                      </div>
                      <button className={gardenStyles.iconBtn} onClick={() => setEditingReRecId(rerec.id)} title="Edit">Edit</button>
                      <button className={`${gardenStyles.iconBtn} ${gardenStyles.iconBtnDanger}`} onClick={() => deleteReRec(rerec.id)} title="Delete">Delete</button>
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
