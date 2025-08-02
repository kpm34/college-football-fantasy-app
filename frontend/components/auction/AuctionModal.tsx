'use client';

import { useState, useEffect } from 'react';
import { AuctionModalProps, AuctionPlayer } from '@/types/auction';

const POSITION_COLORS = {
  QB: 'bg-blue-500',
  RB: 'bg-green-500',
  WR: 'bg-purple-500',
  TE: 'bg-orange-500',
  K: 'bg-yellow-500',
  DEF: 'bg-red-500'
};

export default function AuctionModal({ 
  isOpen, 
  onClose, 
  onBid, 
  onPass, 
  currentPlayer, 
  userBudget, 
  minBid, 
  loading 
}: AuctionModalProps) {
  const [bidAmount, setBidAmount] = useState(minBid);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    setBidAmount(minBid);
    setCustomAmount('');
  }, [minBid, currentPlayer]);

  const handleBid = () => {
    if (bidAmount > 0 && userBudget && bidAmount <= userBudget.remainingBudget) {
      onBid(bidAmount);
    }
  };

  const handleCustomBid = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && userBudget && amount <= userBudget.remainingBudget) {
      onBid(amount);
    }
  };

  const quickBidAmounts = [
    minBid,
    minBid + 1,
    minBid + 5,
    minBid + 10,
    minBid + 25
  ].filter(amount => userBudget && amount <= userBudget.remainingBudget);

  if (!isOpen || !currentPlayer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold chrome-text">Auction Player</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Player Info */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-white">{currentPlayer.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${POSITION_COLORS[currentPlayer.position as keyof typeof POSITION_COLORS]}`}>
                  {currentPlayer.position}
                </span>
              </div>
              <p className="text-slate-400">{currentPlayer.team} • {currentPlayer.conference}</p>
              
              {currentPlayer.stats && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {currentPlayer.stats.passingYards && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pass Yds:</span>
                      <span className="text-white">{currentPlayer.stats.passingYards.toLocaleString()}</span>
                    </div>
                  )}
                  {currentPlayer.stats.rushingYards && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rush Yds:</span>
                      <span className="text-white">{currentPlayer.stats.rushingYards.toLocaleString()}</span>
                    </div>
                  )}
                  {currentPlayer.stats.receivingYards && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rec Yds:</span>
                      <span className="text-white">{currentPlayer.stats.receivingYards.toLocaleString()}</span>
                    </div>
                  )}
                  {currentPlayer.stats.touchdowns && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">TDs:</span>
                      <span className="text-white">{currentPlayer.stats.touchdowns}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Bid Info */}
        <div className="p-6 border-b border-slate-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-chrome mb-2">
              ${currentPlayer.currentBid.toLocaleString()}
            </div>
            <div className="text-slate-400">
              Current Bid • Min Bid: ${minBid.toLocaleString()}
            </div>
          </div>
        </div>

        {/* User Budget */}
        {userBudget && (
          <div className="p-6 border-b border-slate-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-white mb-1">Your Budget</div>
              <div className="text-2xl font-bold text-green-400">
                ${userBudget.remainingBudget.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400">
                of ${userBudget.totalBudget.toLocaleString()} remaining
              </div>
            </div>
          </div>
        )}

        {/* Quick Bid Buttons */}
        <div className="p-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Quick Bid</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickBidAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setBidAmount(amount)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  bidAmount === amount
                    ? 'border-chrome bg-chrome/20 text-chrome'
                    : 'border-slate-600 hover:border-slate-500 text-white'
                }`}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Bid */}
        <div className="p-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-4">Custom Bid</h4>
          <div className="flex space-x-3">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-chrome"
              min={minBid}
              max={userBudget?.remainingBudget}
            />
            <button
              onClick={handleCustomBid}
              disabled={!customAmount || parseInt(customAmount) < minBid || (userBudget ? parseInt(customAmount) > userBudget.remainingBudget : false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg transition-colors"
            >
              Bid
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex space-x-4">
          <button
            onClick={onPass}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
          >
            Pass
          </button>
          <button
            onClick={handleBid}
            disabled={!userBudget || bidAmount > userBudget.remainingBudget}
            className="flex-1 px-6 py-3 chrome-button rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bid ${bidAmount.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
} 