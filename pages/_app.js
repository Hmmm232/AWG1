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
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
