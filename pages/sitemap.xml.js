import { supabase } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awalledgarden.org';

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateSitemap(handles, itemPaths) {
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/explore', priority: '0.8', changefreq: 'daily' },
    { path: '/explore/gardens', priority: '0.7', changefreq: 'daily' },
    { path: '/explore/works', priority: '0.7', changefreq: 'daily' },
    { path: '/explore/quotes', priority: '0.7', changefreq: 'daily' },
    { path: '/explore/categories', priority: '0.7', changefreq: 'daily' },
    { path: '/search', priority: '0.6', changefreq: 'weekly' },
    { path: '/about', priority: '0.4', changefreq: 'monthly' },
    { path: '/signup', priority: '0.5', changefreq: 'monthly' },
    { path: '/signin', priority: '0.3', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.2', changefreq: 'monthly' },
    { path: '/terms', priority: '0.2', changefreq: 'monthly' },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(SITE_URL)}${escapeXml(page.path)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
${handles
  .map(
    (handle) => `  <url>
    <loc>${escapeXml(SITE_URL)}/${escapeXml(handle)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join('\n')}
${itemPaths
  .map(
    (path) => `  <url>
    <loc>${escapeXml(SITE_URL)}${escapeXml(path)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

// Encode each path segment so titles with spaces/punctuation become valid URLs
function encodePath(...segments) {
  return '/' + segments.map((s) => encodeURIComponent(s)).join('/');
}

export async function getServerSideProps({ res }) {
  let handles = [];
  let itemPaths = [];

  if (supabase) {
    const [{ data: profiles }, { data: categories }, { data: works }] = await Promise.all([
      supabase.from('profiles').select('handle').order('created_at', { ascending: false }),
      supabase.from('categories').select('slug, profiles!user_id(handle)'),
      supabase.from('works').select('slug, categories!category_id(slug), profiles!user_id(handle)'),
    ]);

    if (profiles) {
      handles = profiles.map((p) => p.handle);
    }

    for (const c of (categories || [])) {
      const handle = c.profiles?.handle;
      if (handle && c.slug) itemPaths.push(encodePath(handle, c.slug));
    }
    for (const w of (works || [])) {
      const handle = w.profiles?.handle;
      const catSlug = w.categories?.slug;
      if (handle && catSlug && w.slug) itemPaths.push(encodePath(handle, catSlug, w.slug));
    }
  }

  const sitemap = generateSitemap(handles, itemPaths);

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
