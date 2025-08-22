export interface Player {
  $id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  team: string;
  conference: string;
  stats?: {
    passingYards?: number;
    rushingYards?: number;
    receivingYards?: number;
    touchdowns?: number;
    fieldGoals?: number;
    extraPoints?: number;
  };
  eligibility: boolean;
  imageUrl?: string;
}

export interface DraftPick {
  $id: string;
  leagueId: string;
  round: number;
  pickNumber: number;
  userId: string;
  playerId: string;
  playerName: string;
  playerPosition: string;
  playerTeam: string;
  timestamp: string;
  timeRemaining?: number;
}

export interface League {
  $id: string;
  name: string;
  ownerId: string;
  members: string[];
  settings: {
    maxTeams: number;
    draftTimeLimit: number; // in seconds
    scoringType: 'PPR' | 'Standard' | 'HalfPPR';
    rosterSize: number;
  };
  status: 'drafting' | 'active' | 'complete';
  currentRound: number;
  currentPick: number;
  draftOrder: string[]; // array of userIds in draft order
  createdAt: string;
}

export interface DraftState {
  league: League | null;
  picks: DraftPick[];
  availablePlayers: Player[];
  currentUserTurn: boolean;
  timeRemaining: number;
  loading: boolean;
  error: string | null;
}

export interface PickPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickPlayer: (player: Player) => void;
  availablePlayers: Player[];
  loading: boolean;
} 