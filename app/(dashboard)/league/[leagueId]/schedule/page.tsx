'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { leagueColors } from '@/lib/theme/colors';

interface PageProps {
  params: Promise<{
    leagueId: string;
  }>;
}

interface MatchupProps {
  week: number;
  team1: string;
  team2: string;
  team1Score?: number;
  team2Score?: number;
  status: 'upcoming' | 'live' | 'completed';
}

export default function LeagueSchedulePage({ params }: PageProps) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<any>(null);
  const [matchups, setMatchups] = useState<MatchupProps[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Load league and schedule data
  useEffect(() => {
    if (!leagueId) return;

    const loadData = async () => {
      try {
        const [leagueRes, scheduleRes] = await Promise.all([
          fetch(`/api/leagues/${leagueId}`),
          fetch(`/api/leagues/${leagueId}/schedule`)
        ]);

        if (leagueRes.ok) {
          const leagueData = await leagueRes.json();
          setLeague(leagueData.league);
        }

        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          setMatchups(scheduleData.matchups || []);
          setCurrentWeek(scheduleData.currentWeek || 1);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Generate placeholder schedule for now
        generatePlaceholderSchedule();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [leagueId]);

  const generatePlaceholderSchedule = () => {
    // Generate a simple round-robin schedule placeholder
    const placeholderMatchups: MatchupProps[] = [];
    for (let week = 1; week <= 12; week++) {
      placeholderMatchups.push({
        week,
        team1: 'Team 1',
        team2: 'Team 2',
        status: week < 5 ? 'completed' : week === 5 ? 'live' : 'upcoming',
        team1Score: week < 5 ? Math.floor(Math.random() * 150) + 50 : undefined,
        team2Score: week < 5 ? Math.floor(Math.random() * 150) + 50 : undefined,
      });
    }
    setMatchups(placeholderMatchups);
    setCurrentWeek(5);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: leagueColors.background.main }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: leagueColors.text.primary }}>League Not Found</h1>
          <Link href="/dashboard" className="hover:underline" style={{ color: leagueColors.primary.highlight }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Group matchups by week
  const matchupsByWeek = matchups.reduce((acc, matchup) => {
    if (!acc[matchup.week]) acc[matchup.week] = [];
    acc[matchup.week].push(matchup);
    return acc;
  }, {} as Record<number, MatchupProps[]>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
      {/* Header */}
      <div style={{ backgroundColor: leagueColors.background.secondary, borderBottom: `1px solid ${leagueColors.border.medium}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/league/${leagueId}`)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Back to league"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">{league.leagueName || league.name} - Schedule</h1>
                <p className="mt-1" style={{ color: leagueColors.text.muted }}>
                  Season {league.season || new Date().getFullYear()} • Week {currentWeek}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {Object.entries(matchupsByWeek).map(([week, weekMatchups]) => (
            <div key={week} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <FiCalendar className="text-xl" style={{ color: leagueColors.primary.highlight }} />
                <h2 className="text-xl font-bold">
                  Week {week}
                  {parseInt(week) === currentWeek && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full" 
                          style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}>
                      Current
                    </span>
                  )}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weekMatchups.map((matchup, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 hover:bg-white/10"
                    style={{ borderColor: matchup.status === 'live' ? leagueColors.primary.crimson : 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm" style={{ color: leagueColors.text.muted }}>
                        {matchup.status === 'completed' ? 'Final' : 
                         matchup.status === 'live' ? 'Live' : 'Upcoming'}
                      </span>
                      {matchup.status === 'live' && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{matchup.team1}</span>
                        {matchup.team1Score !== undefined && (
                          <span className="font-bold text-lg">{matchup.team1Score}</span>
                        )}
                      </div>
                      <div className="text-center text-sm" style={{ color: leagueColors.text.muted }}>vs</div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{matchup.team2}</span>
                        {matchup.team2Score !== undefined && (
                          <span className="font-bold text-lg">{matchup.team2Score}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(matchupsByWeek).length === 0 && (
            <div className="text-center py-12">
              <FiCalendar className="text-4xl mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold mb-2">Schedule Not Generated</p>
              <p style={{ color: leagueColors.text.muted }}>
                The league schedule will be generated once all teams have joined.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
