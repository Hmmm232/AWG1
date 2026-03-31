export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, error, context, url, timestamp, userAgent } = req.body || {};

  // Log to Vercel's runtime logs (visible in dashboard → Logs)
  console.error('[WRITE_FAILURE]', JSON.stringify({
    action,
    error,
    context,
    url,
    timestamp,
    userAgent,
    serverTime: new Date().toISOString(),
  }));

  return res.status(200).json({ ok: true });
}
