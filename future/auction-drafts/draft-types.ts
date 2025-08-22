export interface DraftSettings {
  type: 'snake' | 'auction';
  rounds?: number;
  budget?: number;
  timePerPick: number;
  rosterSize: number;
  draftOrder: string[];
}

export interface SnakeDraftSettings extends DraftSettings {
  type: 'snake';
  rounds: number;
  reverseOddRounds: boolean;
}

export interface AuctionDraftSettings extends DraftSettings {
  type: 'auction';
  budget: number;
  minimumBid: number;
  nominationTimeLimit: number;
}

export const DEFAULT_SNAKE_SETTINGS: SnakeDraftSettings = {
  type: 'snake',
  rounds: 20,
  timePerPick: 90, // seconds
  rosterSize: 20,
  reverseOddRounds: true,
  draftOrder: []
};

export const DEFAULT_AUCTION_SETTINGS: AuctionDraftSettings = {
  type: 'auction',
  budget: 200,
  minimumBid: 1,
  timePerPick: 30, // seconds for bidding
  nominationTimeLimit: 30, // seconds to nominate
  rosterSize: 20,
  draftOrder: [] // nomination order
};

export const ROSTER_POSITIONS = {
  QB: { min: 1, max: 4, starters: 1 },
  RB: { min: 2, max: 8, starters: 2 },
  WR: { min: 3, max: 8, starters: 3 },
  TE: { min: 1, max: 3, starters: 1 },
  FLEX: { min: 0, max: 2, starters: 1 }, // RB/WR/TE
  K: { min: 1, max: 2, starters: 1 },
  DST: { min: 1, max: 2, starters: 1 },
  BENCH: { min: 0, max: 7, starters: 0 }
};