'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

interface League {
  $id: string;
  name: string;
  owner: string;
  teams: number;
  maxTeams: number;
  draftType: 'snake' | 'auction';
  entryFee: number;
  draftDate: string;
  draftTime: string;
  description: string;
  type: 'public' | 'private';
  password?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
}

interface User {
  $id: string;
  name: string;
  email: string;
}

interface Team {
  $id: string;
  name: string;
  owner: string;
  leagueId: string;
  record: string;
  pointsFor: number;
  pointsAgainst: number;
  players: string[]; // Array of player IDs
  createdAt: string;
}

function JoinLeagueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [leagueType, setLeagueType] = useState<'all' | 'public' | 'private'>('all');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLeagueId, setInviteLeagueId] = useState<string | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [availableLeagues, setAvailableLeagues] = useState<League[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user (you'd get this from auth)
  useEffect(() => {
    // For now, simulate a logged-in user
    setCurrentUser({
      $id: 'user123',
      name: 'Kashyap Maheshwari',
      email: 'kashyap@example.com'
    });
  }, []);

  // Check for invite token or code in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const code = searchParams.get('code');
    const leagueId = searchParams.get('league');
    
    if (token && leagueId) {
      setInviteToken(token);
      setInviteLeagueId(leagueId);
      checkInviteToken(token, leagueId);
    } else if (code && leagueId) {
      setInviteCode(code);
      setInviteLeagueId(leagueId);
      setSearchTerm(code);
      // Auto-search for the league with this code
      searchLeagues(code);
    }
  }, [searchParams]);

  // Validate invite token
  const checkInviteToken = async (token: string, leagueId: string) => {
    setCheckingInvite(true);
    try {
      const response = await fetch(`/api/leagues/invite?token=${token}&league=${leagueId}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        // Automatically select this league
        setSelectedLeague(data.league as League);
        setShowPasswordModal(true);
      } else {
        alert(data.error || 'Invalid or expired invite link');
      }
    } catch (error) {
      console.error('Error checking invite:', error);
      alert('Failed to validate invite link');
    } finally {
      setCheckingInvite(false);
    }
  };

  // Search leagues by name
  const searchLeagues = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAvailableLeagues([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search leagues in Appwrite by name
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        [
          // Search by league name (case-insensitive)
          // Note: Appwrite doesn't support full-text search by default
          // You might need to implement a custom search solution
        ]
      );

      const leagues = response.documents as unknown as League[];
      
      // Filter leagues by search term (client-side for now)
      const filteredLeagues = leagues.filter(league =>
        league.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setAvailableLeagues(filteredLeagues);
    } catch (error) {
      console.error('Error searching leagues:', error);
      // Fallback to sample data for demo
      setAvailableLeagues([
        {
          $id: '1',
          name: 'Power 4 Champions',
          owner: 'John Smith',
          teams: 8,
          maxTeams: 12,
          draftType: 'snake',
          entryFee: 0,
          draftDate: '2025-08-30',
          draftTime: '19:00',
          description: 'Competitive league for Power 4 conference fans',
          type: 'public',
          status: 'draft',
          createdAt: new Date().toISOString()
        },
        {
          $id: '2',
          name: 'SEC Legends',
          owner: 'Sarah Johnson',
          teams: 6,
          maxTeams: 10,
          draftType: 'auction',
          entryFee: 25,
          draftDate: '2025-08-28',
          draftTime: '20:00',
          description: 'SEC-focused league with auction draft',
          type: 'private',
          password: 'sec2025',
          status: 'draft',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLeagues(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleJoinLeague = async (league: League) => {
    if (!currentUser) {
      alert('Please log in to join a league');
      return;
    }

    if (league.type === 'private') {
      setSelectedLeague(league);
      setShowPasswordModal(true);
    } else {
      await joinLeague(league);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!selectedLeague || !currentUser) return;

    if (password === selectedLeague.password) {
      await joinLeague(selectedLeague);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const joinLeague = async (league: League) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // 1. Create roster for the user in this league
      const rosterData = {
        teamName: `${currentUser.name}'s Team`,
        name: `${currentUser.name}'s Team`,
        userId: currentUser.$id,
        userName: currentUser.name,
        email: currentUser.email,
        leagueId: league.$id,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        players: '[]', // Empty JSON string for pre-draft
        createdAt: new Date().toISOString()
      };

      const teamResponse = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        'unique()', // Auto-generate ID
        rosterData
      );

      // 2. Update league team count and members array
      const updatedMembers = [...(league.members || []), currentUser.$id];
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        league.$id,
        {
          teams: league.teams + 1,
          members: updatedMembers
        }
      );

      // 3. Log the join activity (optional - for tracking)
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOG,
        'unique()',
        {
          type: 'league_join',
          userId: currentUser.$id,
          leagueId: league.$id,
          teamId: teamResponse.$id,
          timestamp: new Date().toISOString(),
          description: `${currentUser.name} joined ${league.name}`
        }
      );

      console.log('Successfully joined league:', league.name);
      
      // Redirect to the league home page
      router.push(`/league/${league.$id}`);
    } catch (error) {
      console.error('Error joining league:', error);
      alert('Failed to join league. Please try again.');
    } finally {
      setLoading(false);
      setShowPasswordModal(false);
      setSelectedLeague(null);
      setPassword('');
    }
  };

  const filteredLeagues = availableLeagues.filter(league => {
    const matchesType = leagueType === 'all' || league.type === leagueType;
    return matchesType;
  });

  const publicLeagues = availableLeagues.filter(league => league.type === 'public');
  const privateLeagues = availableLeagues.filter(league => league.type === 'private');

  if (checkingInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5E2B8A] via-[#8A5EAA] to-[#8A6B4D] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5E2B8A] mx-auto mb-4"></div>
          <p className="text-[#5E2B8A] font-semibold">Validating invite link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5E2B8A] via-[#8A5EAA] to-[#8A6B4D]">
      {/* Invite Info Banner */}
      {(inviteToken || inviteCode) && (
        <div className="bg-[#E73C7E] text-white py-2 px-4 text-center">
          <p className="text-sm">
            {inviteToken ? '🎉 You have been invited to join a league!' : `📧 Joining with invite code: ${inviteCode}`}
          </p>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <nav className="bg-[#F5F0E6]/90 backdrop-blur-sm shadow-lg border-b border-[#5E2B8A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-[#5E2B8A] hover:text-[#8A5EAA] transition-colors">
                🏈 College Football Fantasy
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-[#5E2B8A] hover:text-[#FF0080] transition-colors">
                Home
              </Link>
              <Link href="/league/create" className="text-[#5E2B8A] hover:text-[#FF0080] transition-colors">
                Create League
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#F5F0E6] mb-2">Join a League</h2>
          <p className="text-[#F5F0E6]/80">Search for leagues by name and join with your team</p>
        </div>

        {/* League Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#F5F0E6]/90 backdrop-blur-sm rounded-lg shadow-lg border border-[#5E2B8A]/20 p-1">
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All Leagues', count: availableLeagues.length },
                { key: 'public', label: 'Public', count: publicLeagues.length },
                { key: 'private', label: 'Private', count: privateLeagues.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setLeagueType(tab.key as any)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    leagueType === tab.key
                      ? 'bg-gradient-to-r from-[#FF0080] to-[#8A5EAA] text-white'
                      : 'text-[#5E2B8A] hover:text-[#FF0080] hover:bg-[#F5F0E6]/50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <label htmlFor="search" className="sr-only">Search leagues by name</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-[#8A5EAA] rounded-lg focus:ring-4 focus:ring-[#FF0080] focus:border-[#FF0080] bg-[#F5F0E6] text-[#5E2B8A] placeholder-[#8A6B4D]"
                placeholder="Search leagues by name..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {searchLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF0080]"></div>
                ) : (
                  <svg className="h-5 w-5 text-[#8A6B4D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Leagues */}
        <div className="space-y-6">
          {filteredLeagues.map((league) => (
            <div key={league.$id} className="bg-[#F5F0E6]/90 backdrop-blur-sm rounded-lg shadow-lg border border-[#5E2B8A]/20 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-[#5E2B8A]">{league.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF0080]/20 text-[#FF0080] border border-[#FF0080]/30">
                      {league.teams}/{league.maxTeams} Teams
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      league.type === 'private' 
                        ? 'bg-[#8A6B4D]/20 text-[#8A6B4D] border border-[#8A6B4D]/30' 
                        : 'bg-[#8A5EAA]/20 text-[#8A5EAA] border border-[#8A5EAA]/30'
                    }`}>
                      {league.type === 'private' ? '🔒 Private' : '🌐 Public'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      league.status === 'draft' ? 'bg-[#FF0080]/20 text-[#FF0080] border border-[#FF0080]/30' :
                      league.status === 'active' ? 'bg-[#8A5EAA]/20 text-[#8A5EAA] border border-[#8A5EAA]/30' :
                      'bg-[#8A6B4D]/20 text-[#8A6B4D] border border-[#8A6B4D]/30'
                    }`}>
                      {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-[#5E2B8A]/80 mb-3">
                    <p>Owner: {league.owner}</p>
                    <p>Draft: {league.draftType} • {new Date(league.draftDate).toLocaleDateString()} at {league.draftTime}</p>
                    <p>Entry Fee: {league.entryFee === 0 ? 'Free' : `$${league.entryFee}`}</p>
                  </div>
                  
                  <p className="text-[#5E2B8A]">{league.description}</p>
                </div>
                
                <div className="ml-6">
                  <button
                    onClick={() => handleJoinLeague(league)}
                    disabled={loading || league.teams >= league.maxTeams || league.status !== 'draft'}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      league.teams >= league.maxTeams || league.status !== 'draft'
                        ? 'bg-[#8A6B4D]/30 text-[#8A6B4D] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF0080] to-[#8A5EAA] text-white hover:from-[#FF0080]/90 hover:to-[#8A5EAA]/90'
                    }`}
                  >
                    {league.teams >= league.maxTeams ? 'Full' : 
                     league.status !== 'draft' ? 'Closed' :
                     loading ? 'Joining...' : 'Join League'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredLeagues.length === 0 && searchTerm && !searchLoading && (
          <div className="text-center py-12">
            <div className="text-[#F5F0E6]/80">
              <svg className="mx-auto h-12 w-12 text-[#8A6B4D] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <p className="text-lg font-medium text-[#F5F0E6] mb-2">No leagues found</p>
              <p className="text-[#F5F0E6]/80">Try searching for a different league name</p>
            </div>
          </div>
        )}

        {/* Create League CTA */}
        <div className="mt-12 text-center">
          <div className="bg-[#F5F0E6]/90 backdrop-blur-sm border border-[#FF0080]/30 rounded-lg p-6">
            <h3 className="text-lg font-medium text-[#5E2B8A] mb-2">Can't find the right league?</h3>
            <p className="text-[#5E2B8A]/80 mb-4">Create your own league and invite friends to join!</p>
            <button
              onClick={() => router.push('/league/create')}
              className="px-6 py-3 bg-gradient-to-r from-[#FF0080] to-[#8A5EAA] text-white rounded-lg hover:from-[#FF0080]/90 hover:to-[#8A5EAA]/90 transition-all transform hover:scale-105"
            >
              Create New League
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedLeague && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5F0E6] rounded-xl shadow-2xl p-8 max-w-md w-full border border-[#5E2B8A]/20">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#FF0080]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FF0080]/30">
                <span className="text-[#FF0080] text-xl">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-[#5E2B8A] mb-2">Private League</h2>
              <p className="text-[#5E2B8A]/80">Enter the password to join "{selectedLeague.name}"</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#5E2B8A] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#8A5EAA] rounded-lg focus:ring-4 focus:ring-[#FF0080] focus:border-[#FF0080] bg-white text-[#5E2B8A] placeholder-[#8A6B4D]"
                  placeholder="Enter league password"
                  required
                />
                {passwordError && (
                  <p className="text-[#FF0080] text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedLeague(null);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-[#8A6B4D] text-[#8A6B4D] rounded-lg hover:bg-[#8A6B4D]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FF0080] to-[#8A5EAA] text-white rounded-lg hover:from-[#FF0080]/90 hover:to-[#8A5EAA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                >
                  {loading ? 'Joining...' : 'Join League'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoinLeaguePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#5E2B8A] via-[#8A5EAA] to-[#8A6B4D] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#5E2B8A] mx-auto mb-4"></div>
          <p className="text-[#5E2B8A] font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <JoinLeagueContent />
    </Suspense>
  );
} 