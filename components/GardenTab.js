import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { checkDailyLimit } from '@/lib/rateLimits';
import { moderateFields } from '@/lib/moderation';
import { logWriteFailure } from '@/lib/logger';
import { uniqueSlug } from '@/lib/slug';
import { categoryPath, workPath } from '@/lib/links';
import ShareButton from './ShareButton';
import ReRecButton from './ReRecButton';
import { Leaf } from './CardOrnaments';
import LikeButton from './LikeButton';
import SaveButton from './SaveButton';
import styles from '@/styles/Garden.module.css';

// ─── Table of Contents ─────────────────────────────────────────
function TableOfContents({ categories }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tocRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (categories.length < 2) return null;

  function handleClick(categoryId) {
    const el = document.getElementById(categoryId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setOpen(false);
  }

  const tocList = (
    <ul className={styles.tocList}>
      {categories.map((cat) => (
        <li key={cat.id} className={styles.tocItem}>
          <button className={styles.tocLink} onClick={() => handleClick(cat.id)}>
            {cat.name}
          </button>
        </li>
      ))}
    </ul>
  );

  if (!isMobile) {
    return (
      <div className={styles.toc}>
        {tocList}
      </div>
    );
  }

  return (
    <div className={styles.toc} ref={tocRef}>
      <button
        className={styles.tocToggle}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Contents
        <span className={`${styles.tocArrow} ${open ? styles.tocArrowOpen : ''}`}>&#9662;</span>
      </button>
      {open && tocList}
    </div>
  );
}

// ─── Category Form ──────────────────────────────────────────────
function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [introduction, setIntroduction] = useState(initial?.introduction || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), introduction: introduction.trim() });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.formTitle}>{initial ? 'Edit category' : 'New category'}</p>
      <div className={styles.field}>
        <label htmlFor="catName">Name</label>
        <input
          id="catName"
          type="text"
          placeholder='e.g. "Best Books About Rome"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={200}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="catIntro">Introduction (optional)</label>
        <textarea
          id="catIntro"
          placeholder="A few words about this category..."
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
          rows={3}
          maxLength={2000}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Save' : 'Add category'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Work Form ──────────────────────────────────────────────────
function WorkForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [commentary, setCommentary] = useState(initial?.commentary || '');
  const [saving, setSaving] = useState(false);

  // Editing an already-published work only offers Save; new works and
  // drafts offer Publish (primary) or Save draft (secondary).
  const isEditingPublished = !!initial && !initial.is_draft;

  async function submitWith(isDraft) {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({ title: title.trim(), commentary: commentary.trim(), isDraft });
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await submitWith(false);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.formTitle}>{initial ? 'Edit work' : 'Add a work'}</p>
      <div className={styles.field}>
        <label htmlFor="workTitle">Title</label>
        <input
          id="workTitle"
          type="text"
          placeholder='e.g. "Plutarch — Lives"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={300}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="workComm">Commentary (optional)</label>
        <textarea
          id="workComm"
          placeholder="Why does this work matter to you?"
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          rows={3}
          maxLength={5000}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
          {saving ? 'Saving...' : isEditingPublished ? 'Save' : 'Publish'}
        </button>
        {!isEditingPublished && (
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => submitWith(true)}
            disabled={saving}
          >
            Save draft
          </button>
        )}
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main GardenTab ─────────────────────────────────────────────
export default function GardenTab({ userId, isOwner, profileHandle, profileName, initialCategories, initialWorks }) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [worksByCategory, setWorksByCategory] = useState(() => {
    const grouped = {};
    for (const cat of (initialCategories || [])) {
      grouped[cat.id] = (initialWorks || [])
        .filter((w) => w.category_id === cat.id)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    return grouped;
  });

  // UI state
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [addingWorkToCategoryId, setAddingWorkToCategoryId] = useState(null);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [error, setError] = useState('');

  // Drafts are hidden from the anonymous build-time fetch by RLS, so the
  // owner's initial props never include them. Once we know the viewer is
  // the owner, refetch works with their session so drafts appear.
  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('works')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });
      if (cancelled || !data) return;
      const grouped = {};
      for (const w of data) {
        if (!grouped[w.category_id]) grouped[w.category_id] = [];
        grouped[w.category_id].push(w);
      }
      setWorksByCategory((prev) => {
        const merged = { ...grouped };
        for (const key of Object.keys(prev)) {
          if (!merged[key]) merged[key] = [];
        }
        return merged;
      });
    })();
    return () => { cancelled = true; };
  }, [isOwner, userId]);

  // ─── Category CRUD ──────────────────────────────────────────

  async function addCategory({ name, introduction }) {
    setError('');
    const limit = await checkDailyLimit(userId, 'categories');
    if (!limit.allowed) { setError(limit.message); return; }
    const mod = await moderateFields({ name, introduction });
    if (!mod.allowed) { setError(mod.reason); return; }
    const sortOrder = categories.length;
    const slug = uniqueSlug(name, categories.map((c) => c.slug).filter(Boolean));
    let { error: insertErr } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, slug, introduction, sort_order: sortOrder });
    if (insertErr?.code === '23505') {
      // Slug collision (stale local state, e.g. a second tab): regenerate
      // against the slugs actually in the database and retry once.
      const { data: existing } = await supabase
        .from('categories')
        .select('slug')
        .eq('user_id', userId);
      const retrySlug = uniqueSlug(name, (existing || []).map((c) => c.slug).filter(Boolean));
      ({ error: insertErr } = await supabase
        .from('categories')
        .insert({ user_id: userId, name, slug: retrySlug, introduction, sort_order: sortOrder }));
    }
    if (insertErr) { logWriteFailure({ action: 'add_category', error: insertErr }); setError(insertErr.message); return; }

    // Fetch fresh categories after successful insert
    const { data: freshCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });
    setCategories(freshCategories || []);
    // Preserve existing works state; add empty array for any new categories
    const newWorksByCategory = { ...worksByCategory };
    for (const cat of (freshCategories || [])) {
      if (!newWorksByCategory[cat.id]) {
        newWorksByCategory[cat.id] = [];
      }
    }
    setWorksByCategory(newWorksByCategory);
    setShowNewCategory(false);
  }

  async function updateCategory(id, { name, introduction }) {
    setError('');
    const mod = await moderateFields({ name, introduction });
    if (!mod.allowed) { setError(mod.reason); return; }
    const { error: err } = await supabase
      .from('categories')
      .update({ name, introduction })
      .eq('id', id);
    if (err) { logWriteFailure({ action: 'update_category', error: err }); setError(err.message); return; }
    setCategories(categories.map((c) => c.id === id ? { ...c, name, introduction } : c));
    setEditingCategoryId(null);
  }

  async function deleteCategory(id) {
    if (!window.confirm('Delete this category and all its works?')) return;
    setError('');
    const { error: err } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (err) { setError(err.message); return; }
    setCategories(categories.filter((c) => c.id !== id));
    const newWorks = { ...worksByCategory };
    delete newWorks[id];
    setWorksByCategory(newWorks);
  }

  async function reorderCategory(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const oldCategories = categories;
    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(newIndex, 0, moved);

    const updates = newCategories.map((cat, i) => ({ ...cat, sort_order: i }));
    setCategories(updates);

    try {
      const results = await Promise.all(
        updates.map((cat) =>
          supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', cat.id)
        )
      );
      if (results.some((r) => r.error)) {
        setError('Failed to save new order');
        setCategories(oldCategories);
      }
    } catch {
      setError('Failed to save new order');
      setCategories(oldCategories);
    }
  }

  // ─── Work CRUD ────────────────────────────────────────────────

  async function addWork(categoryId, { title, commentary, isDraft }) {
    setError('');
    const limit = await checkDailyLimit(userId, 'works');
    if (!limit.allowed) { setError(limit.message); return; }
    const mod = await moderateFields({ title, commentary });
    if (!mod.allowed) { setError(mod.reason); return; }
    const existingWorks = worksByCategory[categoryId] || [];
    const sortOrder = existingWorks.length;
    const slug = uniqueSlug(title, existingWorks.map((w) => w.slug).filter(Boolean));
    const row = { category_id: categoryId, user_id: userId, title, slug, commentary, sort_order: sortOrder, is_draft: !!isDraft };
    let { error: insertErr } = await supabase.from('works').insert(row);
    if (insertErr?.code === '23505') {
      // Slug collision (stale local state, e.g. a second tab): regenerate
      // against the slugs actually in the database and retry once.
      const { data: existing } = await supabase
        .from('works')
        .select('slug')
        .eq('category_id', categoryId);
      const retrySlug = uniqueSlug(title, (existing || []).map((w) => w.slug).filter(Boolean));
      ({ error: insertErr } = await supabase.from('works').insert({ ...row, slug: retrySlug }));
    }
    if (insertErr) { logWriteFailure({ action: 'add_work', error: insertErr }); setError(insertErr.message); return; }

    // Fetch fresh works for this category after successful insert
    const { data: freshWorks } = await supabase
      .from('works')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });
    setWorksByCategory({
      ...worksByCategory,
      [categoryId]: freshWorks || [],
    });
    setAddingWorkToCategoryId(null);
  }

  async function updateWork(categoryId, workId, { title, commentary, isDraft }) {
    setError('');
    const mod = await moderateFields({ title, commentary });
    if (!mod.allowed) { setError(mod.reason); return; }
    const { error: err } = await supabase
      .from('works')
      .update({ title, commentary, is_draft: !!isDraft })
      .eq('id', workId);
    if (err) { logWriteFailure({ action: 'update_work', error: err }); setError(err.message); return; }
    setWorksByCategory({
      ...worksByCategory,
      [categoryId]: worksByCategory[categoryId].map((w) =>
        w.id === workId ? { ...w, title, commentary, is_draft: !!isDraft } : w
      ),
    });
    setEditingWorkId(null);
  }

  // Flip a draft live from its row button — content was already moderated
  // when the draft was saved.
  async function publishWork(categoryId, workId) {
    setError('');
    const { error: err } = await supabase
      .from('works')
      .update({ is_draft: false })
      .eq('id', workId);
    if (err) { logWriteFailure({ action: 'publish_work', error: err }); setError(err.message); return; }
    setWorksByCategory({
      ...worksByCategory,
      [categoryId]: worksByCategory[categoryId].map((w) =>
        w.id === workId ? { ...w, is_draft: false } : w
      ),
    });
  }

  async function deleteWork(categoryId, workId) {
    if (!window.confirm('Delete this work?')) return;
    setError('');
    const { error: err } = await supabase
      .from('works')
      .delete()
      .eq('id', workId);
    if (err) { setError(err.message); return; }
    setWorksByCategory({
      ...worksByCategory,
      [categoryId]: worksByCategory[categoryId].filter((w) => w.id !== workId),
    });
  }

  async function reorderWork(categoryId, index, direction) {
    const works = worksByCategory[categoryId];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= works.length) return;

    const oldWorks = worksByCategory;
    const newWorks = [...works];
    const [moved] = newWorks.splice(index, 1);
    newWorks.splice(newIndex, 0, moved);

    const updates = newWorks.map((w, i) => ({ ...w, sort_order: i }));
    setWorksByCategory({ ...worksByCategory, [categoryId]: updates });

    try {
      const results = await Promise.all(
        updates.map((w) =>
          supabase.from('works').update({ sort_order: w.sort_order }).eq('id', w.id)
        )
      );
      if (results.some((r) => r.error)) {
        setError('Failed to save new order');
        setWorksByCategory(oldWorks);
      }
    } catch {
      setError('Failed to save new order');
      setWorksByCategory(oldWorks);
    }
  }

  // ─── Render ───────────────────────────────────────────────────

  if (categories.length === 0 && !isOwner) {
    return <p className="emptyState" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>This garden is empty.</p>;
  }

  return (
    <div>
      {error && <p className={styles.error}>{error}</p>}

      {/* Owner: Add category button / form */}
      {isOwner && !showNewCategory && (
        <button className={`${styles.addBtn} ${styles.addCategoryBtn}`} onClick={() => setShowNewCategory(true)}>
          + Add a category
        </button>
      )}
      {isOwner && showNewCategory && (
        <CategoryForm onSave={addCategory} onCancel={() => setShowNewCategory(false)} />
      )}

      {/* Empty state for owner */}
      {categories.length === 0 && isOwner && !showNewCategory && (
        <p style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-ink-faint)', fontStyle: 'italic' }}>
          Your garden is empty. Start by adding a category.
        </p>
      )}

      {/* Table of Contents */}
      <TableOfContents categories={categories} />

      {/* Categories */}
      {categories.map((category, catIndex) => (
        <div key={category.id} id={category.id} className={styles.category}>
          {editingCategoryId === category.id ? (
            <CategoryForm
              initial={category}
              onSave={(data) => updateCategory(category.id, data)}
              onCancel={() => setEditingCategoryId(null)}
            />
          ) : (
            <>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryName}>{category.name}</h2>
                <div className={styles.actions}>
                  {!isOwner && (
                    <>
                      <LikeButton itemId={category.id} itemType="category" />
                      <SaveButton itemId={category.id} itemType="category" />
                    </>
                  )}
                  <ShareButton tab="garden" itemId={category.id} handle={profileHandle} path={categoryPath(profileHandle, category.slug, category.id)} />
                  {isOwner && (
                    <>
                      <div className={styles.reorderGroup}>
                        <button
                          className={styles.reorderBtn}
                          onClick={() => reorderCategory(catIndex, -1)}
                          disabled={catIndex === 0}
                          title="Move up"
                        >&#9650;</button>
                        <button
                          className={styles.reorderBtn}
                          onClick={() => reorderCategory(catIndex, 1)}
                          disabled={catIndex === categories.length - 1}
                          title="Move down"
                        >&#9660;</button>
                      </div>
                      <button className={styles.iconBtn} onClick={() => setEditingCategoryId(category.id)} title="Edit">
                        Edit
                      </button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => deleteCategory(category.id)} title="Delete">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              {category.introduction && (
                <p className={styles.categoryIntro}>{category.introduction}</p>
              )}
            </>
          )}

          {/* Works list */}
          {(worksByCategory[category.id] || []).length > 0 ? (
            <ul className={styles.worksList}>
              {(worksByCategory[category.id] || []).map((work, workIndex) => (
                <li key={work.id} id={work.id} className={styles.work}>
                  {editingWorkId === work.id ? (
                    <WorkForm
                      initial={work}
                      onSave={(data) => updateWork(category.id, work.id, data)}
                      onCancel={() => setEditingWorkId(null)}
                    />
                  ) : (
                    <div className={styles.workLayout}>
                      <p className={`${styles.workTitle} ${work.is_draft ? styles.workTitleDraft : ''}`}>
                        {work.title}
                        {work.is_draft && (
                          <span className={styles.draftChip}>
                            <Leaf className={styles.draftChipLeaf} />
                            Draft
                          </span>
                        )}
                      </p>
                      <div className={styles.workActions}>
                        {!isOwner && (
                          <>
                            <LikeButton itemId={work.id} itemType="work" />
                            <SaveButton itemId={work.id} itemType="work" />
                          </>
                        )}
                        {!isOwner && (
                          <ReRecButton
                            workTitle={work.title}
                            recommenderHandle={profileHandle}
                            recommenderName={profileName}
                            tab="garden"
                            itemId={work.id}
                            sourcePath={workPath(profileHandle, category.slug, work.slug, work.id)}
                          />
                        )}
                        {!work.is_draft && (
                          <ShareButton tab="garden" itemId={work.id} handle={profileHandle} path={workPath(profileHandle, category.slug, work.slug, work.id)} />
                        )}
                        {isOwner && work.is_draft && (
                          <button
                            className={`${styles.iconBtn} ${styles.publishBtn}`}
                            onClick={() => publishWork(category.id, work.id)}
                            title="Publish this work"
                          >
                            Publish
                          </button>
                        )}
                        {isOwner && (
                          <>
                            <div className={styles.reorderGroup}>
                              <button
                                className={styles.reorderBtn}
                                onClick={() => reorderWork(category.id, workIndex, -1)}
                                disabled={workIndex === 0}
                                title="Move up"
                              >&#9650;</button>
                              <button
                                className={styles.reorderBtn}
                                onClick={() => reorderWork(category.id, workIndex, 1)}
                                disabled={workIndex === worksByCategory[category.id].length - 1}
                                title="Move down"
                              >&#9660;</button>
                            </div>
                            <button className={styles.iconBtn} onClick={() => setEditingWorkId(work.id)} title="Edit">
                              Edit
                            </button>
                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => deleteWork(category.id, work.id)} title="Delete">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                      {work.commentary && (
                        <p className={styles.workCommentary}>{work.commentary}</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            isOwner && (
              <p className={styles.emptyWorks}>No works in this category yet.</p>
            )
          )}

          {/* Owner: Add work button / form */}
          {isOwner && addingWorkToCategoryId === category.id ? (
            <WorkForm
              onSave={(data) => addWork(category.id, data)}
              onCancel={() => setAddingWorkToCategoryId(null)}
            />
          ) : isOwner && editingCategoryId !== category.id ? (
            <button
              className={`${styles.addBtn} ${styles.addWorkBtn}`}
              onClick={() => setAddingWorkToCategoryId(category.id)}
            >
              + Add a work
            </button>
          ) : null}
        </div>
      ))}

      {/* Owner: Bottom add category button (when categories exist) */}
      {isOwner && categories.length > 0 && !showNewCategory && (
        <button className={`${styles.addBtn} ${styles.addCategoryBtn}`} onClick={() => setShowNewCategory(true)}>
          + Add a category
        </button>
      )}
    </div>
  );
}
