'use client';

import { useState } from 'react';

export default function SimpleHome() {
  const [selectedConference, setSelectedConference] = useState<string | undefined>();

  const handleConferenceClick = (conference: string) => {
    setSelectedConference(conference);
    console.log(`Selected conference: ${conference}`);
  };

  // Mock games data
  const mockGames = [
    {
      id: '1',
      homeTeam: 'Alabama',
      awayTeam: 'Auburn',
      homePoints: 24,
      awayPoints: 21,
      status: 'final' as const,
      week: 12,
      seasonType: 'regular',
      startDate: '2024-11-30T19:30:00Z',
      homeConference: 'SEC',
      awayConference: 'SEC'
    },
    {
      id: '2',
      homeTeam: 'Michigan',
      awayTeam: 'Ohio State',
      homePoints: 30,
      awayPoints: 24,
      status: 'final' as const,
      week: 12,
      seasonType: 'regular',
      startDate: '2024-11-30T15:30:00Z',
      homeConference: 'Big Ten',
      awayConference: 'Big Ten'
    },
    {
      id: '3',
      homeTeam: 'Clemson',
      awayTeam: 'Florida State',
      homePoints: 28,
      awayPoints: 35,
      status: 'in_progress' as const,
      week: 12,
      seasonType: 'regular',
      startDate: '2024-11-30T20:00:00Z',
      homeConference: 'ACC',
      awayConference: 'ACC'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black opacity-60"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                COLLEGE FOOTBALL
              </span>
              <span className="block text-5xl md:text-7xl text-white mt-2">FANTASY</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto">
              Play fantasy football with the Power 4 conferences.
              <span className="block mt-2 text-yellow-400 font-semibold">
                Only elite matchups count - AP Top 25 & conference games!
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-400 hover:to-yellow-500 transform hover:scale-105 transition-all shadow-lg shadow-yellow-500/25">
                Start a League
              </button>
              <button className="bg-zinc-900/80 backdrop-blur border-2 border-zinc-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all">
                Join League
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Why Play With Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Power 4 Only"
              description="SEC, ACC, Big 12, and Big Ten - only the best conferences"
              icon="🏈"
            />
            <FeatureCard 
              title="Elite Matchups"
              description="Start players only in AP Top-25 or conference games"
              icon="🏆"
            />
            <FeatureCard 
              title="Live Scoring"
              description="Real-time updates powered by ESPN data"
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">This Week's Games</h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            Games with golden borders are eligible for fantasy scoring - AP Top 25 matchups or conference games only!
          </p>
          
          <div className="mb-8">
            <SimpleGamesList games={mockGames} />
          </div>
          
          <div className="text-center">
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition">
              View All Games
            </button>
          </div>
        </div>
      </section>

      {/* Conference Showcase */}
      <section className="py-20 px-4 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Featured Conferences</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <ConferenceCard 
              name="SEC" 
              color="bg-red-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
            <ConferenceCard 
              name="Big Ten" 
              color="bg-blue-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
            <ConferenceCard 
              name="ACC" 
              color="bg-orange-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
            <ConferenceCard 
              name="Big 12" 
              color="bg-purple-600" 
              onConferenceClick={handleConferenceClick}
              selectedConference={selectedConference}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-xl hover:border-yellow-500/50 hover:bg-zinc-700 transition-all group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function ConferenceCard({ 
  name, 
  color, 
  onConferenceClick, 
  selectedConference 
}: { 
  name: string; 
  color: string; 
  onConferenceClick?: (conference: string) => void;
  selectedConference?: string;
}) {
  return (
    <div 
      className={`${color} p-8 rounded-xl hover:scale-105 transition-all transform relative overflow-hidden group h-48 cursor-pointer ${
        selectedConference === name ? 'ring-4 ring-yellow-400' : ''
      }`}
      onClick={() => onConferenceClick?.(name)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <h3 className="text-2xl font-bold text-center text-white relative z-10 mb-4">{name}</h3>
      
      {/* Conference Logo Placeholder */}
      <div className="relative z-10 h-32 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">🏈</div>
          <div className="text-white text-sm font-medium">Click to Select</div>
        </div>
      </div>
    </div>
  );
}

function SimpleGamesList({ games }: { games: any[] }) {
  const isEligibleGame = (game: any): boolean => {
    return game.homeConference && game.awayConference && 
           game.homeConference === game.awayConference;
  };

  const isLiveGame = (game: any): boolean => {
    return game.status === 'in_progress';
  };

  const formatGameTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStatusBadge = (game: any) => {
    switch (game.status) {
      case 'scheduled':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-full">
            Scheduled
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full animate-pulse">
            LIVE
          </span>
        );
      case 'final':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
            Final
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div
            key={game.id}
            className={`
              relative bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-750
              ${isEligibleGame(game) 
                ? 'border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                : 'border border-gray-700'
              }
              ${isLiveGame(game) ? 'ring-2 ring-green-500/30' : ''}
            `}
          >
            {/* Eligible Game Indicator */}
            {isEligibleGame(game) && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  ELIGIBLE
                </div>
              </div>
            )}

            {/* Game Status Badge */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-xs text-gray-400">
                Week {game.week} • {game.seasonType}
              </div>
              {getStatusBadge(game)}
            </div>

            {/* Teams and Scores */}
            <div className="space-y-3">
              {/* Home Team */}
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-white">{game.homeTeam}</div>
                  {game.homeConference && (
                    <div className="text-xs text-gray-400">{game.homeConference}</div>
                  )}
                </div>
                <div className={`
                  text-lg font-bold ml-2
                  ${isLiveGame(game) ? 'text-green-400' : 'text-white'}
                `}>
                  {game.homePoints !== undefined ? game.homePoints : '-'}
                </div>
              </div>

              {/* VS */}
              <div className="text-center text-gray-500 text-sm font-medium">VS</div>

              {/* Away Team */}
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-white">{game.awayTeam}</div>
                  {game.awayConference && (
                    <div className="text-xs text-gray-400">{game.awayConference}</div>
                  )}
                </div>
                <div className={`
                  text-lg font-bold ml-2
                  ${isLiveGame(game) ? 'text-green-400' : 'text-white'}
                `}>
                  {game.awayPoints !== undefined ? game.awayPoints : '-'}
                </div>
              </div>
            </div>

            {/* Game Time */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {formatGameTime(game.startDate)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 