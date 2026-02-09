import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Garden.module.css';

function QuoteForm({ initial, onSave, onCancel }) {
  const [quoteText, setQuoteText] = useState(initial?.quote_text || '');
  const [attribution, setAttribution] = useState(initial?.attribution || '');
  const [source, setSource] = useState(initial?.source || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quoteText.trim()) return;
    setSaving(true);
    await onSave({
      quote_text: quoteText.trim(),
      attribution: attribution.trim(),
      source: source.trim(),
    });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.formTitle}>{initial ? 'Edit quote' : 'Add a quote'}</p>
      <div className={styles.field}>
        <label htmlFor="quoteText">Quote</label>
        <textarea
          id="quoteText"
          placeholder="The quote itself..."
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="attribution">Who said it (optional)</label>
        <input
          id="attribution"
          type="text"
          placeholder='e.g. "Marcus Aurelius"'
          value={attribution}
          onChange={(e) => setAttribution(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="source">Source (optional)</label>
        <input
          id="source"
          type="text"
          placeholder='e.g. "Meditations, Book IV"'
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Save' : 'Add quote'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function QuotesTab({ userId, isOwner, initialQuotes }) {
  const [quotes, setQuotes] = useState(initialQuotes || []);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [error, setError] = useState('');

  async function addQuote({ quote_text, attribution, source }) {
    setError('');
    const sortOrder = quotes.length;
    const { data, error: err } = await supabase
      .from('quotes')
      .insert({ user_id: userId, quote_text, attribution, source, sort_order: sortOrder })
      .select()
      .single();
    if (err) { setError(err.message); return; }
    setQuotes([...quotes, data]);
    setShowNewQuote(false);
  }

  async function updateQuote(id, { quote_text, attribution, source }) {
    setError('');
    const { error: err } = await supabase
      .from('quotes')
      .update({ quote_text, attribution, source })
      .eq('id', id);
    if (err) { setError(err.message); return; }
    setQuotes(quotes.map((q) => q.id === id ? { ...q, quote_text, attribution, source } : q));
    setEditingQuoteId(null);
  }

  async function deleteQuote(id) {
    if (!window.confirm('Delete this quote?')) return;
    setError('');
    const { error: err } = await supabase.from('quotes').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setQuotes(quotes.filter((q) => q.id !== id));
  }

  async function reorderQuote(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= quotes.length) return;
    const newQuotes = [...quotes];
    const [moved] = newQuotes.splice(index, 1);
    newQuotes.splice(newIndex, 0, moved);
    const updates = newQuotes.map((q, i) => ({ ...q, sort_order: i }));
    setQuotes(updates);
    for (const q of updates) {
      await supabase.from('quotes').update({ sort_order: q.sort_order }).eq('id', q.id);
    }
  }

  if (quotes.length === 0 && !isOwner) {
    return <p className={styles.emptyWorks} style={{ textAlign: 'center', padding: '3rem 1rem', fontStyle: 'italic' }}>No quotes yet.</p>;
  }

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}

      {isOwner && !showNewQuote && (
        <button className={`${styles.addBtn} ${styles.addCategoryBtn}`} onClick={() => setShowNewQuote(true)}>
          + Add a quote
        </button>
      )}
      {isOwner && showNewQuote && (
        <QuoteForm onSave={addQuote} onCancel={() => setShowNewQuote(false)} />
      )}

      {quotes.length === 0 && isOwner && !showNewQuote && (
        <p style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>
          No quotes yet. Start collecting the words that stay with you.
        </p>
      )}

      {quotes.map((quote, index) => (
        <div key={quote.id} className={styles.category} style={{ paddingBottom: 'var(--space-lg)' }}>
          {editingQuoteId === quote.id ? (
            <QuoteForm
              initial={quote}
              onSave={(data) => updateQuote(quote.id, data)}
              onCancel={() => setEditingQuoteId(null)}
            />
          ) : (
            <>
              <div className={styles.categoryHeader}>
                <div style={{ flex: 1 }}>
                  <blockquote style={{ margin: 0, fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.7 }}>
                    &ldquo;{quote.quote_text}&rdquo;
                  </blockquote>
                  {(quote.attribution || quote.source) && (
                    <p style={{ marginTop: 'var(--space-sm)', fontSize: '0.9rem', color: 'var(--color-ink-light)' }}>
                      {quote.attribution && <span>— {quote.attribution}</span>}
                      {quote.attribution && quote.source && ', '}
                      {quote.source && <em>{quote.source}</em>}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <div className={styles.actions}>
                    <div className={styles.reorderGroup}>
                      <button className={styles.reorderBtn} onClick={() => reorderQuote(index, -1)} disabled={index === 0} title="Move up">&#9650;</button>
                      <button className={styles.reorderBtn} onClick={() => reorderQuote(index, 1)} disabled={index === quotes.length - 1} title="Move down">&#9660;</button>
                    </div>
                    <button className={styles.iconBtn} onClick={() => setEditingQuoteId(quote.id)} title="Edit">Edit</button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => deleteQuote(quote.id)} title="Delete">Delete</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
