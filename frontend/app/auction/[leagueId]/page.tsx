'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { databases, realtime, DATABASE_ID, COLLECTIONS, REALTIME_CHANNELS } from '@/lib/appwrite';
import { AuctionState, AuctionPlayer, AuctionBid, AuctionSession, TeamBudget } from '@/types/auction';
import AuctionModal from '@/components/auction/AuctionModal';
import AuctionBoard from '@/components/auction/AuctionBoard';
import AuctionTimer from '@/components/auction/AuctionTimer';
import TeamBudgets from '@/components/auction/TeamBudgets';
import BidHistory from '@/components/auction/BidHistory';

interface AuctionPageProps {
  params: { leagueId: string };
  searchParams: { userId?: string };
}

export default function AuctionPage({ params, searchParams }: AuctionPageProps) {
  const { leagueId } = params;
  const userId = searchParams.userId || 'current-user';

  const [auctionState, setAuctionState] = useState<AuctionState>({
    session: null,
    currentPlayer: null,
    availablePlayers: [],
    teamBudgets: [],
    bids: [],
    loading: true,
    error: null,
    currentUserTurn: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial auction data
  useEffect(() => {
    loadAuctionData();
  }, [leagueId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!leagueId) return;

    const unsubscribe = realtime.subscribe(
      REALTIME_CHANNELS.AUCTION_BIDS(leagueId),
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          loadAuctionData();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [leagueId]);

  // Timer effect
  useEffect(() => {
    if (!auctionState.session || auctionState.session.status !== 'active') return;

    const timer = setInterval(() => {
      setAuctionState(prev => ({
        ...prev,
        session: prev.session ? {
          ...prev.session,
          timeRemaining: Math.max(0, prev.session.timeRemaining - 1)
        } : null
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionState.session?.status]);

  const loadAuctionData = useCallback(async () => {
    try {
      setAuctionState(prev => ({ ...prev, loading: true, error: null }));

      // Load auction session
      const sessionResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.AUCTION_SESSIONS,
        leagueId
      );
      const session = sessionResponse as AuctionSession;

      // Load current player
      let currentPlayer = null;
      if (session.currentPlayerId) {
        const playerResponse = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.PLAYERS,
          session.currentPlayerId
        );
        currentPlayer = playerResponse as AuctionPlayer;
      }

      // Load available players
      const playersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        [
          // Query for available players
        ]
      );
      const availablePlayers = playersResponse.documents as AuctionPlayer[];

      // Load team budgets
      const budgetsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAM_BUDGETS,
        [
          // Query by leagueId
        ]
      );
      const teamBudgets = budgetsResponse.documents as TeamBudget[];

      // Load recent bids
      const bidsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AUCTION_BIDS,
        [
          // Query recent bids
        ]
      );
      const bids = bidsResponse.documents as AuctionBid[];

      // Determine if it's current user's turn
      const currentUserTurn = session.currentBidderId === userId;

      setAuctionState({
        session,
        currentPlayer,
        availablePlayers,
        teamBudgets,
        bids,
        currentUserTurn,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading auction data:', error);
      setAuctionState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load auction data'
      }));
    }
  }, [leagueId, userId]);

  const handleBid = async (amount: number) => {
    if (!auctionState.session || !auctionState.currentPlayer) return;

    try {
      const newBid: Omit<AuctionBid, '$id'> = {
        leagueId,
        playerId: auctionState.currentPlayer.$id,
        playerName: auctionState.currentPlayer.name,
        playerPosition: auctionState.currentPlayer.position,
        playerTeam: auctionState.currentPlayer.team,
        bidAmount: amount,
        bidderId: userId,
        bidderName: `Team ${userId}`, // In real app, get from user data
        timestamp: new Date().toISOString(),
        auctionId: auctionState.session.$id
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.AUCTION_BIDS,
        'unique()',
        newBid
      );

      setIsModalOpen(false);
      await loadAuctionData();
    } catch (error) {
      console.error('Error placing bid:', error);
      setAuctionState(prev => ({
        ...prev,
        error: 'Failed to place bid'
      }));
    }
  };

  const handlePass = async () => {
    if (!auctionState.session || !auctionState.currentPlayer) return;

    try {
      // Mark player as passed
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        auctionState.currentPlayer.$id,
        {
          auctionStatus: 'passed'
        }
      );

      setIsModalOpen(false);
      await loadAuctionData();
    } catch (error) {
      console.error('Error passing on player:', error);
      setAuctionState(prev => ({
        ...prev,
        error: 'Failed to pass on player'
      }));
    }
  };

  const getUserBudget = (): TeamBudget | null => {
    return auctionState.teamBudgets.find(budget => budget.userId === userId) || null;
  };

  const getMinBid = (): number => {
    if (!auctionState.session || !auctionState.currentPlayer) return 0;
    return Math.max(
      auctionState.session.currentBidAmount + auctionState.session.minBidIncrement,
      auctionState.currentPlayer.startingBid
    );
  };

  if (auctionState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chrome mx-auto mb-4"></div>
            <p className="text-xl">Loading auction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (auctionState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 text-xl mb-4">{auctionState.error}</p>
            <button 
              onClick={loadAuctionData}
              className="chrome-button px-6 py-3 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionState.session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl">Auction not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold chrome-text">Auction Draft</h1>
              <p className="text-slate-400">
                {auctionState.session.status === 'active' ? 'Auction in Progress' : 'Auction Pending'}
              </p>
            </div>
            
            <AuctionTimer 
              timeRemaining={auctionState.session.timeRemaining}
              currentBid={auctionState.session.currentBidAmount}
              currentBidder={auctionState.session.currentBidderId}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Team Budgets */}
          <div className="lg:col-span-1">
            <TeamBudgets 
              budgets={auctionState.teamBudgets}
              currentUserId={userId}
              currentBidderId={auctionState.session.currentBidderId}
            />
          </div>

          {/* Auction Board */}
          <div className="lg:col-span-2">
            <AuctionBoard 
              currentPlayer={auctionState.currentPlayer}
              session={auctionState.session}
              availablePlayers={auctionState.availablePlayers}
            />
          </div>

          {/* Bid History */}
          <div className="lg:col-span-1">
            <BidHistory 
              bids={auctionState.bids}
              currentPlayer={auctionState.currentPlayer}
            />
          </div>
        </div>

        {/* Bid Button */}
        {auctionState.currentUserTurn && auctionState.session.status === 'active' && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="chrome-button px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:scale-105 transition-transform"
            >
              Place Bid
            </button>
          </div>
        )}
      </div>

      {/* Auction Modal */}
      <AuctionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBid={handleBid}
        onPass={handlePass}
        currentPlayer={auctionState.currentPlayer}
        userBudget={getUserBudget()}
        minBid={getMinBid()}
        loading={false}
      />
    </div>
  );
} 