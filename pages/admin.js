import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Settings.module.css';

// Hardcode admin user IDs here — or add an is_admin column to profiles later
const ADMIN_IDS = [];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && (ADMIN_IDS.length === 0 || ADMIN_IDS.includes(user.id));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/signin');
      return;
    }
    // If ADMIN_IDS is empty, any logged-in user can see admin (for initial setup)
    // Once you add your user ID to ADMIN_IDS, it locks down
    fetchReports();
  }, [user, authLoading, router]);

  async function fetchReports() {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reporter_id(handle, display_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    setReports(data || []);
    setLoading(false);
  }

  async function resolveReport(id) {
    const { error } = await supabase
      .from('reports')
      .update({ resolved: true })
      .eq('id', id);
    if (!error) {
      setReports(reports.map((r) => r.id === id ? { ...r, resolved: true } : r));
    }
  }

  async function deleteContent(report) {
    const confirmed = window.confirm(
      `Delete this ${report.item_type} (ID: ${report.item_id})?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    const table = report.item_type === 'work' ? 'works'
      : report.item_type === 'quote' ? 'quotes'
      : report.item_type === 'category' ? 'categories'
      : report.item_type === 'profile' ? 'profiles'
      : report.item_type === 'rerec' ? 'rerecs'
      : null;

    if (!table) return;

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', report.item_id);

    if (error) {
      alert(`Failed to delete: ${error.message}`);
    } else {
      await resolveReport(report.id);
      alert('Content deleted and report resolved.');
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Head><title>Admin — A Walled Garden</title></Head>
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-ink-faint)' }}>Loading...</div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Head><title>Admin — A Walled Garden</title></Head>
        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-ink-faint)' }}>Access denied.</div>
      </>
    );
  }

  const pending = reports.filter((r) => !r.resolved);
  const resolved = reports.filter((r) => r.resolved);

  return (
    <>
      <Head>
        <title>Admin — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <h1 className={styles.title}>Admin — Reports</h1>

        <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-md)' }}>
          Pending ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p style={{ color: 'var(--color-ink-faint)', fontStyle: 'italic', marginBottom: 'var(--space-xl)' }}>
            No pending reports.
          </p>
        ) : (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            {pending.map((report) => (
              <div key={report.id} style={{
                border: '1px solid var(--color-border-light)',
                borderRadius: '10px',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-ink-faint)', marginBottom: 'var(--space-xs)' }}>
                  <strong>{report.item_type}</strong> &middot; reported by {report.reporter?.display_name || report.reporter?.handle || 'unknown'}
                  &middot; {new Date(report.created_at).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-xs)' }}>
                  Item ID: <code style={{ fontSize: '0.8rem', background: 'var(--color-surface)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{report.item_id}</code>
                </p>
                <p style={{ fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>
                  &ldquo;{report.reason}&rdquo;
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn-secondary btn-small" onClick={() => resolveReport(report.id)}>
                    Dismiss
                  </button>
                  <button
                    className="btn btn-small"
                    style={{ background: 'var(--color-error)', color: 'white' }}
                    onClick={() => deleteContent(report)}
                  >
                    Delete content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-md)', color: 'var(--color-ink-faint)' }}>
              Resolved ({resolved.length})
            </h2>
            {resolved.map((report) => (
              <div key={report.id} style={{
                border: '1px solid var(--color-border-light)',
                borderRadius: '10px',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-sm)',
                opacity: 0.6,
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--color-ink-faint)' }}>
                  <strong>{report.item_type}</strong> &middot; {report.reporter?.display_name || report.reporter?.handle || 'unknown'}
                  &middot; &ldquo;{report.reason}&rdquo;
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
