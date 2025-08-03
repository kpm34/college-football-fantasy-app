'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Player, DraftablePlayer } from '@/types/player.types';
import { DraftPick, League } from '@/types/draft';
import { Badge } from '@/components/ui/Badge';

interface MobileDraftInterfaceProps {
  availablePlayers: DraftablePlayer[];
  draftedPlayers: DraftPick[];
  league: League;
  currentPick: number;
  isUserTurn: boolean;
  timeRemaining: number;
  onDraftPlayer: (player: DraftablePlayer) => void;
  onOpenResearch?: (player: DraftablePlayer) => void;
  onComparePlayer?: (player: DraftablePlayer) => void;
}

export default function MobileDraftInterface({
  availablePlayers,
  draftedPlayers,
  league,
  currentPick,
  isUserTurn,
  timeRemaining,
  onDraftPlayer,
  onOpenResearch,
  onComparePlayer
}: MobileDraftInterfaceProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  const filteredPlayers = availablePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === 'ALL' || player.pos === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoundAndPick = (pickNumber: number) => {
    const round = Math.ceil(pickNumber / league.members.length);
    const pickInRound = ((pickNumber - 1) % league.members.length) + 1;
    return { round, pickInRound };
  };

  const { round, pickInRound } = getRoundAndPick(currentPick);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800">
        <div className="p-4">
          {/* Draft Status */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Round {round} • Pick {pickInRound}</h2>
              <p className="text-sm text-slate-400">Pick #{currentPick} Overall</p>
            </div>
            <div className={`text-center px-4 py-2 rounded-lg ${isUserTurn ? 'bg-blue-500/20 animate-pulse' : 'bg-slate-800'}`}>
              <p className="text-2xl font-bold text-white">{formatTime(timeRemaining)}</p>
              <p className="text-xs text-slate-400">{isUserTurn ? 'Your Turn!' : 'On the Clock'}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Position Filter */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPosition === pos
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="pt-44">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex bg-slate-900 border-b border-slate-800 sticky top-44 z-30">
            <Tab className={({ selected }) =>
              `flex-1 py-3 text-sm font-medium transition-colors ${
                selected
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`
            }>
              <UserGroupIcon className="w-5 h-5 mx-auto mb-1" />
              Available
            </Tab>
            <Tab className={({ selected }) =>
              `flex-1 py-3 text-sm font-medium transition-colors ${
                selected
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`
            }>
              <ClipboardDocumentListIcon className="w-5 h-5 mx-auto mb-1" />
              Drafted
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Available Players Tab */}
            <Tab.Panel>
              <div className="p-4 space-y-3">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.$id}
                    className="glass-card rounded-xl overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedPlayerId(
                        expandedPlayerId === player.$id ? null : player.$id
                      )}
                      className="p-4 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{player.name}</h3>
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {player.pos}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {player.team} • {player.conference}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-slate-300">
                              Proj: <strong>{player.season_projection?.proj_pts_total.toFixed(0)}</strong> pts
                            </span>
                            <span className="text-slate-300">
                              Tier: <strong>{player.draft_tier}</strong>
                            </span>
                          </div>
                        </div>
                        <ChevronDownIcon 
                          className={`w-5 h-5 text-slate-400 transition-transform ${
                            expandedPlayerId === player.$id ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedPlayerId === player.$id && (
                      <div className="px-4 pb-4 border-t border-slate-700/50">
                        <div className="grid grid-cols-3 gap-2 py-3 text-center">
                          <div>
                            <p className="text-xs text-slate-400">Ceiling</p>
                            <p className="text-sm font-semibold text-green-400">
                              {player.season_projection?.ceiling.toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Floor</p>
                            <p className="text-sm font-semibold text-red-400">
                              {player.season_projection?.floor.toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Risk</p>
                            <p className={`text-sm font-semibold ${
                              player.season_projection?.risk === 'low' ? 'text-green-400' :
                              player.season_projection?.risk === 'medium' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {player.season_projection?.risk?.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {isUserTurn && (
                            <button
                              onClick={() => onDraftPlayer(player)}
                              className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                            >
                              Draft Player
                            </button>
                          )}
                          <button
                            onClick={() => onOpenResearch?.(player)}
                            className="flex-1 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                          >
                            Research
                          </button>
                          <button
                            onClick={() => onComparePlayer?.(player)}
                            className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                          >
                            <span className="sr-only">Compare</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Tab.Panel>

            {/* Drafted Players Tab */}
            <Tab.Panel>
              <div className="p-4 space-y-3">
                {draftedPlayers.slice().reverse().map((pick) => (
                  <div key={pick.pickNumber} className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{pick.playerName}</h3>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {pick.playerPosition}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {pick.playerTeam}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          Pick #{pick.pickNumber}
                        </p>
                        <p className="text-xs text-slate-400">
                          Round {Math.ceil(pick.pickNumber / league.members.length)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400">
                        Drafted by: <span className="text-slate-300">
                          {league.members.find(m => m.userId === pick.userId)?.teamName || 'Unknown'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Fixed Bottom Action Bar */}
      {isUserTurn && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4">
          <div className="max-w-lg mx-auto">
            <p className="text-center text-sm text-slate-400 mb-2">
              It's your turn! Select a player to draft.
            </p>
            <div className="bg-blue-500/20 rounded-lg p-2 animate-pulse">
              <p className="text-center text-blue-400 font-medium">
                {formatTime(timeRemaining)} remaining
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}