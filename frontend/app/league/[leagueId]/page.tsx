'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

interface LeagueHomePageProps {
  params: Promise<{ leagueId: string }>;
}

interface League {
  $id: string;
  name: string;
  creator: string;
  format: string;
  scoring: string;
  teams: number;
  maxTeams: number;
  status: 'draft' | 'active' | 'completed';
  draftScheduled: boolean;
  draftDate?: string;
  lmNote?: string;
  createdAt: string;
}

interface Team {
  $id: string;
  name: string;
  owner: string;
  leagueId: string;
  record: string;
  pointsFor: number;
  pointsAgainst: number;
}

export default function LeagueHomePage({ params }: LeagueHomePageProps) {
  const router = useRouter();
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<League | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'members' | 'rosters'>('settings');

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Load league data
  useEffect(() => {
    if (leagueId) {
      loadLeagueData();
    }
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      
      // Load league from Appwrite
      const leagueResponse = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      setLeague(leagueResponse as unknown as League);

      // Load user's team (you'd get the actual user ID from auth)
      const teamsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [
          // Add filters for this league and user
        ]
      );
      const teams = teamsResponse.documents as unknown as Team[];
      if (teams.length > 0) {
        setUserTeam(teams[0]); // For now, just get the first team
      }

    } catch (error) {
      console.error('Error loading league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteManagers = () => {
    // Open invite modal or redirect to invite page
    router.push(`/league/${leagueId}/invite`);
  };

  const handleScheduleDraft = () => {
    // Redirect to draft scheduling page
    router.push(`/league/${leagueId}/draft/schedule`);
  };

  const handleViewRoster = () => {
    // Redirect to team roster page
    router.push(`/team/${userTeam?.$id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading league...</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">League not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">🏈 College Football Fantasy</h1>
            </div>
            <div className="flex items-center space-x-8">
              <a href={`/team/${userTeam?.$id}`} className="text-gray-600 hover:text-gray-900">My Team</a>
              <a href={`/league/${leagueId}`} className="text-green-600 font-medium border-b-2 border-green-600">League</a>
              <a href="/players" className="text-gray-600 hover:text-gray-900">Players</a>
              <a href="/scoreboard" className="text-gray-600 hover:text-gray-900">Scoreboard</a>
              <a href="/standings" className="text-gray-600 hover:text-gray-900">Standings</a>
              <a href="/opponents" className="text-gray-600 hover:text-gray-900">Opposing Teams</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* My Team Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="relative">
                <button className="absolute top-0 right-0 text-gray-400 hover:text-gray-600">
                  ⚙️
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">🏈</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{userTeam?.name || 'My Team'}</h3>
                  <p className="text-sm text-gray-600 mb-3">Kashyap Maheshwari</p>
                  <button
                    onClick={handleViewRoster}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Roster
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                  <span className="mr-2">📋</span>
                  Rules
                </a>
                <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                  <span className="mr-2">❓</span>
                  FAQs
                </a>
                <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                  <span className="mr-2">⚙️</span>
                  Settings
                </a>
                <a href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                  <span className="mr-2">🏠</span>
                  Fantasy Football Home
                </a>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* League Details */}
            <div className="bg-white rounded-lg shadow-sm border border-green-200">
              <div className="border-b border-green-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{league.name}</h2>
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`${activeTab === 'settings' ? 'text-green-600 border-b-2 border-green-600' : 'hover:text-gray-900'}`}
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => setActiveTab('members')}
                        className={`${activeTab === 'members' ? 'text-green-600 border-b-2 border-green-600' : 'hover:text-gray-900'}`}
                      >
                        Members
                      </button>
                      <button
                        onClick={() => setActiveTab('rosters')}
                        className={`${activeTab === 'rosters' ? 'text-green-600 border-b-2 border-green-600' : 'hover:text-gray-900'}`}
                      >
                        Rosters
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Creator: {league.creator}</div>
                    <div>Format: {league.format}</div>
                    <div>Scoring: {league.scoring}</div>
                    <div>Teams: {league.teams}/{league.maxTeams}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {!league.draftScheduled && (
                  <div className="mb-6">
                    <div className="text-red-600 font-medium mb-4">
                      Your league is not full and your draft has not been scheduled.
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleInviteManagers}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Invite Managers
                      </button>
                      <button
                        onClick={handleScheduleDraft}
                        className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Schedule Your Draft
                      </button>
                    </div>
                  </div>
                )}

                {/* League Manager's Note */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">League Manager's Note</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Edit LM Note
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    {league.lmNote || "Fantasy Football 2025! Welcome to your College Football Fantasy league. Your League Manager will have the opportunity to post a League Manager Note to the entire league and that will appear in this area."}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Waiver Report
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700 mb-3">
                    No Recent Activity
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    See Full Recent Activity
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* League Manager's Poll */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">League Manager's Poll</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Create a Poll
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="font-semibold text-gray-900 mb-4">Fantasy Football Support</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <div>Username and Password Help</div>
              <div>Change Email Address</div>
            </div>
            <div>
              <div>Issues Joining a League</div>
              <div>Login and Account Issues</div>
            </div>
            <div>
              <div>Reset Draft</div>
              <div>Find Your Team</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 