'use client';

import { useState, useEffect } from 'react';

interface ConferenceTeam {
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  color: string;
  altColor: string;
}

interface Player {
  name: string;
  position: string;
  team: string;
  rating: number;
  conference: string;
}

export default function ConferenceShowcase() {
  const [bigTenTeams, setBigTenTeams] = useState<ConferenceTeam[]>([]);
  const [big12Teams, setBig12Teams] = useState<ConferenceTeam[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConferenceData();
  }, []);

  const loadConferenceData = async () => {
    try {
      setLoading(true);
      
      // Load Big Ten teams
      const bigTenResponse = await fetch('/api/bigten?type=teams');
      if (bigTenResponse.ok) {
        const bigTenData = await bigTenResponse.json();
        setBigTenTeams(bigTenData.teams || []);
      }

      // Load Big 12 teams
      const big12Response = await fetch('/api/big12?type=teams');
      if (big12Response.ok) {
        const big12Data = await big12Response.json();
        setBig12Teams(big12Data.teams || []);
      }

      // Load top players from both conferences
      const bigTenPlayersResponse = await fetch('/api/bigten?type=players');
      const big12PlayersResponse = await fetch('/api/big12?type=players');
      
      let allPlayers: Player[] = [];
      
      if (bigTenPlayersResponse.ok) {
        const bigTenPlayersData = await bigTenPlayersResponse.json();
        allPlayers = [...(bigTenPlayersData.players || [])];
      }
      
      if (big12PlayersResponse.ok) {
        const big12PlayersData = await big12PlayersResponse.json();
        allPlayers = [...allPlayers, ...(big12PlayersData.players || [])];
      }
      
      // Sort by rating and take top 8
      allPlayers.sort((a, b) => b.rating - a.rating);
      setTopPlayers(allPlayers.slice(0, 8));

    } catch (error) {
      console.error('Error loading conference data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Loading conferences...</p>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">🏆 Power 4 Conferences</h2>
          <p className="text-xl text-gray-400">Exclusive to Power 4 conferences with unique eligibility rules</p>
        </div>

        {/* Big Ten Conference */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-8 border border-blue-500/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-blue-400">Big Ten Conference</h3>
            <span className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-full text-sm">
              {bigTenTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {bigTenTeams.slice(0, 12).map((team, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">{team.abbreviation}</span>
                </div>
                <div className="text-sm font-semibold">{team.school.split(' ')[0]}</div>
                <div className="text-xs text-gray-400">{team.mascot}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-blue-400 hover:text-blue-300 text-sm">
              View All Big Ten Teams →
            </button>
          </div>
        </div>

        {/* Big 12 Conference */}
        <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-red-400">Big 12 Conference</h3>
            <span className="px-4 py-2 bg-red-600/30 text-red-300 rounded-full text-sm">
              {big12Teams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {big12Teams.slice(0, 12).map((team, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">{team.abbreviation}</span>
                </div>
                <div className="text-sm font-semibold">{team.school.split(' ')[0]}</div>
                <div className="text-xs text-gray-400">{team.mascot}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-red-400 hover:text-red-300 text-sm">
              View All Big 12 Teams →
            </button>
          </div>
        </div>

        {/* Top Players */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">⭐ Top Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPlayers.map((player, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-white">{player.name}</div>
                  <div className="text-xs text-yellow-400 font-bold">{player.rating}</div>
                </div>
                <div className="text-xs text-gray-400 mb-2">{player.position} • {player.team}</div>
                <div className="text-xs text-gray-500">{player.conference}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility Rules */}
        <div className="mt-12 bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30">
          <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">🎯 Unique Eligibility Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h4 className="font-semibold text-white mb-2">Power 4 Only</h4>
              <p className="text-sm text-gray-400">Exclusive to SEC, ACC, Big 12, and Big Ten conferences</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h4 className="font-semibold text-white mb-2">AP Top-25 Rule</h4>
              <p className="text-sm text-gray-400">Players eligible only vs AP Top-25 teams or in conference games</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h4 className="font-semibold text-white mb-2">12-Week Season</h4>
              <p className="text-sm text-gray-400">No playoffs or bowls - just pure conference competition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 