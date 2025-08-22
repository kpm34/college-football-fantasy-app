import { Models } from 'appwrite';

export interface Player extends Models.Document {
  name: string;
  position: string;
  team: string;
  conference: string;
  jerseyNumber?: string;
  height?: string;
  weight?: string;
  year?: string; // Freshman, Sophomore, etc.
  eligible: boolean; // Eligible vs Top 25
  projectedPoints: number;
  seasonFantasyPoints: number;
  lastProjectionUpdate?: string;
  externalId?: string; // CFBD ID
  imageUrl?: string;
  stats?: {
    passingYards?: number;
    passingTouchdowns?: number;
    rushingYards?: number;
    rushingTouchdowns?: number;
    receivingYards?: number;
    receivingTouchdowns?: number;
    receptions?: number;
    interceptions?: number;
    sacks?: number;
  };
  weeklyStats?: Record<number, {
    opponent: string;
    fantasyPoints: number;
    stats: Record<string, number>;
  }>;
  createdAt: string;
  updatedAt: string;
}
