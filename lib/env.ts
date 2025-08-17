// lib/env.ts
export const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
export const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

// Validate required server-side env vars
if (typeof window === 'undefined') {
  ['APPWRITE_API_KEY'].forEach((k) => {
    if (!process.env[k]) {
      console.error(`[env] Missing required environment variable: ${k}`);
    }
  });
}
