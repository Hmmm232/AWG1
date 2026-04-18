import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import GardenTab from '@/components/GardenTab';
import QuotesTab from '@/components/QuotesTab';
import ReRecsTab from '@/components/ReRecsTab';
import FollowingTab from '@/components/FollowingTab';
import OnboardingModal from '@/components/OnboardingModal';
import styles from '@/styles/Profile.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

function ShareProfileButton({ handle }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/${handle}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className={`${styles.shareProfileBtn}`}
      onClick={handleShare}
      title="Copy link to this garden"
    >
      {copied ? 'Link copied!' : 'Share garden'}
    </button>
  );
}

const TABS = ['Garden', 'Quotes', 'Re-recs', 'Following'];

export default function ProfilePage({
  profile: initialProfile,
  followerCount: initialFollowerCount,
  followingCount: initialFollowingCount,
  categories: initialCategories,
  works: initialWorks,
  quotes: initialQuotes,
  rerecs: initialReRecs,
  following: initialFollowing,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Garden');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount || 0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const profile = initialProfile;
  const isOwner = user && profile && user.id === profile.id;

  // Show onboarding for new users with empty gardens
  useEffect(() => {
    if (!isOwner) return;
    const isEmpty = (initialCategories || []).length === 0
      && (initialQuotes || []).length === 0
      && (initialReRecs || []).length === 0;
    if (!isEmpty) return;
    const dismissed = localStorage.getItem('awg_onboarding_done');
    if (!dismissed) {
      setShowOnboarding(true);
    }
  }, [isOwner, initialCategories, initialQuotes, initialReRecs]);

  function handleOnboardingClose() {
    setShowOnboarding(false);
    localStorage.setItem('awg_onboarding_done', '1');
  }

  // Deep-link: read ?tab=...&item=... from URL and switch tab + scroll
  useEffect(() => {
    const TAB_MAP = { garden: 'Garden', quotes: 'Quotes', rerecs: 'Re-recs', following: 'Following' };
    const { tab, item } = router.query;
    if (tab && TAB_MAP[tab]) {
      setActiveTab(TAB_MAP[tab]);
    }
    if (item) {
      // Small delay so the tab content is visible before scrolling
      setTimeout(() => {
        const el = document.getElementById(item);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add('share-highlight');
          setTimeout(() => el.classList.remove('share-highlight'), 3000);
        }
      }, 150);
    }
  }, [router.query]);

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

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        if (!error) {
          setIsFollowing(false);
          setFollowerCount((c) => c - 1);
        }
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile.id });
        if (!error) {
          setIsFollowing(true);
          setFollowerCount((c) => c + 1);
        }
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    }
  }

  if (router.isFallback || !profile) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>{profile.display_name || profile.handle} — A Walled Garden</title>
        <meta name="description" content={profile.bio || `${profile.display_name || profile.handle}'s garden on A Walled Garden`} />
        <meta property="og:title" content={`${profile.display_name || profile.handle} — A Walled Garden`} />
        <meta property="og:description" content={profile.bio || `${profile.display_name || profile.handle}'s curated collection of works, quotes, and recommendations.`} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={`${SITE_URL}/api/og?title=${encodeURIComponent(profile.display_name || profile.handle)}&subtitle=${encodeURIComponent(profile.bio || `@${profile.handle}'s curated collection`)}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.display_name || profile.handle} — A Walled Garden`} />
        <meta name="twitter:description" content={profile.bio || `${profile.display_name || profile.handle}'s curated collection of works, quotes, and recommendations.`} />
        <meta name="twitter:image" content={`${SITE_URL}/api/og?title=${encodeURIComponent(profile.display_name || profile.handle)}&subtitle=${encodeURIComponent(profile.bio || `@${profile.handle}'s curated collection`)}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            mainEntity: {
              '@type': 'Person',
              name: profile.display_name || profile.handle,
              url: `${SITE_URL}/${profile.handle}`,
              ...(profile.bio && { description: profile.bio }),
            },
          }) }}
        />
      </Head>

      <div className={styles.header}>
        <h1 className={styles.displayName}>{profile.display_name || profile.handle}</h1>
        <p className={styles.handle}>@{profile.handle}</p>
        {profile.bio ? (
          <p className={styles.bio}>{profile.bio}</p>
        ) : isOwner ? (
          <p className={styles.bioPrompt}>
            <Link href="/settings">Add a bio</Link> to tell visitors about yourself and what you read.
          </p>
        ) : null}
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
        <ShareProfileButton handle={profile.handle} />
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
        <div style={{ display: activeTab === 'Garden' ? 'block' : 'none' }}>
          <GardenTab
            key={profile.id}
            userId={profile.id}
            isOwner={isOwner}
            profileHandle={profile.handle}
            profileName={profile.display_name || profile.handle}
            initialCategories={initialCategories || []}
            initialWorks={initialWorks || []}
          />
        </div>
        <div style={{ display: activeTab === 'Quotes' ? 'block' : 'none' }}>
          <QuotesTab
            key={profile.id}
            userId={profile.id}
            isOwner={isOwner}
            profileHandle={profile.handle}
            profileName={profile.display_name || profile.handle}
            initialQuotes={initialQuotes || []}
          />
        </div>
        <div style={{ display: activeTab === 'Re-recs' ? 'block' : 'none' }}>
          <ReRecsTab
            key={profile.id}
            userId={profile.id}
            isOwner={isOwner}
            initialReRecs={initialReRecs || []}
          />
        </div>
        <div style={{ display: activeTab === 'Following' ? 'block' : 'none' }}>
          <FollowingTab
            isOwner={isOwner}
            following={initialFollowing || []}
            profileName={profile.display_name || profile.handle}
          />
        </div>
      </div>

      {showOnboarding && (
        <OnboardingModal onClose={handleOnboardingClose} />
      )}
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { handle } = params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!profile) {
    return { notFound: true };
  }

  // Run all independent queries in parallel
  const [
    { count: followerCount },
    { count: followingCount },
    { data: categories },
    { data: works },
    { data: quotes },
    { data: rerecs },
    { data: followData },
  ] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profile.id),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('works')
      .select('*')
      .eq('user_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('quotes')
      .select('*')
      .eq('user_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('rerecs')
      .select('*')
      .eq('user_id', profile.id)
      .order('sort_order', { ascending: true }),
    // Single query with join instead of N+1
    supabase
      .from('follows')
      .select('following:profiles!following_id(id, handle, display_name, bio)')
      .eq('follower_id', profile.id),
  ]);

  const following = (followData || []).map((f) => f.following);

  return {
    props: {
      profile,
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      categories: categories || [],
      works: works || [],
      quotes: quotes || [],
      rerecs: rerecs || [],
      following,
    },
    revalidate: 60,
  };
}
