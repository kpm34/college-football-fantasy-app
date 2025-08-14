import { Models } from 'appwrite';

export interface League extends Models.Document {
  name: string;
  commissioner: string; // Database uses 'commissioner'
  commissionerId?: string; // Legacy field - for backwards compatibility
  season: number;
  maxTeams: number;
  currentTeams: number;
  draftType: 'snake' | 'auction';
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten';
  status: 'open' | 'full' | 'drafting' | 'active' | 'completed';
  isPublic: boolean;
  inviteCode?: string;
  pickTimeSeconds: number;
  scoringRules: Record<string, number>;
  draftDate?: string;
  draftStartedAt?: string;
  settings: {
    allowTrades: boolean;
    tradeDeadline: string | null;
    waiverPeriodDays: number;
    playoffTeams: number;
    regularSeasonWeeks: number;
  };
  createdAt: string;
  updatedAt: string;
}
