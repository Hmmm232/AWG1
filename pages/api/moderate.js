import { rateLimit, getClientIp } from '@/lib/rateLimit';

export const config = {
  api: { bodyParser: { sizeLimit: '16kb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 20 moderation requests per minute per IP
  const ip = getClientIp(req);
  const { allowed: withinLimit } = rateLimit(`moderate:${ip}`, 20, 60_000);
  if (!withinLimit) {
    return res.status(429).json({ error: 'Too many requests', allowed: true });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // If no key configured, allow content through (fail open)
    return res.status(200).json({ allowed: true });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text field' });
  }

  // Skip very short content — not worth moderating
  if (text.trim().length < 5) {
    return res.status(200).json({ allowed: true });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 20,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a lenient content moderator for "A Walled Garden", a cultural curation website where users collect and share their favourite books, poems, essays, and literary quotes.

Your default answer is ALLOW. Almost everything belongs here.

ALLOW (this is the vast majority of content):
- Book titles, author names, poem excerpts, essay quotes — even with mature, dark, or controversial themes
- Personal commentary and opinions about art, literature, music, film, philosophy
- Category names like "Favourite Novels", "Poetry", "Essays I Love", etc.
- Strong opinions, criticism, profanity in literary context
- Short entries, single words, titles, names
- Anything that a thoughtful reader might plausibly add to a literary collection

REJECT only content that is clearly and obviously:
- Spam or advertising (SEO spam, promotional links, commercial marketing)
- Direct threats of violence against specific real people
- Doxxing (sharing private addresses, phone numbers, etc.)

When in doubt, ALLOW. Err heavily on the side of allowing content.

Respond with exactly one word: ALLOW or REJECT`,
          },
          {
            role: 'user',
            content: text.slice(0, 8000),
          },
        ],
      }),
    });

    if (!response.ok) {
      // If OpenAI is down or rate-limited, fail open
      console.error('Moderation API error:', response.status);
      return res.status(200).json({ allowed: true });
    }

    const data = await response.json();
    const verdict = (data.choices?.[0]?.message?.content || '').trim().toUpperCase();

    return res.status(200).json({
      allowed: verdict !== 'REJECT',
      ...(verdict === 'REJECT' && {
        reason: 'This content was flagged by our moderation system. If you believe this is an error, please try rephrasing.',
      }),
    });
  } catch (err) {
    // Network error — fail open
    console.error('Moderation check failed:', err);
    return res.status(200).json({ allowed: true });
  }
}
