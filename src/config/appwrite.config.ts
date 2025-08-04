import { Client, Databases, Account, Storage, Teams, Functions } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Appwrite client
const client = new Client();

// Configure Appwrite (you'll need to set these in .env)
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '996593dff4ade061a5bec251dc3e6d3b7f716d1ea73f48ee29807ecc3b936ffad656cfa93a0a98efb6f0553cd4803cbd8ff02260ae0384349f40d3aef8256aedb0207c5a833f313db6d4130082a7e3f0c8d9db2a716a482d0fab69f4c11106a18e594d210557bbe6b2166b64b13cc741f078b908e270e7cba245e917f41783f3');

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