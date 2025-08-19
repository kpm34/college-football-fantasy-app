'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { Game, WeekSchedule } from '@/app/api/schedule/route';

interface ScheduleNavigationProps {
  className?: string;
}

const POWER_4_TEAMS = [
  // SEC
  'Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 
  'LSU', 'Mississippi State', 'Missouri', 'Ole Miss', 'South Carolina', 
  'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt', 'Oklahoma',
  
  // Big Ten
  'Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State',
  'Minnesota', 'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State',
  'Purdue', 'Rutgers', 'UCLA', 'USC', 'Washington', 'Wisconsin',
  
  // Big 12
  'Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado',
  'Houston', 'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State',
  'TCU', 'Texas Tech', 'UCF', 'Utah', 'West Virginia',
  
  // ACC
  'Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech',
  'Louisville', 'Miami', 'NC State', 'North Carolina', 'Notre Dame',
  'Pittsburgh', 'Syracuse', 'Virginia', 'Virginia Tech', 'Wake Forest'
];

export function ScheduleNavigation({ className = '' }: ScheduleNavigationProps) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<WeekSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'team'>('week');

  useEffect(() => {
    fetchSchedule();
  }, [currentWeek, selectedTeam]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (viewMode === 'week') {
        params.append('week', currentWeek.toString());
      }
      if (selectedTeam && viewMode === 'team') {
        params.append('team', selectedTeam);
      }
      
      const response = await fetch(`/api/schedule?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getTeamGames = (team: string) => {
    return schedule.flatMap(week => 
      week.games.filter(game => 
        game.homeTeam === team || game.awayTeam === team
      )
    );
  };

  const nextWeek = () => {
    if (currentWeek < 13) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const prevWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  return (
    <div className={`bg-[#F5F0E6]/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#5E2B8A]/20 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-[#5E2B8A]/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#5E2B8A]">
            2025 CFB Schedule
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex bg-[#5E2B8A]/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-[#5E2B8A] text-white'
                  : 'text-[#5E2B8A] hover:bg-[#5E2B8A]/20'
              }`}
            >
              <Calendar size={16} />
              Week
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'team'
                  ? 'bg-[#5E2B8A] text-white'
                  : 'text-[#5E2B8A] hover:bg-[#5E2B8A]/20'
              }`}
            >
              <Users size={16} />
              Team
            </button>
          </div>
        </div>

        {/* Week Navigation */}
        {viewMode === 'week' && (
          <div className="flex items-center justify-between">
            <button
              onClick={prevWeek}
              disabled={currentWeek === 1}
              className="flex items-center gap-2 px-4 py-2 bg-[#5E2B8A] text-white rounded-lg hover:bg-[#8A5EAA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#5E2B8A]">
                Week {currentWeek}
              </h3>
              {schedule.length > 0 && (
                <p className="text-sm text-[#5E2B8A]/70">
                  {formatDate(schedule[0].startDate)} - {formatDate(schedule[0].endDate)}
                </p>
              )}
            </div>
            
            <button
              onClick={nextWeek}
              disabled={currentWeek === 13}
              className="flex items-center gap-2 px-4 py-2 bg-[#5E2B8A] text-white rounded-lg hover:bg-[#8A5EAA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Team Selection */}
        {viewMode === 'team' && (
          <div className="space-y-4">
            <select
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(e.target.value || null)}
              className="w-full px-4 py-2 bg-white border-2 border-[#5E2B8A]/20 rounded-lg focus:border-[#5E2B8A] focus:outline-none text-[#5E2B8A]"
            >
              <option value="">Select a team...</option>
              {POWER_4_TEAMS.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            
            {selectedTeam && (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#5E2B8A]">
                  {selectedTeam} Schedule
                </h3>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Games List */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E2B8A]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {viewMode === 'week' && schedule.map(week => (
              <div key={week.week}>
                {week.games.length === 0 ? (
                  <p className="text-center text-[#5E2B8A]/70 py-8">
                    No Power 4 games scheduled for Week {currentWeek}
                  </p>
                ) : (
                  week.games.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))
                )}
              </div>
            ))}
            
            {viewMode === 'team' && selectedTeam && (
              <div className="space-y-4">
                {getTeamGames(selectedTeam).length === 0 ? (
                  <p className="text-center text-[#5E2B8A]/70 py-8">
                    No games found for {selectedTeam}
                  </p>
                ) : (
                  getTeamGames(selectedTeam).map(game => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      highlightTeam={selectedTeam}
                      showWeek={true}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface GameCardProps {
  game: Game;
  highlightTeam?: string;
  showWeek?: boolean;
}

function GameCard({ game, highlightTeam, showWeek = false }: GameCardProps) {
  const getConferenceBadgeColor = (conference: string) => {
    switch (conference) {
      case 'SEC': return 'bg-red-100 text-red-700 border-red-200';
      case 'Big Ten': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Big 12': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'ACC': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isTeamHighlighted = (team: string) => {
    return highlightTeam === team;
  };

  return (
    <div className="bg-white rounded-lg border border-[#5E2B8A]/20 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            {showWeek && (
              <span className="px-2 py-1 bg-[#5E2B8A]/10 text-[#5E2B8A] text-xs font-medium rounded">
                Week {game.week}
              </span>
            )}
            <span className="text-sm text-gray-600">
              {formatDate(game.date)} • {game.time}
            </span>
            {game.tv && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                {game.tv}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isTeamHighlighted(game.awayTeam) ? 'text-[#E73C7E]' : 'text-[#5E2B8A]'}`}>
                {game.awayTeam}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getConferenceBadgeColor(game.awayConference)}`}>
                {game.awayConference}
              </span>
            </div>
            
            <span className="text-gray-400">@</span>
            
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isTeamHighlighted(game.homeTeam) ? 'text-[#E73C7E]' : 'text-[#5E2B8A]'}`}>
                {game.homeTeam}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${getConferenceBadgeColor(game.homeConference)}`}>
                {game.homeConference}
              </span>
            </div>
          </div>
          
          {game.location && (
            <p className="text-sm text-gray-600 mt-1">{game.location}</p>
          )}
        </div>
        
        {game.line && (
          <div className="text-right">
            <span className="text-sm font-medium text-[#5E2B8A]">{game.line}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}