import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { moderateFields } from '@/lib/moderation';
import { logWriteFailure } from '@/lib/logger';
import styles from '@/styles/Settings.module.css';

export default function Settings() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const mod = await moderateFields({ display_name: displayName.trim(), bio: bio.trim() });
      if (!mod.allowed) {
        setError(mod.reason);
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
        })
        .eq('id', user.id);

      if (updateError) {
        logWriteFailure({ action: 'update_profile', error: updateError });
        setError(updateError.message);
      } else {
        setSaved(true);
        refreshProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      setError('Failed to save. Please try again.');
    }

    setSaving(false);
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account?\n\nAll your data (garden, quotes, re-recs, follows, likes, saves) will be permanently deleted. This cannot be undone.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Type your handle to confirm deletion:'
    );
    if (doubleConfirm !== profile?.handle) {
      alert('Handle did not match. Account was not deleted.');
      return;
    }

    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        alert('Failed to delete account: ' + deleteError.message);
        setDeleting(false);
        return;
      }

      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      alert('Something went wrong. Please try again.');
      setDeleting(false);
    }
  }

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Settings — A Walled Garden</title>
      </Head>

      <div className={styles.page}>
        <h1 className={styles.title}>Settings</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="handle">Handle</label>
            <input
              id="handle"
              type="text"
              value={profile?.handle || ''}
              disabled
            />
            <p className={styles.handleNote}>Your handle cannot be changed.</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself and what you read..."
              rows={4}
              maxLength={500}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            {saved && <span className={styles.saved}>Saved</span>}
          </div>
        </form>

        {profile?.handle && (
          <div className={styles.gardenLink}>
            <Link href={`/${profile.handle}`} className="btn btn-secondary">
              Go to my garden
            </Link>
          </div>
        )}

        <div className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Danger zone</h2>
          <p className={styles.dangerText}>
            Permanently delete your account and all your data (garden, quotes, re-recs, follows).
            This action cannot be undone.
          </p>
          <button
            className="btn btn-small"
            style={{ background: 'var(--color-error)', color: 'white' }}
            disabled={deleting}
            onClick={handleDeleteAccount}
          >
            {deleting ? 'Deleting...' : 'Delete my account'}
          </button>
        </div>
      </div>
    </>
  );
}
