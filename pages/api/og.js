import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// Brand palette
const PAPER = '#fdfdfb';
const INK = '#1a1a1a';
const INK_SOFT = '#4a4540';
const INK_FAINT = '#8a837c';
const GREEN = '#3a9b63';
const RULE = 'rgba(26, 23, 20, 0.14)';

// Brand fonts (Playfair Display for display titles, Lora for body/italic).
// We deliberately use *static* single-weight WOFF files: Satori cannot parse
// variable fonts (the [wght] axis files) and chokes with a DataView error.
// Fetched once per edge instance and cached; any problem falls back to the
// default font rather than breaking the image.
const FONT_FILES = {
  playfair: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display@5.0.18/files/playfair-display-latin-700-normal.woff',
  lora: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.18/files/lora-latin-400-normal.woff',
  loraItalic: 'https://cdn.jsdelivr.net/npm/@fontsource/lora@5.0.18/files/lora-latin-400-italic.woff',
};

// Guard against fetches that 200 with the wrong thing (an HTML error page, a
// woff2, etc.) — only accept buffers whose magic bytes are a font Satori can
// read (ttf / otf / woff). woff2 is intentionally rejected.
function isParseableFont(buf) {
  if (!buf || buf.byteLength < 4) return false;
  const b = new Uint8Array(buf.slice(0, 4));
  const tag = String.fromCharCode(b[0], b[1], b[2], b[3]);
  if (tag === 'wOFF' || tag === 'OTTO' || tag === 'true' || tag === 'ttcf') return true;
  if (b[0] === 0x00 && b[1] === 0x01 && b[2] === 0x00 && b[3] === 0x00) return true; // ttf
  return false;
}

let fontCache;
async function loadFonts() {
  if (fontCache !== undefined) return fontCache;
  try {
    const [playfair, lora, loraItalic] = await Promise.all(
      [FONT_FILES.playfair, FONT_FILES.lora, FONT_FILES.loraItalic].map(async (url) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error('font fetch failed');
        const buf = await r.arrayBuffer();
        if (!isParseableFont(buf)) throw new Error('not a parseable font');
        return buf;
      })
    );
    fontCache = [
      { name: 'Playfair Display', data: playfair, weight: 700, style: 'normal' },
      { name: 'Lora', data: lora, weight: 400, style: 'normal' },
      { name: 'Lora', data: loraItalic, weight: 400, style: 'italic' },
    ];
  } catch {
    fontCache = null;
  }
  return fontCache;
}

const SERIF = '"Lora", Georgia, "Times New Roman", serif';
const DISPLAY = '"Playfair Display", "Lora", Georgia, serif';

function truncate(str, max) {
  if (!str) return '';
  const s = str.replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(' ', max) > 0 ? s.lastIndexOf(' ', max) : max).trimEnd() + '…';
}

// Small fern sprig (matches the favicon / site mark)
function FernMark({ size = 22, color = GREEN, opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ opacity }}>
      <path d="M16 4c-1 3-1.5 6.5-1 10.5.5 4 1.8 7.5 3 10.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 8c-3-2-6.5-2.5-9-1.5 1.5 2.5 4.5 4 8 4.5" fill={color} opacity="0.85" />
      <path d="M16 8c3-2 6.5-2.5 9-1.5-1.5 2.5-4.5 4-8 4.5" fill={color} opacity="0.6" />
      <path d="M15.5 14c-3.5-1-7-0.5-9.5 1 2 2 5 3 9 2.5" fill={color} opacity="0.7" />
      <path d="M16.5 14c3.5-1 7-0.5 9.5 1-2 2-5 3-9 2.5" fill={color} opacity="0.5" />
      <path d="M16 20c-2.5 0-5 0.5-7 2 2 1 4.5 1 7-0.5" fill={color} opacity="0.6" />
      <path d="M16 20c2.5 0 5 0.5 7 2-2 1-4.5 1-7-0.5" fill={color} opacity="0.4" />
    </svg>
  );
}

function Eyebrow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
      <FernMark size={22} />
      <div style={{ fontSize: 16, color: GREEN, letterSpacing: 3, fontFamily: SERIF }}>
        A WALLED GARDEN
      </div>
    </div>
  );
}

// A slim ornamental rule: line — diamond — line
function Rule({ width = 320 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '26px 0', width }}>
      <div style={{ flex: 1, height: 1, background: RULE, display: 'flex' }} />
      <div style={{ width: 6, height: 6, background: GREEN, transform: 'rotate(45deg)', display: 'flex' }} />
      <div style={{ flex: 1, height: 1, background: RULE, display: 'flex' }} />
    </div>
  );
}

function Domain() {
  return (
    <div style={{ position: 'absolute', bottom: 48, left: 64, display: 'flex' }}>
      <div style={{ fontSize: 15, color: INK_FAINT, letterSpacing: 1.5, fontFamily: SERIF }}>
        awalledgarden.org
      </div>
    </div>
  );
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || (searchParams.get('title') ? 'profile' : 'default');
  const title = searchParams.get('title') || 'A Walled Garden';
  const subtitle = searchParams.get('subtitle') || '';
  const curator = searchParams.get('curator') || '';
  const meta = searchParams.get('meta') || '';
  const items = (searchParams.get('items') || '').split('|').map((s) => s.trim()).filter(Boolean);

  const fonts = await loadFonts();

  let body;

  if (type === 'default') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: '60px 80px' }}>
        <div style={{ fontSize: 70, fontWeight: 700, color: INK, fontFamily: DISPLAY, lineHeight: 1.1 }}>
          A Walled Garden
        </div>
        <Rule width={420} />
        <div style={{ fontSize: 27, color: INK_SOFT, fontStyle: 'italic', fontFamily: SERIF, lineHeight: 1.5, maxWidth: 760 }}>
          Curate your favourite books, poems, essays and quotes — and share them with the world.
        </div>
        <Domain />
        <div style={{ position: 'absolute', bottom: 46, right: 76, display: 'flex', fontSize: 15, color: INK_FAINT, fontStyle: 'italic', fontFamily: SERIF }}>
          &ldquo;We must cultivate our garden&rdquo; — Voltaire
        </div>
      </div>
    );
  } else if (type === 'quote') {
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: '60px 80px 60px 64px' }}>
        <Eyebrow />
        <div style={{ display: 'flex', fontSize: 120, color: GREEN, opacity: 0.18, fontFamily: DISPLAY, height: 60, marginBottom: 4 }}>
          &ldquo;
        </div>
        <div style={{ fontSize: 42, color: INK, fontStyle: 'italic', fontFamily: SERIF, lineHeight: 1.4, maxWidth: 880 }}>
          {truncate(title, 180)}
        </div>
        {subtitle && (
          <div style={{ display: 'flex', fontSize: 24, color: INK_SOFT, fontFamily: SERIF, marginTop: 28 }}>
            — {truncate(subtitle, 80)}
          </div>
        )}
        {curator && (
          <div style={{ display: 'flex', fontSize: 17, color: INK_FAINT, fontFamily: SERIF, marginTop: 10 }}>
            kept by {truncate(curator, 60)}
          </div>
        )}
        <Domain />
      </div>
    );
  } else {
    // category, work, or profile — shared editorial layout
    const metaLine =
      type === 'category'
        ? [meta, curator && `kept by ${curator}`].filter(Boolean).join('  ·  ')
        : type === 'work'
        ? [curator && `kept by ${curator}`, meta].filter(Boolean).join('  ·  ')
        : '';

    body = (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', padding: '60px 80px 60px 64px' }}>
        <Eyebrow />
        <div style={{ fontSize: 56, fontWeight: 700, color: INK, fontFamily: DISPLAY, lineHeight: 1.15, maxWidth: 820 }}>
          {truncate(title, 90)}
        </div>
        {metaLine && (
          <div style={{ display: 'flex', fontSize: 20, color: INK_FAINT, fontFamily: SERIF, marginTop: 16 }}>
            {truncate(metaLine, 90)}
          </div>
        )}
        <Rule width={360} />
        {/* Category: a peek at the contents */}
        {type === 'category' && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 820 }}>
            {items.slice(0, 4).map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', fontSize: 15, color: GREEN, fontFamily: SERIF, width: 24 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ display: 'flex', fontSize: 23, color: INK_SOFT, fontFamily: SERIF }}>
                  {truncate(it, 52)}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Work / profile: a body line */}
        {type !== 'category' && (subtitle || type === 'profile') && (
          <div style={{ display: 'flex', fontSize: 24, color: INK_SOFT, fontStyle: 'italic', fontFamily: SERIF, lineHeight: 1.55, maxWidth: 760 }}>
            {truncate(subtitle, 150)}
          </div>
        )}
        <Domain />
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: PAPER,
          fontFamily: SERIF,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Botanical corner mark */}
        <div style={{ position: 'absolute', top: 24, right: 36, display: 'flex' }}>
          <FernMark size={300} color={GREEN} opacity={0.06} />
        </div>
        {/* Green accent strip */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: GREEN, display: 'flex' }} />
        {body}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fonts ? { fonts } : {}),
    }
  );
}
