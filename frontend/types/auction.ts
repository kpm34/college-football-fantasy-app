export interface AuctionPlayer extends Player {
  startingBid: number;
  currentBid: number;
  currentBidder: string | null;
  auctionStatus: 'pending' | 'active' | 'sold' | 'passed';
  timeRemaining: number;
  minBidIncrement: number;
}

export interface AuctionBid {
  $id: string;
  leagueId: string;
  playerId: string;
  playerName: string;
  playerPosition: string;
  playerTeam: string;
  bidAmount: number;
  bidderId: string;
  bidderName: string;
  timestamp: string;
  auctionId: string;
}

export interface AuctionSession {
  $id: string;
  leagueId: string;
  status: 'pending' | 'active' | 'completed';
  currentPlayerId: string | null;
  currentBidAmount: number;
  currentBidderId: string | null;
  timeRemaining: number;
  minBidIncrement: number;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamBudget {
  userId: string;
  teamName: string;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  playersOwned: number;
  maxPlayers: number;
}

export interface AuctionState {
  session: AuctionSession | null;
  currentPlayer: AuctionPlayer | null;
  availablePlayers: AuctionPlayer[];
  teamBudgets: TeamBudget[];
  bids: AuctionBid[];
  loading: boolean;
  error: string | null;
  currentUserTurn: boolean;
}

export interface AuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBid: (amount: number) => void;
  onPass: () => void;
  currentPlayer: AuctionPlayer | null;
  userBudget: TeamBudget | null;
  minBid: number;
  loading: boolean;
}

export interface BidHistoryProps {
  bids: AuctionBid[];
  currentPlayer: AuctionPlayer | null;
}

export interface TeamBudgetCardProps {
  budget: TeamBudget;
  isCurrentUser: boolean;
  isCurrentBidder: boolean;
} 