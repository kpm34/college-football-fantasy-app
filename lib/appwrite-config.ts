/**
 * Centralized Appwrite Configuration
 * All Appwrite clients should use this configuration
 */

export const APPWRITE_CONFIG = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
  apiKey: process.env.APPWRITE_API_KEY || 'standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b',
  databaseId: process.env.DATABASE_ID || 'college-football-fantasy',
};

// For client-side usage
export const APPWRITE_PUBLIC_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
} as { endpoint: string; projectId: string; databaseId: string };

// Runtime override for production domains to avoid misconfigured envs
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  const isProdDomain = host === 'cfbfantasy.app' || host === 'www.cfbfantasy.app' || host === 'collegefootballfantasy.app' || host === 'www.collegefootballfantasy.app';
  const isVercelPreview = host.endsWith('.vercel.app');
  
  if (isProdDomain || isVercelPreview) {
    APPWRITE_PUBLIC_CONFIG.endpoint = 'https://nyc.cloud.appwrite.io/v1';
    APPWRITE_PUBLIC_CONFIG.projectId = 'college-football-fantasy-app';
    APPWRITE_PUBLIC_CONFIG.databaseId = 'college-football-fantasy';
  }
}