import '@/styles/globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>A Walled Garden</title>
        <meta name="description" content="Curate your favourite works. Build your garden." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph defaults — individual pages can override */}
        <meta property="og:site_name" content="A Walled Garden" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="A Walled Garden" />
        <meta property="og:description" content="A place to gather the works that have shaped you — books, essays, poems — and share them with others." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="A Walled Garden" />
        <meta name="twitter:description" content="A place to gather the works that have shaped you — books, essays, poems — and share them with others." />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
