'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@hooks/useAuth';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { leagueColors } from '@/lib/theme/colors';

interface Matchup {
  id: string;
  week: number;
  team1Id: string;
  team1Name: string;
  team1Score: number;
  team1Projected: number;
  team1Logo?: string;
  team2Id: string;
  team2Name: string;
  team2Score: number;
  team2Projected: number;
  team2Logo?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  isUserMatchup: boolean;
}

interface Player {
  name: string;
  position: string;
  team: string;
  points: number;
  projectedPoints: number;
  status: 'yet_to_play' | 'in_game' | 'finished';
  gameTime?: string;
}

interface ScoreboardPageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

export default function ScoreboardPage({ params }: ScoreboardPageProps) {
  const { leagueId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null);
  const [leagueName, setLeagueName] = useState('');

  // Determine current week based on date
  useEffect(() => {
    const seasonStart = new Date('2025-08-29'); // Adjust based on season
    const now = new Date();
    const weeksPassed = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const week = Math.max(1, Math.min(12, weeksPassed + 1));
    setCurrentWeek(week);
  }, []);

  // Fetch league data and user's team
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        // Fetch league info
        const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId);
        setLeagueName(league.name);

        // Find user's team
        if (user) {
          const rosters = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ROSTERS,
            [
              Query.equal('league_id', leagueId),
              Query.or([
                Query.equal('owner_auth_user_id', user.$id),
                Query.equal('owner_client_id', user.$id),
                Query.equal('auth_user_id', user.$id),
                Query.equal('teammanager_id', user.$id)
              ])
            ]
          );
          
          if (rosters.documents.length > 0) {
            setUserTeamId(rosters.documents[0].$id);
          }
        }
      } catch (error) {
        console.error('Error fetching league data:', error);
      }
    };

    fetchLeagueData();
  }, [leagueId, user]);

  // Fetch matchups for the current week
  useEffect(() => {
    const fetchMatchups = async () => {
      setLoading(true);
      try {
        // For now, generate mock matchups since we don't have a schedule system yet
        const rosters = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          [Query.equal('league_id', leagueId)]
        );

        // Create mock matchups by pairing teams
        const mockMatchups: Matchup[] = [];
        const teams = rosters.documents;
        
        for (let i = 0; i < teams.length; i += 2) {
          if (i + 1 < teams.length) {
            const team1 = teams[i];
            const team2 = teams[i + 1];
            
            // Generate mock scores based on week and team
            const baseScore1 = 80 + (currentWeek * 5) + (i * 3);
            const baseScore2 = 75 + (currentWeek * 4) + ((i + 1) * 3);
            
            mockMatchups.push({
              id: `${currentWeek}-${i}`,
              week: currentWeek,
              team1Id: team1.$id,
              team1Name: team1.teamName,
              team1Score: Math.round(baseScore1 + Math.random() * 30),
              team1Projected: Math.round(baseScore1 + 15),
              team2Id: team2.$id,
              team2Name: team2.teamName,
              team2Score: Math.round(baseScore2 + Math.random() * 30),
              team2Projected: Math.round(baseScore2 + 15),
              status: currentWeek < getCurrentWeek() ? 'completed' : 
                      currentWeek === getCurrentWeek() ? 'in_progress' : 'scheduled',
              isUserMatchup: userTeamId === team1.$id || userTeamId === team2.$id
            });
          }
        }

        setMatchups(mockMatchups);
      } catch (error) {
        console.error('Error fetching matchups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchups();
  }, [leagueId, currentWeek, userTeamId]);

  const getCurrentWeek = () => {
    const seasonStart = new Date('2025-08-29');
    const now = new Date();
    const weeksPassed = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(12, weeksPassed + 1));
  };

  const navigateWeek = (direction: number) => {
    setCurrentWeek(prev => Math.max(1, Math.min(12, prev + direction)));
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      <div className="aurora-bg" />
      
      {/* Header */}
      <div className="surface-card border-b border-white/10 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/league/${leagueId}`}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{leagueName} Scoreboard</h1>
                <p className="text-sm text-white/60">Live scores and matchups</p>
              </div>
            </div>
            
            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek(-1)}
                disabled={currentWeek === 1}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-white font-medium min-w-[80px] text-center">
                Week {currentWeek}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                disabled={currentWeek === 12}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative">
        {loading ? (
          <div className="text-center text-white/60 py-12">Loading matchups...</div>
        ) : matchups.length === 0 ? (
          <div className="surface-card rounded-xl p-12 text-center">
            <p className="text-xl text-white/60">No matchups scheduled for Week {currentWeek}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User's Matchup First */}
            {matchups.filter(m => m.isUserMatchup).map((matchup) => (
              <div
                key={matchup.id}
                className="surface-card rounded-xl p-6 border-2 border-blue-500/50 cursor-pointer hover:border-blue-500/70 transition-all"
                onClick={() => setSelectedMatchup(matchup)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-400">YOUR MATCHUP</span>
                  <span className={`text-sm font-medium ${
                    matchup.status === 'completed' ? 'text-gray-400' :
                    matchup.status === 'in_progress' ? 'text-green-400' :
                    'text-yellow-400'
                  }`}>
                    {matchup.status === 'completed' ? 'FINAL' :
                     matchup.status === 'in_progress' ? 'LIVE' :
                     'UPCOMING'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">
                        {matchup.team1Name}
                        {matchup.team1Id === userTeamId && <span className="text-blue-400 text-sm ml-2">(YOU)</span>}
                      </div>
                      <div className="text-sm text-gray-400">
                        Projected: {matchup.team1Projected}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {matchup.team1Score}
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/10" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">
                        {matchup.team2Name}
                        {matchup.team2Id === userTeamId && <span className="text-blue-400 text-sm ml-2">(YOU)</span>}
                      </div>
                      <div className="text-sm text-gray-400">
                        Projected: {matchup.team2Projected}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {matchup.team2Score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Other Matchups */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {matchups.filter(m => !m.isUserMatchup).map((matchup) => (
                <div
                  key={matchup.id}
                  className="surface-card rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => setSelectedMatchup(matchup)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium ${
                      matchup.status === 'completed' ? 'text-gray-400' :
                      matchup.status === 'in_progress' ? 'text-green-400' :
                      'text-yellow-400'
                    }`}>
                      {matchup.status === 'completed' ? 'FINAL' :
                       matchup.status === 'in_progress' ? 'LIVE' :
                       'UPCOMING'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{matchup.team1Name}</span>
                      <span className="text-2xl font-bold text-white">{matchup.team1Score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{matchup.team2Name}</span>
                      <span className="text-2xl font-bold text-white">{matchup.team2Score}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-gray-400">
                    <span>Proj: {matchup.team1Projected}</span>
                    <span>Proj: {matchup.team2Projected}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
