import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import GardenTab from '@/components/GardenTab';
import styles from '@/styles/Profile.module.css';

const TABS = ['Garden', 'Quotes', 'Re-recs', 'Following'];

export default function ProfilePage({ profile: initialProfile, followerCount: initialFollowerCount, followingCount: initialFollowingCount, categories: initialCategories, works: initialWorks }) {
  const router = useRouter();
  const { user, profile: myProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Garden');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount || 0);

  const profile = initialProfile;
  const isOwner = user && profile && user.id === profile.id;

  // Check if current user follows this profile
  useEffect(() => {
    async function checkFollow() {
      if (!user || !profile || isOwner) return;
      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single();
      setIsFollowing(!!data);
    }
    checkFollow();
  }, [user, profile, isOwner]);

  async function handleFollow() {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: profile.id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  }

  if (router.isFallback || !profile) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>{profile.display_name || profile.handle} — A Walled Garden</title>
        <meta name="description" content={profile.bio || `${profile.display_name}'s garden`} />
      </Head>

      <div className={styles.header}>
        <h1 className={styles.displayName}>{profile.display_name || profile.handle}</h1>
        <p className={styles.handle}>@{profile.handle}</p>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <div className={styles.stats}>
          <span><span className={styles.statCount}>{followerCount}</span> {followerCount === 1 ? 'follower' : 'followers'}</span>
          <span><span className={styles.statCount}>{initialFollowingCount || 0}</span> following</span>
        </div>
        {!isOwner && user && (
          <button
            onClick={handleFollow}
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-small ${styles.followBtn}`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
        {!isOwner && !user && (
          <button
            onClick={() => router.push('/signin')}
            className={`btn btn-primary btn-small ${styles.followBtn}`}
          >
            Follow
          </button>
        )}
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'Garden' && (
          <GardenTab
            userId={profile.id}
            isOwner={isOwner}
            initialCategories={initialCategories || []}
            initialWorks={initialWorks || []}
          />
        )}
        {activeTab === 'Quotes' && (
          <p className={styles.emptyState}>
            {isOwner
              ? 'No quotes yet. You\'ll be able to add quotes soon.'
              : 'No quotes yet.'}
          </p>
        )}
        {activeTab === 'Re-recs' && (
          <p className={styles.emptyState}>
            {isOwner
              ? 'No re-recs yet. You\'ll be able to share recommendations soon.'
              : 'No re-recs yet.'}
          </p>
        )}
        {activeTab === 'Following' && (
          <p className={styles.emptyState}>
            {isOwner
              ? 'You\'re not following anyone yet.'
              : `${profile.display_name || profile.handle} isn't following anyone yet.`}
          </p>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { handle } = params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!profile) {
    return { notFound: true };
  }

  // Get follower/following counts
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  // Get categories and works for the garden
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true });

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .eq('user_id', profile.id)
    .order('sort_order', { ascending: true });

  return {
    props: {
      profile,
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      categories: categories || [],
      works: works || [],
    },
  };
}
