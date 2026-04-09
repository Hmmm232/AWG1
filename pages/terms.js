import Head from 'next/head';
import Link from 'next/link';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — A Walled Garden</title>
        <meta name="description" content="Terms of service for A Walled Garden — the rules and guidelines for using the site." />
      </Head>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-xl) 0' }}>
        <h1>Terms of Service</h1>
        <p style={{ color: 'var(--color-ink-faint)', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', marginBottom: 'var(--space-xl)' }}>
          Last updated: 13 March 2026
        </p>

        <p style={{ marginBottom: 'var(--space-lg)' }}>
          These terms govern your use of A Walled Garden. By creating an
          account or using the service, you agree to be bound by them. If you
          do not agree, please do not use the service.
        </p>

        <h2>1. What A Walled Garden is</h2>
        <p>A Walled Garden is a platform for curating and sharing cultural
        recommendations — books, essays, poems, quotes, and other works. Users
        create personal pages ("gardens") to organise and display the things
        they value. The service is provided free of charge.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 16 years old to use A Walled Garden. By
        creating an account, you confirm that you meet this requirement. If we
        become aware that a user is under 16, we will delete their account.</p>

        <h2>3. Your account</h2>
        <p>You are responsible for maintaining the security of your account.
        Use a strong, unique password and do not share your login credentials.
        You are responsible for all activity that occurs under your account.
        If you suspect unauthorised access, reset your password immediately
        via the <Link href="/reset-password">password reset</Link> page.</p>

        <p>Each person may hold one account. Creating multiple accounts to
        evade restrictions or manipulate the platform is not permitted.</p>

        <h2>4. Your content</h2>
        <p><strong>Ownership.</strong> You retain full ownership of the
        content you post on A Walled Garden. We do not claim any intellectual
        property rights over your contributions.</p>

        <p><strong>Licence to us.</strong> By posting content, you grant us a
        non-exclusive, worldwide, royalty-free licence to display, reproduce,
        and distribute that content solely for the purpose of operating the
        service — for example, showing your garden to visitors and including
        your works in explore pages. This licence ends when you delete the
        content or your account.</p>

        <p><strong>Your responsibility.</strong> You are responsible for the
        content you post. Do not post content that you do not have the right
        to share. When quoting or recommending the work of others, this is
        generally considered fair use or fair dealing, but you should not
        reproduce substantial portions of copyrighted works without
        permission.</p>

        <h2>5. Acceptable use</h2>
        <p>A Walled Garden is a space for thoughtful cultural curation. You
        agree not to:</p>
        <ul style={{ marginBottom: 'var(--space-lg)', paddingLeft: 'var(--space-lg)' }}>
          <li>Post content that is illegal, threatening, harassing, hateful, or discriminatory</li>
          <li>Post spam, advertising, or promotional material</li>
          <li>Impersonate another person or misrepresent your identity</li>
          <li>Attempt to gain unauthorised access to other accounts or our systems</li>
          <li>Use automated tools to scrape, crawl, or bulk-extract data from the site</li>
          <li>Interfere with the operation of the service or impose unreasonable load on our infrastructure</li>
          <li>Use the platform to distribute malware or phishing links</li>
        </ul>

        <p>We interpret these guidelines with common sense. A negative book
        review is fine. A targeted attack on another user is not.</p>

        <h2>6. Content moderation</h2>
        <p>We reserve the right to review and remove content that violates
        these terms. If you encounter content that you believe violates these
        terms, please use the Report button on that content to flag it for
        review. We aim to review reports promptly, but we are a small team
        and cannot guarantee immediate action.</p>

        <p>When we remove content, we will attempt to notify the user unless
        doing so would be inappropriate (e.g., in cases involving illegal
        content). Repeated violations may result in account suspension or
        termination.</p>

        <h2>7. Intellectual property</h2>
        <p>The A Walled Garden name, logo, design, and underlying code are
        our intellectual property. You may not copy, modify, or distribute
        them without our permission. User-generated content remains the
        property of its respective creators as described in section 4.</p>

        <h2>8. Account deletion</h2>
        <p>You may delete your account at any time from
        your <Link href="/settings">Settings</Link> page. Deletion is
        permanent and removes all your data — your profile, garden content,
        quotes, re-recommendations, follows, likes, and saves. We do not
        retain copies of deleted data and cannot restore deleted accounts.</p>

        <p>We may suspend or terminate accounts that violate these terms.
        Where possible, we will provide notice and an explanation before
        doing so.</p>

        <h2>9. Availability and changes</h2>
        <p>We do our best to keep A Walled Garden available and reliable, but
        we cannot guarantee uninterrupted service. We may need to take the
        site offline for maintenance, and outages may occasionally occur. We
        may also modify, update, or discontinue features of the service over
        time.</p>

        <h2>10. Disclaimer of warranties</h2>
        <p>A Walled Garden is provided <strong>"as is"</strong> and
        <strong> "as available"</strong> without warranties of any kind,
        whether express or implied. We do not warrant that the service will
        be error-free, secure, or available at all times. To the fullest
        extent permitted by law, we disclaim all warranties, including
        implied warranties of merchantability, fitness for a particular
        purpose, and non-infringement.</p>

        <h2>11. Limitation of liability</h2>
        <p>To the fullest extent permitted by law, A Walled Garden and its
        operators shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising from your use of the
        service, including but not limited to loss of data, loss of profits,
        or damage to reputation. Our total liability for any claim arising
        from these terms or the service shall not exceed the amount you have
        paid us (which, as the service is free, is zero).</p>

        <p>Nothing in these terms excludes or limits liability for death or
        personal injury caused by negligence, fraud, or any other liability
        that cannot be excluded by law.</p>

        <h2>12. Privacy</h2>
        <p>Your use of A Walled Garden is also governed by
        our <Link href="/privacy">Privacy Policy</Link>, which explains what
        data we collect and how we use it.</p>

        <h2>13. Changes to these terms</h2>
        <p>We may update these terms from time to time. When we make
        significant changes, we will update the date at the top of this page
        and, where practical, notify users via the site. Continued use of the
        service after changes constitutes acceptance of the revised terms. If
        you disagree with updated terms, you may delete your account.</p>

        <h2>14. Governing law</h2>
        <p>These terms are governed by and construed in accordance with the
        laws of Ireland. Any disputes arising from these terms or your use of
        the service shall be subject to the exclusive jurisdiction of the
        courts of Ireland.</p>

        <h2>15. Contact</h2>
        <p>
          If you have questions about these terms, please reach out via the
          contact information on our <Link href="/about">About</Link> page.
        </p>
      </div>
    </>
  );
}
