import Head from 'next/head';
import Link from 'next/link';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — A Walled Garden</title>
      </Head>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-xl) 0' }}>
        <h1>Terms of Service</h1>
        <p style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
          Last updated: March 2026
        </p>

        <h2>Using A Walled Garden</h2>
        <p>
          By creating an account you agree to these terms. A Walled Garden is a
          platform for curating and sharing cultural works — books, essays, poems,
          quotes and other curiosities.
        </p>

        <h2>Your content</h2>
        <p>
          You retain ownership of the content you post. By posting content you grant
          us a licence to display it publicly on the site and in explore listings.
          You may delete your content at any time.
        </p>

        <h2>Acceptable use</h2>
        <p>
          You agree not to post content that is illegal, harassing, hateful,
          deliberately misleading, or that infringes the rights of others. We
          reserve the right to remove content and suspend accounts that violate
          these guidelines.
        </p>

        <h2>Reporting</h2>
        <p>
          If you see content that violates these terms, please use the Report button
          to flag it for review.
        </p>

        <h2>Account termination</h2>
        <p>
          You may delete your account at any time from
          your <Link href="/settings">Settings</Link> page. We may suspend or
          terminate accounts that violate these terms.
        </p>

        <h2>Disclaimer</h2>
        <p>
          A Walled Garden is provided as-is. We do our best to keep the service
          running and your data safe, but we cannot guarantee uninterrupted
          availability or absolute data security.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the service
          after changes constitutes acceptance of the revised terms.
        </p>
      </div>
    </>
  );
}
