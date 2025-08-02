'use client';

import { useState } from 'react';
import PickPlayerModal from '@/components/draft/PickPlayerModal';
import DraftBoard from '@/components/draft/DraftBoard';
import DraftTimer from '@/components/draft/DraftTimer';
import DraftOrder from '@/components/draft/DraftOrder';
import { Player, DraftPick, League } from '@/types/draft';

// Mock data for testing
const mockPlayers: Player[] = [
  {
    $id: '1',
    name: 'Caleb Williams',
    position: 'QB',
    team: 'USC',
    conference: 'Pac-12',
    eligibility: true,
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
    stats: {
      receivingYards: 1263,
      touchdowns: 14
    }
  },
  {
    $id: '4',
    name: 'Brock Bowers',
    position: 'TE',
    team: 'Georgia',
    conference: 'SEC',
    eligibility: true,
    stats: {
      receivingYards: 942,
      touchdowns: 7
    }
  }
];

const mockLeague: League = {
  $id: 'test-league',
  name: 'Test League',
  ownerId: 'user1',
  members: ['user1', 'user2', 'user3', 'user4'],
  settings: {
    maxTeams: 4,
    draftTimeLimit: 120, // 2 minutes
    scoringType: 'PPR',
    rosterSize: 15
  },
  status: 'drafting',
  currentRound: 1,
  currentPick: 1,
  draftOrder: ['user1', 'user2', 'user3', 'user4'],
  createdAt: new Date().toISOString()
};

const mockPicks: DraftPick[] = [
  {
    $id: 'pick1',
    leagueId: 'test-league',
    round: 1,
    pickNumber: 1,
    userId: 'user1',
    playerId: '1',
    playerName: 'Caleb Williams',
    playerPosition: 'QB',
    playerTeam: 'USC',
    timestamp: new Date(Date.now() - 30000).toISOString()
  }
];

export default function DraftTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [isUserTurn, setIsUserTurn] = useState(true);

  const handlePickPlayer = (player: Player) => {
    console.log('Picked player:', player);
    setIsModalOpen(false);
  };

  const handleAutoPick = () => {
    console.log('Auto pick triggered');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold chrome-text mb-8">Draft Components Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Draft Order */}
          <div>
            <DraftOrder 
              league={mockLeague}
              picks={mockPicks}
              currentUserId="user1"
            />
          </div>

          {/* Draft Board */}
          <div className="lg:col-span-2">
            <DraftBoard 
              picks={mockPicks}
              league={mockLeague}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="mb-8">
          <DraftTimer 
            timeRemaining={timeRemaining}
            isUserTurn={isUserTurn}
            onAutoPick={handleAutoPick}
          />
        </div>

        {/* Test Controls */}
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-xl font-bold chrome-text mb-4">Test Controls</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="chrome-button px-6 py-3 rounded-lg"
            >
              Open Pick Modal
            </button>
            <button
              onClick={() => setTimeRemaining(prev => Math.max(0, prev - 10))}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              -10s Timer
            </button>
            <button
              onClick={() => setIsUserTurn(!isUserTurn)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Toggle Turn
            </button>
            <button
              onClick={() => setTimeRemaining(120)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Reset Timer
            </button>
          </div>
        </div>
      </div>

      {/* Pick Player Modal */}
      <PickPlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPickPlayer={handlePickPlayer}
        availablePlayers={mockPlayers}
        loading={false}
      />
    </div>
  );
} 