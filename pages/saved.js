import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { categoryPath, workPath } from '@/lib/links';
import styles from '@/styles/Explore.module.css';

const TABS = ['Works', 'Quotes', 'Categories'];

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Works');
  const [items, setItems] = useState({ works: [], quotes: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
      return;
    }

    async function fetchSaved() {
      setLoading(true);

      // Get all saves for this user
      const { data: saves } = await supabase
        .from('saves')
        .select('item_id, item_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!saves || saves.length === 0) {
        setItems({ works: [], quotes: [], categories: [] });
        setLoading(false);
        return;
      }

      const workIds = saves.filter((s) => s.item_type === 'work').map((s) => s.item_id);
      const quoteIds = saves.filter((s) => s.item_type === 'quote').map((s) => s.item_id);
      const categoryIds = saves.filter((s) => s.item_type === 'category').map((s) => s.item_id);

      const [worksRes, quotesRes, categoriesRes] = await Promise.all([
        workIds.length > 0
          ? supabase.from('works').select('id, title, slug, commentary, profiles!user_id(handle, display_name), categories!category_id(slug)').in('id', workIds)
          : { data: [] },
        quoteIds.length > 0
          ? supabase.from('quotes').select('id, quote_text, attribution, source, profiles!user_id(handle, display_name)').in('id', quoteIds)
          : { data: [] },
        categoryIds.length > 0
          ? supabase.from('categories').select('id, name, slug, introduction, profiles!user_id(handle, display_name)').in('id', categoryIds)
          : { data: [] },
      ]);

      // Preserve saved ordering (most recent first)
      const workOrder = Object.fromEntries(workIds.map((id, i) => [id, i]));
      const quoteOrder = Object.fromEntries(quoteIds.map((id, i) => [id, i]));
      const catOrder = Object.fromEntries(categoryIds.map((id, i) => [id, i]));

      setItems({
        works: (worksRes.data || []).sort((a, b) => (workOrder[a.id] ?? 0) - (workOrder[b.id] ?? 0)),
        quotes: (quotesRes.data || []).sort((a, b) => (quoteOrder[a.id] ?? 0) - (quoteOrder[b.id] ?? 0)),
        categories: (categoriesRes.data || []).sort((a, b) => (catOrder[a.id] ?? 0) - (catOrder[b.id] ?? 0)),
      });
      setLoading(false);
    }

    fetchSaved();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <>
        <Head><title>Saved — A Walled Garden</title></Head>
        <div className={styles.page}>
          <p className={styles.empty}>Loading...</p>
        </div>
      </>
    );
  }

  const totalSaved = items.works.length + items.quotes.length + items.categories.length;

  return (
    <>
      <Head>
        <title>Saved — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Saved</h1>
          <p className={styles.pageDesc}>Your bookmarked works, quotes and categories.</p>
        </div>

        <div className={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.navLink} ${activeTab === tab ? styles.navLinkActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {totalSaved === 0 ? (
          <p className={styles.empty}>
            Nothing saved yet. Browse <Link href="/explore">Explore</Link> to discover works, quotes and categories worth saving.
          </p>
        ) : (
          <div className={styles.grid}>
            {activeTab === 'Works' && items.works.map((w) => (
              <div key={w.id} className={styles.card}>
                <Link
                  href={workPath(w.profiles?.handle, w.categories?.slug, w.slug, w.id)}
                  className={styles.cardLink}
                >
                  <p className={styles.cardTitle}>{w.title}</p>
                  <p className={styles.cardMeta}>
                    {w.profiles?.display_name || w.profiles?.handle || 'Unknown'}
                  </p>
                  {w.commentary && <p className={styles.cardBody}>{w.commentary}</p>}
                </Link>
              </div>
            ))}

            {activeTab === 'Quotes' && items.quotes.map((q) => (
              <div key={q.id} className={styles.card}>
                <Link
                  href={q.profiles?.handle ? `/${q.profiles.handle}?tab=quotes&item=${q.id}` : '#'}
                  className={styles.cardLink}
                >
                  <p className={styles.cardQuote}>&ldquo;{q.quote_text}&rdquo;</p>
                  {q.attribution && (
                    <p className={styles.cardAttr}>
                      &mdash; {q.attribution}
                      {q.source && <span>, <em>{q.source}</em></span>}
                    </p>
                  )}
                  <p className={styles.cardMeta} style={{ marginTop: 'var(--space-sm)' }}>
                    Shared by {q.profiles?.display_name || q.profiles?.handle || 'Unknown'}
                  </p>
                </Link>
              </div>
            ))}

            {activeTab === 'Categories' && items.categories.map((c) => (
              <div key={c.id} className={styles.card}>
                <Link
                  href={categoryPath(c.profiles?.handle, c.slug, c.id)}
                  className={styles.cardLink}
                >
                  <p className={styles.cardTitle}>{c.name}</p>
                  <p className={styles.cardMeta}>
                    {c.profiles?.display_name || c.profiles?.handle || 'Unknown'}
                  </p>
                  {c.introduction && <p className={styles.cardBodyItalic}>{c.introduction}</p>}
                </Link>
              </div>
            ))}

            {activeTab === 'Works' && items.works.length === 0 && (
              <p className={styles.empty}>No saved works yet.</p>
            )}
            {activeTab === 'Quotes' && items.quotes.length === 0 && (
              <p className={styles.empty}>No saved quotes yet.</p>
            )}
            {activeTab === 'Categories' && items.categories.length === 0 && (
              <p className={styles.empty}>No saved categories yet.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
