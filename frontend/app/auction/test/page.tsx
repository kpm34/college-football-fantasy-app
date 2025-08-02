'use client';

import { useState } from 'react';
import AuctionModal from '@/components/auction/AuctionModal';
import AuctionBoard from '@/components/auction/AuctionBoard';
import AuctionTimer from '@/components/auction/AuctionTimer';
import TeamBudgets from '@/components/auction/TeamBudgets';
import BidHistory from '@/components/auction/BidHistory';
import { AuctionPlayer, AuctionBid, AuctionSession, TeamBudget } from '@/types/auction';

// Mock data for testing
const mockAuctionPlayers: AuctionPlayer[] = [
  {
    $id: '1',
    name: 'Caleb Williams',
    position: 'QB',
    team: 'USC',
    conference: 'Pac-12',
    eligibility: true,
    startingBid: 50,
    currentBid: 75,
    currentBidder: 'user2',
    auctionStatus: 'active',
    timeRemaining: 45,
    minBidIncrement: 5,
    stats: {
      passingYards: 4537,
      touchdowns: 42
    }
  },
  {
    $id: '2',
    name: 'Bijan Robinson',
    position: 'RB',
    team: 'Texas',
    conference: 'Big 12',
    eligibility: true,
    startingBid: 40,
    currentBid: 40,
    currentBidder: null,
    auctionStatus: 'pending',
    timeRemaining: 0,
    minBidIncrement: 5,
    stats: {
      rushingYards: 1580,
      touchdowns: 18
    }
  },
  {
    $id: '3',
    name: 'Marvin Harrison Jr.',
    position: 'WR',
    team: 'Ohio State',
    conference: 'Big Ten',
    eligibility: true,
    startingBid: 35,
    currentBid: 35,
    currentBidder: null,
    auctionStatus: 'pending',
    timeRemaining: 0,
    minBidIncrement: 5,
    stats: {
      receivingYards: 1263,
      touchdowns: 14
    }
  }
];

const mockAuctionSession: AuctionSession = {
  $id: 'test-auction',
  leagueId: 'test-league',
  status: 'active',
  currentPlayerId: '1',
  currentBidAmount: 75,
  currentBidderId: 'user2',
  timeRemaining: 45,
  minBidIncrement: 5,
  totalBudget: 200,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockTeamBudgets: TeamBudget[] = [
  {
    userId: 'user1',
    teamName: 'Team Alpha',
    totalBudget: 200,
    spentBudget: 45,
    remainingBudget: 155,
    playersOwned: 3,
    maxPlayers: 15
  },
  {
    userId: 'user2',
    teamName: 'Team Beta',
    totalBudget: 200,
    spentBudget: 80,
    remainingBudget: 120,
    playersOwned: 5,
    maxPlayers: 15
  },
  {
    userId: 'user3',
    teamName: 'Team Gamma',
    totalBudget: 200,
    spentBudget: 25,
    remainingBudget: 175,
    playersOwned: 2,
    maxPlayers: 15
  },
  {
    userId: 'user4',
    teamName: 'Team Delta',
    totalBudget: 200,
    spentBudget: 60,
    remainingBudget: 140,
    playersOwned: 4,
    maxPlayers: 15
  }
];

const mockBids: AuctionBid[] = [
  {
    $id: 'bid1',
    leagueId: 'test-league',
    playerId: '1',
    playerName: 'Caleb Williams',
    playerPosition: 'QB',
    playerTeam: 'USC',
    bidAmount: 75,
    bidderId: 'user2',
    bidderName: 'Team Beta',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    auctionId: 'test-auction'
  },
  {
    $id: 'bid2',
    leagueId: 'test-league',
    playerId: '1',
    playerName: 'Caleb Williams',
    playerPosition: 'QB',
    playerTeam: 'USC',
    bidAmount: 70,
    bidderId: 'user1',
    bidderName: 'Team Alpha',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    auctionId: 'test-auction'
  },
  {
    $id: 'bid3',
    leagueId: 'test-league',
    playerId: '1',
    playerName: 'Caleb Williams',
    playerPosition: 'QB',
    playerTeam: 'USC',
    bidAmount: 65,
    bidderId: 'user3',
    bidderName: 'Team Gamma',
    timestamp: new Date(Date.now() - 90000).toISOString(),
    auctionId: 'test-auction'
  }
];

export default function AuctionTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [currentBid, setCurrentBid] = useState(75);
  const [currentBidder, setCurrentBidder] = useState('user2');

  const handleBid = (amount: number) => {
    console.log('Bid placed:', amount);
    setCurrentBid(amount);
    setCurrentBidder('user1');
    setIsModalOpen(false);
  };

  const handlePass = () => {
    console.log('Passed on player');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold chrome-text mb-8">Auction System Test</h1>
        
        {/* Timer */}
        <div className="mb-8">
          <AuctionTimer 
            timeRemaining={timeRemaining}
            currentBid={currentBid}
            currentBidder={currentBidder}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Team Budgets */}
          <div className="lg:col-span-1">
            <TeamBudgets 
              budgets={mockTeamBudgets}
              currentUserId="user1"
              currentBidderId={currentBidder}
            />
          </div>

          {/* Auction Board */}
          <div className="lg:col-span-2">
            <AuctionBoard 
              currentPlayer={mockAuctionPlayers[0]}
              session={mockAuctionSession}
              availablePlayers={mockAuctionPlayers}
            />
          </div>

          {/* Bid History */}
          <div className="lg:col-span-1">
            <BidHistory 
              bids={mockBids}
              currentPlayer={mockAuctionPlayers[0]}
            />
          </div>
        </div>

        {/* Test Controls */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold chrome-text mb-4">Test Controls</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="chrome-button px-6 py-3 rounded-lg"
            >
              Open Auction Modal
            </button>
            <button
              onClick={() => setTimeRemaining(prev => Math.max(0, prev - 10))}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              -10s Timer
            </button>
            <button
              onClick={() => setTimeRemaining(45)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Reset Timer
            </button>
            <button
              onClick={() => setCurrentBid(prev => prev + 5)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              +$5 Bid
            </button>
            <button
              onClick={() => setCurrentBidder(currentBidder === 'user1' ? 'user2' : 'user1')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Toggle Bidder
            </button>
          </div>
        </div>
      </div>

      {/* Auction Modal */}
      <AuctionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBid={handleBid}
        onPass={handlePass}
        currentPlayer={mockAuctionPlayers[0]}
        userBudget={mockTeamBudgets[0]}
        minBid={currentBid + 5}
        loading={false}
      />
    </div>
  );
} 