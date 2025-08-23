/**
 * Mock Draft Types
 */

export type UserType = 'bot' | 'human';

export interface DraftConfig {
  rounds: number;
  snake: boolean;
  timerPerPickSec: number;
  positionLimits?: Record<string, number>; // e.g., { QB: 2, RB: 4, WR: 6, TE: 2, K: 1 }
  rosterLimits?: Record<string, number>; // Overall roster limits
  seed?: string;
}

export interface TurnState {
  draftId: string;
  overall: number;
  round: number;
  slot: number;
  participantId: string;
  deadlineAt: string; // ISO
}

export interface BotStrategyConfig {
  wRank: number; // Weight for base ranking
  wScarcity: number; // Weight for position scarcity
  wAdp: number; // Weight for ADP adjustment
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  baseRank?: number;
  adp?: number;
  fantasyPoints?: number;
}

export interface TeamNeeds {
  slot: number;
  positionCounts: Record<string, number>;
  totalPicks: number;
  remainingRounds: number;
}

export interface DraftPick {
  id?: string;
  draftId: string;
  round: number;
  overall: number;
  slot: number;
  participantId: string;
  playerId: string;
  pickedAt: Date | string;
  autopick: boolean;
}

export interface DraftParticipant {
  id: string;
  draftId: string;
  userType: UserType;
  displayName: string;
  slot: number;
  client_id?: string; // For human users
}

export interface MockDraft {
  id: string;
  leagueId?: string;
  draftName: string;
  numTeams: number;
  rounds: number;
  snake: boolean;
  status: 'pending' | 'active' | 'complete' | 'failed';
  startedAt?: string;
  completedAt?: string;
  config?: {
    seed?: string;
    timerPerPickSec?: number;
    positionLimits?: Record<string, number>;
    rosterLimits?: Record<string, number>;
    artifacts?: {
      jsonPath?: string;
      csvDir?: string;
      seed?: string;
    };
    metrics?: {
      durationSec?: number;
      totalPicks?: number;
      autopicksCount?: number;
    };
    lastError?: string;
  };
}

export interface DraftResults {
  draft: MockDraft;
  participants: DraftParticipant[];
  picks: DraftPick[];
  summaryByTeam: Array<{
    slot: number;
    displayName: string;
    players: Array<{
      name: string;
      position: string;
      team: string;
      overall: number;
      round: number;
    }>;
    positionCounts: Record<string, number>;
    totalPlayers: number;
  }>;
}

export const DEFAULT_POSITION_LIMITS: Record<string, number> = {
  QB: 2,
  RB: 4,
  WR: 6,
  TE: 2,
  K: 1
};

export const DEFAULT_BOT_STRATEGY: BotStrategyConfig = {
  wRank: 0.6,
  wScarcity: 0.3,
  wAdp: 0.1
};