import { Models } from 'appwrite';

export interface RosterPlayer {
  playerId: string;
  position: string;
  acquisitionType: 'draft' | 'waiver' | 'trade';
  acquisitionDate: string;
  addedAt: string;
}

export interface Roster extends Models.Document {
  leagueId: string;
  userId: string;
  teamName: string;
  abbreviation: string;
  logoUrl?: string;
  draftPosition: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  players: RosterPlayer[];
  lineup: Record<string, string>; // position -> playerId
  bench: string[]; // playerIds
  createdAt: string;
  updatedAt: string;
}
