import '@/styles/globals.css';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Head from 'next/head';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const canonicalPath = router.asPath.split('?')[0].split('#')[0];
  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;

  return (
    <AuthProvider>
      <Head>
        <title>A Walled Garden | Books, Poems, Essays &amp; Quotes</title>
        <meta name="description" content="Curate your favourite works. Build your garden." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph defaults — individual pages can override */}
        <meta property="og:site_name" content="A Walled Garden" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="A Walled Garden | Books, Poems, Essays &amp; Quotes" />
        <meta property="og:description" content="A place to gather the works that have shaped you — books, essays, poems — and share them with others." />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}/api/og`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="A Walled Garden | Books, Poems, Essays &amp; Quotes" />
        <meta name="twitter:description" content="A place to gather the works that have shaped you — books, essays, poems — and share them with others." />
        <meta name="twitter:image" content={`${SITE_URL}/api/og`} />
      </Head>
      <Layout>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
      <Analytics />
    </AuthProvider>
  );
}
