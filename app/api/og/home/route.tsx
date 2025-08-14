import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
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
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%)',
            position: 'relative',
          }}
        >
          {/* Chrome effect overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)',
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
            {/* Chrome Football */}
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #e6e6e6, #c0c0c0)',
                boxShadow: '20px 20px 60px #b3b3b3, -20px -20px 60px #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                position: 'relative',
              }}
            >
              {/* Inner chrome ball */}
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #c0c0c0 0%, #ffffff 50%, #c0c0c0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Football shape */}
                <div
                  style={{
                    width: '140px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                    position: 'relative',
                    transform: 'rotate(-15deg)',
                  }}
                >
                  {/* Football laces */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '2px',
                      height: '60px',
                      background: 'white',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '30%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '20px',
                          height: '2px',
                          background: 'white',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #DC143C, #FF6B6B)',
                backgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                marginBottom: '20px',
                letterSpacing: '-2px',
              }}
            >
              CFB Fantasy
            </h1>
            
            {/* Subtitle */}
            <p
              style={{
                fontSize: '28px',
                color: '#C8C8C8',
                textAlign: 'center',
                marginBottom: '40px',
                fontWeight: '300',
              }}
            >
              Power 4 Conference Fantasy Football
            </p>
            
            {/* Feature cards */}
            <div
              style={{
                display: 'flex',
                gap: '30px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px 30px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  SEC • ACC • Big 12 • Big Ten
                </p>
              </div>
              
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '20px 30px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  Elite Matchups Only
                </p>
              </div>
            </div>
            
            {/* Domain */}
            <p
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.4)',
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
