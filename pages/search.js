import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/Explore.module.css';
import searchStyles from '@/styles/Search.module.css';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState(router.query.q || '');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q || q.length < 2) return;

    setSearching(true);

    // Update URL without full navigation
    router.replace(`/search?q=${encodeURIComponent(q)}`, undefined, { shallow: true });

    const pattern = `%${q}%`;

    try {
      const [
        { data: profiles },
        { data: categories },
        { data: works },
        { data: quotes },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, handle, display_name, bio')
          .or(`handle.ilike.${pattern},display_name.ilike.${pattern},bio.ilike.${pattern}`)
          .limit(20),
        supabase
          .from('categories')
          .select('id, name, introduction, user_id, profiles(handle, display_name)')
          .ilike('name', pattern)
          .limit(20),
        supabase
          .from('works')
          .select('id, title, commentary, category_id, user_id, profiles(handle, display_name), categories(name)')
          .or(`title.ilike.${pattern},commentary.ilike.${pattern}`)
          .limit(20),
        supabase
          .from('quotes')
          .select('id, quote_text, attribution, user_id, profiles(handle, display_name)')
          .or(`quote_text.ilike.${pattern},attribution.ilike.${pattern}`)
          .limit(20),
      ]);

      setResults({
        profiles: profiles || [],
        categories: categories || [],
        works: works || [],
        quotes: quotes || [],
      });
    } catch (err) {
      console.error('Search failed:', err);
      setResults({ profiles: [], categories: [], works: [], quotes: [] });
    } finally {
      setSearching(false);
    }
  }

  const totalResults = results
    ? results.profiles.length + results.categories.length + results.works.length + results.quotes.length
    : null;

  return (
    <>
      <Head>
        <title>Search — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Search</h1>
          <p className={styles.pageDesc}>Find gardens, categories, works and quotes.</p>
        </div>

        <form onSubmit={handleSearch} className={searchStyles.form}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything..."
            className={searchStyles.input}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={searching || query.trim().length < 2}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {results && totalResults === 0 && (
          <p className={styles.empty}>No results found for &ldquo;{router.query.q}&rdquo;</p>
        )}

        {results && totalResults > 0 && (
          <div className={searchStyles.results}>
            {/* Gardens */}
            {results.profiles.length > 0 && (
              <section className={searchStyles.section}>
                <h2 className={searchStyles.sectionTitle}>Gardens</h2>
                <div className={styles.grid}>
                  {results.profiles.map((p) => (
                    <div key={p.id} className={searchStyles.card}>
                      <Link href={`/${p.handle}`} className={searchStyles.cardLink}>
                        <p className={searchStyles.cardTitle}>{p.display_name || p.handle}</p>
                        <p className={searchStyles.cardMeta}>@{p.handle}</p>
                        {p.bio && <p className={searchStyles.cardBody}>{p.bio}</p>}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {results.categories.length > 0 && (
              <section className={searchStyles.section}>
                <h2 className={searchStyles.sectionTitle}>Categories</h2>
                <div className={styles.grid}>
                  {results.categories.map((c) => (
                    <div key={c.id} className={searchStyles.card}>
                      <Link href={`/${c.profiles?.handle}?tab=garden&item=${c.id}`} className={searchStyles.cardLink}>
                        <p className={searchStyles.cardTitle}>{c.name}</p>
                        <p className={searchStyles.cardMeta}>by {c.profiles?.display_name || c.profiles?.handle}</p>
                        {c.introduction && <p className={searchStyles.cardBodyItalic}>{c.introduction}</p>}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Works */}
            {results.works.length > 0 && (
              <section className={searchStyles.section}>
                <h2 className={searchStyles.sectionTitle}>Works</h2>
                <div className={styles.grid}>
                  {results.works.map((w) => (
                    <div key={w.id} className={searchStyles.card}>
                      <Link href={`/${w.profiles?.handle}?tab=garden&item=${w.id}`} className={searchStyles.cardLink}>
                        <p className={searchStyles.cardTitle}>{w.title}</p>
                        <p className={searchStyles.cardMeta}>
                          {w.categories?.name && <>{w.categories.name} &middot; </>}
                          {w.profiles?.display_name || w.profiles?.handle}
                        </p>
                        {w.commentary && <p className={searchStyles.cardBody}>{w.commentary}</p>}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quotes */}
            {results.quotes.length > 0 && (
              <section className={searchStyles.section}>
                <h2 className={searchStyles.sectionTitle}>Quotes</h2>
                <div className={styles.grid}>
                  {results.quotes.map((q) => (
                    <div key={q.id} className={searchStyles.card}>
                      <Link href={`/${q.profiles?.handle}?tab=quotes&item=${q.id}`} className={searchStyles.cardLink}>
                        <p className={searchStyles.cardQuote}>{q.quote_text}</p>
                        <p className={searchStyles.cardAttr}>
                          {q.attribution}
                          {q.profiles && <> &middot; {q.profiles.display_name || q.profiles.handle}&rsquo;s garden</>}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
