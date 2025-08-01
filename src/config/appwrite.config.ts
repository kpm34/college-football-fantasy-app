import { Client, Databases, Account, Storage, Teams, Functions } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Appwrite client
const client = new Client();

// Configure Appwrite (you'll need to set these in .env)
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

// Export Appwrite services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const teams = new Teams(client);
export const functions = new Functions(client);

// Database IDs (we'll create these in Appwrite console)
export const DATABASE_ID = 'college-football-fantasy';

// Collection IDs
export const COLLECTIONS = {
  USERS: 'users',
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  GAMES: 'games',
  RANKINGS: 'rankings',
  ROSTERS: 'rosters',
  LINEUPS: 'lineups',
  SCORES: 'scores',
  DRAFTS: 'drafts'
};

// Storage bucket IDs
export const BUCKETS = {
  TEAM_LOGOS: 'team-logos',
  USER_AVATARS: 'user-avatars'
};