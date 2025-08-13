'use client';

import { useState, useMemo } from 'react';
import { Player, PickPlayerModalProps } from '@/types/draft';

const POSITION_COLORS = {
  QB: 'bg-blue-500',
  RB: 'bg-green-500',
  WR: 'bg-purple-500',
  TE: 'bg-orange-500',
  K: 'bg-yellow-500',
  DEF: 'bg-red-500'
};

export default function PickPlayerModal({ 
  isOpen, 
  onClose, 
  onPickPlayer, 
  availablePlayers, 
  loading 
}: PickPlayerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'team'>('name');

  const filteredPlayers = useMemo(() => {
    let filtered = availablePlayers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by position
    if (selectedPosition !== 'ALL') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    // Sort players
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'position':
          return a.position.localeCompare(b.position);
        case 'team':
          return a.team.localeCompare(b.team);
        default:
          return 0;
      }
    });

    return filtered;
  }, [availablePlayers, searchTerm, selectedPosition, sortBy]);

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold chrome-text">Pick a Player</h2>
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

        {/* Search and Filters */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search Players
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or team..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-chrome"
              />
            </div>

            {/* Position Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-chrome"
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'position' | 'team')}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-chrome"
              >
                <option value="name">Name</option>
                <option value="position">Position</option>
                <option value="team">Team</option>
              </select>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chrome"></div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No players found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.$id}
                  player={player}
                  onPick={() => onPickPlayer(player)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              {filteredPlayers.length} of {availablePlayers.length} players available
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  onPick: () => void;
}

function PlayerCard({ player, onPick }: PlayerCardProps) {
  return (
    <div className="glass-card p-4 rounded-xl hover:scale-105 transition-transform cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-chrome transition-colors">
            {player.name}
          </h3>
          <p className="text-slate-400 text-sm">{player.team}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${POSITION_COLORS[player.position]}`}>
          {player.position}
        </span>
      </div>

      {player.stats && (
        <div className="space-y-1 mb-4">
          {player.stats.passingYards && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Pass Yds:</span>
              <span className="text-white">{player.stats.passingYards.toLocaleString()}</span>
            </div>
          )}
          {player.stats.rushingYards && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Rush Yds:</span>
              <span className="text-white">{player.stats.rushingYards.toLocaleString()}</span>
            </div>
          )}
          {player.stats.receivingYards && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Rec Yds:</span>
              <span className="text-white">{player.stats.receivingYards.toLocaleString()}</span>
            </div>
          )}
          {player.stats.touchdowns && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">TDs:</span>
              <span className="text-white">{player.stats.touchdowns}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${
          player.eligibility 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {player.eligibility ? 'Eligible' : 'Not Eligible'}
        </span>
        <button
          onClick={onPick}
          className="chrome-button px-3 py-1 rounded text-sm font-medium hover:scale-105 transition-transform"
        >
          Pick
        </button>
      </div>
    </div>
  );
} 