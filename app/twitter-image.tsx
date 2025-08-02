import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Degentalk - The future of Crypto Forums';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 20% 80%, #10b981 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #34d399 0%, transparent 50%),
                              radial-gradient(circle at 40% 40%, #064e3b 0%, transparent 50%)`,
            opacity: 0.1,
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '60px',
            zIndex: 10,
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            Degentalk™
          </div>
          
          {/* Tagline */}
          <div
            style={{
              fontSize: 40,
              color: 'white',
              fontWeight: 700,
              marginBottom: 20,
              maxWidth: 900,
              lineHeight: 1.2,
            }}
          >
            The future of Crypto Forums
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: '#d4d4d8',
              fontWeight: 400,
              marginBottom: 40,
              maxWidth: 800,
            }}
          >
            Satirical Trading Community
          </div>
          
          {/* Stats/Highlights */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              fontSize: 24,
              color: '#a1a1aa',
              marginTop: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>150K+</span> Degens
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>$DGT</span> Economy
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10b981' }}>24/7</span> Trading
            </div>
          </div>
        </div>
        
        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}