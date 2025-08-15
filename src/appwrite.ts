import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Client, Databases } from 'node-appwrite';

// Also load Vercel pulled env if present
try {
  const vercelEnv = path.join(process.cwd(), '.vercel/.env.production.local');
  if (fs.existsSync(vercelEnv)) {
    const dotenv = await import('dotenv');
    dotenv.config({ path: vercelEnv });
  }
} catch {}

export const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

export const databases = new Databases(client);
export const DB_ID = process.env.APPWRITE_DATABASE_ID || process.env.DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

export function assertEnv(): void {
  const required = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
  const missing = required.filter((k) => !process.env[k] && !process.env[`NEXT_PUBLIC_${k}`]);
  if (missing.length > 0) {
    throw new Error(`Missing env: ${missing.join(', ')}`);
  }
}


