import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import styles from '@/styles/Settings.module.css';

export default function Settings() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        bio: bio.trim(),
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      refreshProfile();
      // Clear the "Saved" message after a few seconds
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
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
      </div>
    </>
  );
}
