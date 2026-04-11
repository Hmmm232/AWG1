import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const config = {
  api: { bodyParser: { sizeLimit: '4kb' } },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 60 log requests per minute per IP
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`log:${ip}`, 60, 60_000);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
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
