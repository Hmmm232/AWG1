import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — A Walled Garden</title>
        <meta name="description" content="Privacy policy for A Walled Garden — how we handle your data, what we collect, and your rights." />
      </Head>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-xl) 0' }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
          Last updated: 13 March 2026
        </p>

        <p style={{ marginBottom: 'var(--space-lg)' }}>
          A Walled Garden is a platform for curating and sharing cultural
          recommendations. This policy explains what data we collect, why, and
          what control you have over it. We have tried to keep it readable and
          honest.
        </p>

        <h2>1. What we collect</h2>
        <p><strong>Account information.</strong> When you create an account we
        collect your email address, a chosen handle, and an optional display
        name. Your email is used solely for authentication and account
        recovery — it is never displayed publicly.</p>

        <p><strong>Profile information.</strong> You may optionally provide a
        bio. Your handle, display name, and bio are publicly visible on your
        garden page.</p>

        <p><strong>Content you create.</strong> Everything you add to your
        garden — categories, works, commentary, quotes, re-recommendations —
        is stored in our database and displayed publicly on your profile. You
        control what you post and can edit or delete it at any time.</p>

        <p><strong>Social data.</strong> We store which users you follow, which
        gardens you save, and which works you like, in order to provide those
        features. Your follow list is visible on your profile. Saves and likes
        are private to you.</p>

        <p><strong>Reports.</strong> If you report content, we store the report
        reason and your user ID so we can review it. Reports are not publicly
        visible.</p>

        <p><strong>Technical data.</strong> We do not use analytics or tracking
        services. We do not collect IP addresses, device fingerprints, or
        browsing behaviour beyond what is necessary for standard web hosting
        (server logs retained by our hosting provider, Vercel).</p>

        <h2>2. What we do not collect</h2>
        <ul style={{ marginBottom: 'var(--space-lg)', paddingLeft: 'var(--space-lg)' }}>
          <li>We do not track your browsing activity across the site</li>
          <li>We do not collect payment information (the service is free)</li>
          <li>We do not use advertising or marketing trackers</li>
          <li>We do not collect data from third-party sources</li>
          <li>We do not build profiles for advertising purposes</li>
        </ul>

        <h2>3. How we use your data</h2>
        <p>Your data is used to provide A Walled Garden and nothing else.
        Specifically:</p>
        <ul style={{ marginBottom: 'var(--space-lg)', paddingLeft: 'var(--space-lg)' }}>
          <li>To display your garden, quotes, re-recs, and profile to visitors</li>
          <li>To let you follow other users and save gardens</li>
          <li>To authenticate you and enable password recovery</li>
          <li>To allow content moderation and respond to reports</li>
          <li>To surface content in our explore pages</li>
        </ul>

        <p>We do not sell, rent, or share your personal data with third
        parties. We do not use your data for advertising. We do not use your
        content to train machine learning models.</p>

        <h2>4. Cookies and local storage</h2>
        <p>We use essential cookies only — specifically, authentication tokens
        that keep you signed in. We also use browser local storage for minor
        preferences (such as whether you have dismissed the onboarding guide).
        We do not use tracking cookies, advertising cookies, or any
        third-party cookie services.</p>

        <h2>5. Data storage and security</h2>
        <p>Your data is stored via <strong>Supabase</strong>, which runs on
        AWS infrastructure. Passwords are hashed using bcrypt and are never
        stored or transmitted in plain text. All connections to the site and
        database use HTTPS/TLS encryption. We apply row-level security
        policies in our database to ensure users can only modify their own
        data.</p>

        <p>While we take reasonable precautions to protect your data, no
        system is perfectly secure. We cannot guarantee absolute security, but
        we commit to prompt disclosure if a breach occurs.</p>

        <h2>6. Data retention</h2>
        <p>We retain your data for as long as your account exists. If you
        delete your account, all associated data — your profile, garden
        content, quotes, re-recommendations, follows, saves, and likes — is
        permanently deleted. We do not retain copies of deleted data.</p>

        <h2>7. Your rights</h2>
        <p>You have the right to:</p>
        <ul style={{ marginBottom: 'var(--space-lg)', paddingLeft: 'var(--space-lg)' }}>
          <li><strong>Access</strong> your data — your garden is publicly visible, and your account data is viewable in <Link href="/settings">Settings</Link></li>
          <li><strong>Edit</strong> your data at any time through your garden or settings</li>
          <li><strong>Delete</strong> your account and all associated data from your <Link href="/settings">Settings</Link> page</li>
          <li><strong>Request</strong> a copy of your data by contacting us</li>
        </ul>

        <p>If you are in the EU/EEA, you also have rights under the GDPR
        including the right to data portability, the right to restrict
        processing, and the right to lodge a complaint with a supervisory
        authority. To exercise any of these rights, please contact us.</p>

        <h2>8. Children</h2>
        <p>A Walled Garden is not directed at children under 16. We do not
        knowingly collect data from anyone under 16. If you believe a child
        has created an account, please contact us and we will delete it.</p>

        <h2>9. Third-party services</h2>
        <p>We rely on the following third-party services to operate:</p>
        <ul style={{ marginBottom: 'var(--space-lg)', paddingLeft: 'var(--space-lg)' }}>
          <li><strong>Supabase</strong> — database, authentication, and file storage</li>
          <li><strong>Vercel</strong> — web hosting and deployment</li>
        </ul>
        <p>These providers have their own privacy policies. We do not share
        data with any services beyond what is necessary for hosting and
        operating the platform.</p>

        <h2>10. Changes to this policy</h2>
        <p>We may update this policy from time to time. If we make significant
        changes, we will update the date at the top of this page and, where
        practical, notify users via the site. Continued use of the service
        after changes constitutes acceptance of the updated policy.</p>

        <h2>11. Contact</h2>
        <p>
          If you have questions about this policy, wish to exercise your data
          rights, or need to report a privacy concern, please reach out via
          the contact information on our <Link href="/about">About</Link> page.
        </p>
      </div>
    </>
  );
}
