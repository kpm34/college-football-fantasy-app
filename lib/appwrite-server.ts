import { Client, Databases, Users, Storage, Functions, Messaging } from 'node-appwrite';

// Server-side Appwrite client configuration (with API key)
// This should only be used in API routes, never exposed to client

if (!process.env.APPWRITE_API_KEY) {
  console.warn('Warning: APPWRITE_API_KEY not found in environment variables');
}

// Initialize server client with API key
const serverClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

// Export server-side services
export const serverDatabases = new Databases(serverClient);
export const serverUsers = new Users(serverClient);
export const serverStorage = new Storage(serverClient);
export const serverFunctions = new Functions(serverClient);
export const serverMessaging = new Messaging(serverClient);

// Re-export common constants
export { DATABASE_ID, COLLECTIONS } from './appwrite';

// Helper to check if server is properly configured
export function isServerConfigured(): boolean {
  return !!(
    process.env.APPWRITE_API_KEY &&
    process.env.APPWRITE_ENDPOINT &&
    process.env.APPWRITE_PROJECT_ID
  );
}

// Helper to get server client (for advanced use cases)
export function getServerClient(): Client {
  if (!isServerConfigured()) {
    throw new Error('Appwrite server not properly configured. Check environment variables.');
  }
  return serverClient;
}