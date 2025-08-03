'use client';

import { useState, useEffect } from 'react';
import { getTeamColors } from '@/lib/team-colors';

interface ConferenceTeam {
  name?: string;
  school?: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  colors?: string[];
  color?: string;
  altColor?: string;
  division?: string;
  location?: string;
  stadium?: string;
  capacity?: number;
  coach?: string;
  established?: number;
  conference_id?: string;
  power_4?: boolean;
  created_at?: string;
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
  const [secTeams, setSecTeams] = useState<ConferenceTeam[]>([]);
  const [accTeams, setAccTeams] = useState<ConferenceTeam[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConferenceData();
  }, []);

  const loadConferenceData = async () => {
    try {
      setLoading(true);
      
      // Load all conference teams
      const [bigTenResponse, big12Response, secResponse, accResponse] = await Promise.all([
        fetch('/api/bigten?type=teams'),
        fetch('/api/big12?type=teams'),
        fetch('/api/sec?type=teams'),
        fetch('/api/acc?type=teams')
      ]);

      if (bigTenResponse.ok) {
        const bigTenData = await bigTenResponse.json();
        setBigTenTeams(bigTenData.data || []);
      }

      if (big12Response.ok) {
        const big12Data = await big12Response.json();
        setBig12Teams(big12Data.teams || big12Data.data || []);
      }

      if (secResponse.ok) {
        const secData = await secResponse.json();
        setSecTeams(secData.data || []);
      }

      if (accResponse.ok) {
        const accData = await accResponse.json();
        setAccTeams(accData.data || []);
      }

      // Load top players from all conferences
      const [bigTenPlayersResponse, big12PlayersResponse, secPlayersResponse, accPlayersResponse] = await Promise.all([
        fetch('/api/bigten?type=players'),
        fetch('/api/big12?type=players'),
        fetch('/api/sec?type=players'),
        fetch('/api/acc?type=players')
      ]);
      
      let allPlayers: Player[] = [];
      
      if (bigTenPlayersResponse.ok) {
        const bigTenPlayersData = await bigTenPlayersResponse.json();
        allPlayers = [...(bigTenPlayersData.data || [])];
      }
      
      if (big12PlayersResponse.ok) {
        const big12PlayersData = await big12PlayersResponse.json();
        allPlayers = [...allPlayers, ...(big12PlayersData.players || big12PlayersData.data || [])];
      }

      if (secPlayersResponse.ok) {
        const secPlayersData = await secPlayersResponse.json();
        allPlayers = [...allPlayers, ...(secPlayersData.data || [])];
      }

      if (accPlayersResponse.ok) {
        const accPlayersData = await accPlayersResponse.json();
        allPlayers = [...allPlayers, ...(accPlayersData.data || [])];
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

  // For debugging, show some content even if loading
  if (loading && bigTenTeams.length === 0 && big12Teams.length === 0 && secTeams.length === 0 && accTeams.length === 0) {
    return (
      <div className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">🏆 Power 4 Conferences</h2>
            <p className="text-xl text-gray-400">Exclusive to Power 4 conferences with unique eligibility rules</p>
          </div>

          {/* Big Ten Conference - Static for now */}
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-8 border border-blue-500/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-blue-400">Big Ten Conference</h3>
              <span className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-full text-sm">
                18 Teams
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Michigan", abbreviation: "MICH", mascot: "Wolverines" },
                { name: "Ohio State", abbreviation: "OSU", mascot: "Buckeyes" },
                { name: "Penn State", abbreviation: "PSU", mascot: "Nittany Lions" },
                { name: "Oregon", abbreviation: "ORE", mascot: "Ducks" },
                { name: "USC", abbreviation: "USC", mascot: "Trojans" },
                { name: "Wisconsin", abbreviation: "WIS", mascot: "Badgers" }
              ].map((team, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ 
                      backgroundColor: getTeamColors(team.name).primary,
                      border: `2px solid ${getTeamColors(team.name).secondary}`
                    }}
                  >
                    <span className="font-bold text-xs" style={{ color: getTeamColors(team.name).secondary }}>
                      {team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{team.name}</div>
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

          {/* SEC Conference - Static for now */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-xl p-8 border border-yellow-500/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-400">SEC Conference</h3>
              <span className="px-4 py-2 bg-yellow-600/30 text-yellow-300 rounded-full text-sm">
                16 Teams
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Georgia", abbreviation: "UGA", mascot: "Bulldogs" },
                { name: "Alabama", abbreviation: "ALA", mascot: "Crimson Tide" },
                { name: "LSU", abbreviation: "LSU", mascot: "Tigers" },
                { name: "Texas", abbreviation: "TEX", mascot: "Longhorns" },
                { name: "Florida", abbreviation: "UF", mascot: "Gators" },
                { name: "Tennessee", abbreviation: "TENN", mascot: "Volunteers" }
              ].map((team, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ 
                      backgroundColor: getTeamColors(team.name).primary,
                      border: `2px solid ${getTeamColors(team.name).secondary}`
                    }}
                  >
                    <span className="font-bold text-xs" style={{ color: getTeamColors(team.name).secondary }}>
                      {team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{team.name}</div>
                  <div className="text-xs text-gray-400">{team.mascot}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                View All SEC Teams →
              </button>
            </div>
          </div>

          {/* Big 12 Conference - Static for now */}
          <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 backdrop-blur-sm rounded-xl p-8 border border-red-500/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-red-400">Big 12 Conference</h3>
              <span className="px-4 py-2 bg-red-600/30 text-red-300 rounded-full text-sm">
                16 Teams
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Texas", abbreviation: "TEX", mascot: "Longhorns" },
                { name: "Oklahoma State", abbreviation: "OKST", mascot: "Cowboys" },
                { name: "Kansas State", abbreviation: "KSU", mascot: "Wildcats" },
                { name: "TCU", abbreviation: "TCU", mascot: "Horned Frogs" },
                { name: "Baylor", abbreviation: "BAYL", mascot: "Bears" },
                { name: "Texas Tech", abbreviation: "TTU", mascot: "Red Raiders" }
              ].map((team, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ 
                      backgroundColor: getTeamColors(team.name).primary,
                      border: `2px solid ${getTeamColors(team.name).secondary}`
                    }}
                  >
                    <span className="font-bold text-xs" style={{ color: getTeamColors(team.name).secondary }}>
                      {team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{team.name}</div>
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

          {/* ACC Conference - Static for now */}
          <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-green-400">ACC Conference</h3>
              <span className="px-4 py-2 bg-green-600/30 text-green-300 rounded-full text-sm">
                17 Teams
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: "Florida State", abbreviation: "FSU", mascot: "Seminoles" },
                { name: "Clemson", abbreviation: "CLEM", mascot: "Tigers" },
                { name: "Miami", abbreviation: "MIA", mascot: "Hurricanes" },
                { name: "Louisville", abbreviation: "LOU", mascot: "Cardinals" },
                { name: "North Carolina", abbreviation: "UNC", mascot: "Tar Heels" },
                { name: "Virginia Tech", abbreviation: "VT", mascot: "Hokies" }
              ].map((team, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                    style={{ 
                      backgroundColor: getTeamColors(team.name).primary,
                      border: `2px solid ${getTeamColors(team.name).secondary}`
                    }}
                  >
                    <span className="font-bold text-xs" style={{ color: getTeamColors(team.name).secondary }}>
                      {team.abbreviation}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{team.name}</div>
                  <div className="text-xs text-gray-400">{team.mascot}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-green-400 hover:text-green-300 text-sm">
                View All ACC Teams →
              </button>
            </div>
          </div>

          {/* Top Players */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">⭐ Top Players</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "J.J. McCarthy", position: "QB", team: "Michigan", rating: 95, conference: "Big Ten" },
                { name: "Marvin Harrison Jr.", position: "WR", team: "Ohio State", rating: 96, conference: "Big Ten" },
                { name: "Quinn Ewers", position: "QB", team: "Texas", rating: 94, conference: "Big 12" },
                { name: "Ollie Gordon II", position: "RB", team: "Oklahoma State", rating: 93, conference: "Big 12" }
              ].map((player, index) => (
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
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                  style={{ 
                    backgroundColor: getTeamColors(team.name || team.school || '').primary,
                    border: `2px solid ${getTeamColors(team.name || team.school || '').secondary}`
                  }}
                >
                  <span className="font-bold text-xs" style={{ color: getTeamColors(team.name || team.school || '').secondary }}>
                    {team.abbreviation}
                  </span>
                </div>
                <div className="text-sm font-semibold">{(team.name || team.school || '').split(' ')[0]}</div>
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

        {/* SEC Conference */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm rounded-xl p-8 border border-yellow-500/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-yellow-400">SEC Conference</h3>
            <span className="px-4 py-2 bg-yellow-600/30 text-yellow-300 rounded-full text-sm">
              {secTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {secTeams.slice(0, 12).map((team, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                  style={{ 
                    backgroundColor: getTeamColors(team.name || team.school || '').primary,
                    border: `2px solid ${getTeamColors(team.name || team.school || '').secondary}`
                  }}
                >
                  <span className="font-bold text-xs" style={{ color: getTeamColors(team.name || team.school || '').secondary }}>
                    {team.abbreviation}
                  </span>
                </div>
                <div className="text-sm font-semibold">{(team.name || team.school || '').split(' ')[0]}</div>
                <div className="text-xs text-gray-400">{team.mascot}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-yellow-400 hover:text-yellow-300 text-sm">
              View All SEC Teams →
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
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                  style={{ 
                    backgroundColor: getTeamColors(team.name || team.school || '').primary,
                    border: `2px solid ${getTeamColors(team.name || team.school || '').secondary}`
                  }}
                >
                  <span className="font-bold text-xs" style={{ color: getTeamColors(team.name || team.school || '').secondary }}>
                    {team.abbreviation}
                  </span>
                </div>
                <div className="text-sm font-semibold">{(team.name || team.school || '').split(' ')[0]}</div>
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

        {/* ACC Conference */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-green-400">ACC Conference</h3>
            <span className="px-4 py-2 bg-green-600/30 text-green-300 rounded-full text-sm">
              {accTeams.length} Teams
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {accTeams.slice(0, 12).map((team, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer group">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl"
                  style={{ 
                    backgroundColor: getTeamColors(team.name || team.school || '').primary,
                    border: `2px solid ${getTeamColors(team.name || team.school || '').secondary}`
                  }}
                >
                  <span className="font-bold text-xs" style={{ color: getTeamColors(team.name || team.school || '').secondary }}>
                    {team.abbreviation}
                  </span>
                </div>
                <div className="text-sm font-semibold">{(team.name || team.school || '').split(' ')[0]}</div>
                <div className="text-xs text-gray-400">{team.mascot}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-green-400 hover:text-green-300 text-sm">
              View All ACC Teams →
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