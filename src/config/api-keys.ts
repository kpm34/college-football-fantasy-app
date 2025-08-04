// API Keys Configuration
export const API_KEYS = {
  // College Football Data API (Working ✅)
  CFBD_API_KEY: process.env.CFBD_API_KEY || 'YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz',
  
  // Odds API (Need to get)
  ODDS_API_KEY: process.env.ODDS_API_KEY || '',
  
  // Rotowire API (Need to get)
  ROTOWIRE_API_KEY: process.env.ROTOWIRE_API_KEY || '',
  
  // ESPN API (Free, no key needed)
  ESPN_API_KEY: process.env.ESPN_API_KEY || '',
  
  // Appwrite Configuration
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: process.env.NEW_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
APPWRITE_API_KEY: process.env.NEW_APPWRITE_API_KEY || '996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3',
};

// API Endpoints
export const API_ENDPOINTS = {
  CFBD: 'https://api.collegefootballdata.com',
  ODDS: 'https://api.the-odds-api.com/v4',
  ROTOWIRE: 'https://api.rotowire.com',
  ESPN: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
  APPWRITE: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
};

// Check if API is available
export async function checkAPIStatus(apiName: string, endpoint: string, headers?: Record<string, string>) {
  try {
    const response = await fetch(endpoint, { headers });
    return {
      name: apiName,
      status: response.ok ? 'working' : 'error',
      statusCode: response.status,
      available: response.ok
    };
  } catch (error) {
    return {
      name: apiName,
      status: 'error',
      statusCode: 0,
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 