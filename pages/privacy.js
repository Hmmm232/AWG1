import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — A Walled Garden</title>
      </Head>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-xl) 0' }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
          Last updated: March 2026
        </p>

        <h2>What we collect</h2>
        <p>
          When you create an account we store your email address, a chosen handle,
          display name, and any content you add to your garden (works, quotes,
          categories, re-recommendations). We also store follows, likes and saved
          items to provide the service.
        </p>

        <h2>How we use your data</h2>
        <p>
          Your data is used solely to provide A Walled Garden. We do not sell your
          data. We do not share it with third-party advertisers. Content you post is
          publicly visible on your garden page and in explore listings.
        </p>

        <h2>Cookies</h2>
        <p>
          We use essential cookies only — for authentication and keeping you signed
          in. We do not use tracking or advertising cookies.
        </p>

        <h2>Data storage</h2>
        <p>
          Your data is stored securely via Supabase (hosted on AWS infrastructure).
          Passwords are hashed and never stored in plain text.
        </p>

        <h2>Your rights</h2>
        <p>
          You may request deletion of your account and all associated data at any
          time from your <Link href="/settings">Settings</Link> page. You may also
          contact us to request a copy of your data or to ask any questions about
          how it is handled.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Significant changes will be
          communicated via the site.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this policy, please reach out via the contact
          information on our <Link href="/about">About</Link> page.
        </p>
      </div>
    </>
  );
}
