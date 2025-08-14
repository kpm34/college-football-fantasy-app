import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueName = searchParams.get('name') || 'College Football Fantasy League';
    const spots = searchParams.get('spots') || '8/12';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #6B3AA0 0%, #A374B5 50%, #E73C7E 100%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              zIndex: 10,
            }}
          >
            {/* Football Icon */}
            <div
              style={{
                fontSize: '120px',
                marginBottom: '20px',
              }}
            >
              🏈
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginBottom: '10px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              You're Invited!
            </h1>
            
            {/* League Name */}
            <h2
              style={{
                fontSize: '36px',
                fontWeight: '600',
                color: '#F7EAE1',
                textAlign: 'center',
                marginBottom: '30px',
                maxWidth: '800px',
              }}
            >
              {leagueName}
            </h2>
            
            {/* Info Cards */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '20px 40px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <p
                  style={{
                    fontSize: '18px',
                    color: 'rgba(247,234,225,0.8)',
                    marginBottom: '5px',
                  }}
                >
                  Power 4 Conferences
                </p>
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  SEC • ACC • Big 12 • Big Ten
                </p>
              </div>
              
              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: '20px 40px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <p
                  style={{
                    fontSize: '18px',
                    color: 'rgba(247,234,225,0.8)',
                    marginBottom: '5px',
                  }}
                >
                  Spots Available
                </p>
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {spots} Teams
                </p>
              </div>
            </div>
            
            {/* CTA */}
            <div
              style={{
                background: 'white',
                color: '#6B3AA0',
                padding: '16px 48px',
                borderRadius: '100px',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              Join League
              <span style={{ fontSize: '24px' }}>→</span>
            </div>
            
            {/* Domain */}
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.6)',
                marginTop: '20px',
              }}
            >
              cfbfantasy.app
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('OG Image generation failed:', e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
