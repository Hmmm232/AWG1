import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'A Walled Garden';
  const subtitle = searchParams.get('subtitle') || 'a new home for culture on the internet';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fdfdfb',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Accent bar on the left */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: '#3a9b63',
          }}
        />

        {/* Subtle border frame */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            bottom: 32,
            left: 40,
            border: '1px solid #eae9e6',
            borderRadius: 16,
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            padding: '0 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#8a8a8a',
              fontStyle: 'italic',
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Small leaf/accent dot */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            display: 'flex',
            gap: 12,
            fontSize: 14,
            color: '#8a8a8a',
            letterSpacing: 4,
          }}
        >
          · &nbsp; · &nbsp; ·
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
