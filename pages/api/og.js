import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'A Walled Garden';
  const subtitle = searchParams.get('subtitle') || '';
  const isDefault = !searchParams.get('title');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#fdfdfb',
          fontFamily: 'Georgia, "Times New Roman", serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background botanical pattern — subtle leaf shapes */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -20,
            display: 'flex',
            opacity: 0.06,
          }}
        >
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            <path d="M200 50c-30 40-80 100-60 180 15 60 55 100 60 120 5-20 45-60 60-120 20-80-30-140-60-180z" fill="#3a9b63"/>
            <path d="M200 100c-50 20-110 60-120 140 40 10 90-10 120-60" fill="#3a9b63"/>
            <path d="M200 100c50 20 110 60 120 140-40 10-90-10-120-60" fill="#3a9b63"/>
            <path d="M200 180c-40 15-90 50-95 110 35 5 75-15 95-50" fill="#3a9b63"/>
            <path d="M200 180c40 15 90 50 95 110-35 5-75-15-95-50" fill="#3a9b63"/>
          </svg>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -30,
            display: 'flex',
            opacity: 0.04,
            transform: 'rotate(180deg)',
          }}
        >
          <svg width="300" height="300" viewBox="0 0 400 400" fill="none">
            <path d="M200 50c-30 40-80 100-60 180 15 60 55 100 60 120 5-20 45-60 60-120 20-80-30-140-60-180z" fill="#3a9b63"/>
            <path d="M200 100c-50 20-110 60-120 140 40 10 90-10 120-60" fill="#3a9b63"/>
            <path d="M200 100c50 20 110 60 120 140-40 10-90-10-120-60" fill="#3a9b63"/>
          </svg>
        </div>

        {/* Green accent strip */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: '#3a9b63',
            display: 'flex',
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            padding: '60px 80px 60px 64px',
          }}
        >
          {/* Top: site name when showing a profile */}
          {!isDefault && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 32,
              }}
            >
              {/* Small leaf icon */}
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M16 4c-1 3-1.5 6.5-1 10.5.5 4 1.8 7.5 3 10.5" stroke="#3a9b63" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M16 8c-3-2-6.5-2.5-9-1.5 1.5 2.5 4.5 4 8 4.5" fill="#3a9b63" opacity="0.85"/>
                <path d="M16 8c3-2 6.5-2.5 9-1.5-1.5 2.5-4.5 4-8 4.5" fill="#3a9b63" opacity="0.65"/>
              </svg>
              <div
                style={{
                  fontSize: 16,
                  color: '#3a9b63',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontFamily: 'sans-serif',
                }}
              >
                A Walled Garden
              </div>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: isDefault ? 64 : 52,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.15,
              maxWidth: 800,
              marginBottom: isDefault ? 0 : 16,
            }}
          >
            {title}
          </div>

          {/* Decorative divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              margin: '24px 0',
            }}
          >
            <div style={{ width: 48, height: 1, background: '#3a9b63', display: 'flex' }} />
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <path d="M16 4c-1 3-1.5 6.5-1 10.5.5 4 1.8 7.5 3 10.5" stroke="#3a9b63" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 10c-3-1.5-6-2-8-1 1.5 2 4 3 7 3.5" fill="#3a9b63" opacity="0.7"/>
              <path d="M16 10c3-1.5 6-2 8-1-1.5 2-4 3-7 3.5" fill="#3a9b63" opacity="0.5"/>
            </svg>
            <div style={{ width: 48, height: 1, background: '#3a9b63', display: 'flex' }} />
          </div>

          {/* Subtitle / tagline */}
          <div
            style={{
              fontSize: isDefault ? 26 : 22,
              color: '#4a4a4a',
              fontStyle: 'italic',
              lineHeight: 1.6,
              maxWidth: 700,
            }}
          >
            {isDefault
              ? 'Curate your favourite books, poems, essays and quotes — and share them with the world.'
              : subtitle || ''}
          </div>

          {/* Bottom: domain */}
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              left: 64,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 15,
                color: '#8a8a8a',
                letterSpacing: 1.5,
                fontFamily: 'sans-serif',
              }}
            >
              awalledgarden.org
            </div>
          </div>

          {/* Bottom right: Candide quote for default image */}
          {isDefault && (
            <div
              style={{
                position: 'absolute',
                bottom: 44,
                right: 80,
                display: 'flex',
                fontSize: 14,
                color: '#aaa',
                fontStyle: 'italic',
              }}
            >
              &ldquo;We must cultivate our garden&rdquo; &mdash; Voltaire
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
