"use client";

import { useState, useEffect } from "react";
import { ChartBarIcon, TrophyIcon, ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  conference: string;
  projectedPoints: number;
  rating: number;
  projections: {
    season: {
      total: number;
      passing?: number;
      rushing?: number;
      receiving?: number;
      touchdowns?: number;
    };
    perGame: {
      points: string;
    };
  };
}

interface ProjectionShowcase {
  position: string;
  starters: Player[];
  backups: Player[];
  algorithm: {
    inputs: string[];
    description: string;
  };
}

export default function ProjectionShowcasePage() {
  const [showcases, setShowcases] = useState<ProjectionShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string>('QB');

  useEffect(() => {
    loadProjectionShowcase();
  }, []);

  const loadProjectionShowcase = async () => {
    try {
      // Load examples for each position to show algorithm differentiation
      const positions = ['QB', 'RB', 'WR', 'TE'];
      const showcaseData: ProjectionShowcase[] = [];

      for (const position of positions) {
        // Get top players (starters) and lower players (backups) for comparison
        const startersResponse = await fetch(`/api/draft/players?position=${position}&limit=10&orderBy=projection`);
        const startersData = await startersResponse.json();

        const backupsResponse = await fetch(`/api/draft/players?position=${position}&limit=50&orderBy=projection`);
        const backupsData = await backupsResponse.json();

        if (startersData.success && backupsData.success) {
          showcaseData.push({
            position,
            starters: startersData.players.slice(0, 5), // Top 5 starters
            backups: backupsData.players.slice(20, 25), // Players ranked 21-25 (backups)
            algorithm: {
              inputs: getAlgorithmInputs(position),
              description: getAlgorithmDescription(position)
            }
          });
        }
      }

      setShowcases(showcaseData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading projection showcase:', error);
      setLoading(false);
    }
  };

  const getAlgorithmInputs = (position: string): string[] => {
    const baseInputs = [
      'Team Pace (plays per game)',
      'Offensive Efficiency Z-Score',
      'Depth Chart Position Rank',
      'Usage Priors (snap/rush/target share)',
      'Injury Risk Assessment',
      'NFL Draft Capital',
      'Conference Strength Multiplier'
    ];

    const positionSpecific: Record<string, string[]> = {
      'QB': [...baseInputs, 'Pass Rate Context', 'Rush Attempt Share'],
      'RB': [...baseInputs, 'Rush Share', 'Target Share in Passing Game'],
      'WR': [...baseInputs, 'Target Share', 'Air Yards Distribution'],
      'TE': [...baseInputs, 'Snap Share', 'Route Running Rate']
    };

    return positionSpecific[position] || baseInputs;
  };

  const getAlgorithmDescription = (position: string): string => {
    const descriptions: Record<string, string> = {
      'QB': 'QB projections use team pace, pass rate, and depth chart rank with injury adjustments. Starters get full volume (1.0x multiplier), while backups get 25% or less based on depth.',
      'RB': 'RB projections consider rush share, target share, and committee situations. Depth multipliers range from 100% for RB1 to 60% for RB2, with further reductions for deeper players.',
      'WR': 'WR projections factor in target share, snap count, and route running. Top 3 receivers get favorable multipliers (100%, 80%, 60%) while deeper players see significant reductions.',
      'TE': 'TE projections emphasize snap share and red zone usage. Primary TEs get full projections while backups typically see 35% or less due to limited usage.'
    };

    return descriptions[position] || 'Position-specific algorithm with comprehensive data inputs.';
  };

  const getPositionColor = (position: string): string => {
    const colors: Record<string, string> = {
      'QB': 'text-red-500 border-red-200 bg-red-50',
      'RB': 'text-blue-500 border-blue-200 bg-blue-50',
      'WR': 'text-green-500 border-green-200 bg-green-50',
      'TE': 'text-orange-500 border-orange-200 bg-orange-50'
    };
    return colors[position] || 'text-gray-500 border-gray-200 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading Projection Algorithm Showcase...</p>
        </div>
      </div>
    );
  }

  const selectedShowcase = showcases.find(s => s.position === selectedPosition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Fantasy Projection Algorithm Showcase
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Our comprehensive projection system uses 10+ data inputs including team pace, efficiency metrics, 
            depth charts, usage priors, injury risk, and NFL draft capital to create individualized projections 
            that properly differentiate starters from backups.
          </p>
        </div>

        {/* Position Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-800 rounded-lg p-1">
            {['QB', 'RB', 'WR', 'TE'].map((position) => (
              <button
                key={position}
                onClick={() => setSelectedPosition(position)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  selectedPosition === position
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedShowcase && (
        <div className="container mx-auto px-4 pb-8">
          {/* Algorithm Description */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <ChartBarIcon className="w-8 h-8 mr-3 text-blue-400" />
              {selectedPosition} Projection Algorithm
            </h2>
            <p className="text-gray-300 mb-6">{selectedShowcase.algorithm.description}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedShowcase.algorithm.inputs.map((input, index) => (
                <div key={index} className="flex items-center bg-slate-700/50 rounded-lg p-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-300">{input}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Starters vs Backups Comparison */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Starters */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400" />
                Projected Starters (Top 5)
              </h3>
              <div className="space-y-4">
                {selectedShowcase.starters.map((player, index) => (
                  <div key={player.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{player.name}</h4>
                        <p className="text-gray-400 text-sm">{player.team} • {player.conference}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getPositionColor(player.position)}`}>
                        #{index + 1} {player.position}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-green-400">{player.projectedPoints}</span>
                        <span className="text-gray-400 ml-1">pts</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Per Game</p>
                        <p className="text-lg font-semibold">{player.projections.perGame.points}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backups */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <UserGroupIcon className="w-6 h-6 mr-2 text-gray-400" />
                Projected Backups (Ranked 21-25)
              </h3>
              <div className="space-y-4">
                {selectedShowcase.backups.map((player, index) => (
                  <div key={player.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{player.name}</h4>
                        <p className="text-gray-400 text-sm">{player.team} • {player.conference}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getPositionColor(player.position)}`}>
                        #{index + 21} {player.position}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-yellow-400">{player.projectedPoints}</span>
                        <span className="text-gray-400 ml-1">pts</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Per Game</p>
                        <p className="text-lg font-semibold">{player.projections.perGame.points}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Algorithm Impact Summary */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ClockIcon className="w-6 h-6 mr-2 text-purple-400" />
              Algorithm Impact Analysis
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {selectedShowcase.starters[0]?.projectedPoints || 0}
                </div>
                <p className="text-gray-400">Top Starter Projection</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {selectedShowcase.backups[0]?.projectedPoints || 0}
                </div>
                <p className="text-gray-400">Backup Projection</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {Math.round(((selectedShowcase.starters[0]?.projectedPoints || 0) / (selectedShowcase.backups[0]?.projectedPoints || 1)) * 100)}%
                </div>
                <p className="text-gray-400">Starter Advantage</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}