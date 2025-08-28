'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@lib/hooks/useAuth';
import Link from 'next/link';
// Realtime to live-update team counts
import { client, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';

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
  leagueStatus: 'open' | 'closed';
  draftStatus: 'pre-draft' | 'drafting' | 'post-draft';
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
  const [inviteLeagueId, setInviteLeagueId] = useState<string | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [availableLeagues, setAvailableLeagues] = useState<League[]>([]);
  const { user: authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const hasInvite = Boolean(inviteToken);
  const trackedIdsRef = useRef<Set<string>>(new Set());

  // Keep a ref of tracked league IDs so realtime callbacks can filter without re-subscribing
  useEffect(() => {
    const ids = new Set<string>(availableLeagues.map(l => String(l.$id)));
    if (selectedLeague) ids.add(String(selectedLeague.$id));
    trackedIdsRef.current = ids;
  }, [availableLeagues, selectedLeague]);

  // Helper: refresh a single league from API and merge into state
  const refreshLeague = async (id: string) => {
    try {
      const res = await fetch(`/api/leagues/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) return;
      const doc = data.league;
      const updated: League = {
        $id: doc.$id || doc.id,
        name: doc.name || doc.leagueName,
        owner: doc.commissioner || doc.commissionerId || 'Commissioner',
        teams: doc.currentTeams || (Array.isArray(doc.members) ? doc.members.length : 0),
        maxTeams: doc.maxTeams || 12,
        draftType: doc.draftType || 'snake',
        entryFee: typeof doc.entryFee === 'number' ? doc.entryFee : 0,
        draftDate: doc.draftDate || '',
        draftTime: doc.draftTime || '',
        description: doc.description || '',
        type: (doc.isPublic === false || !!doc.password) ? 'private' : 'public',
        password: doc.password,
        leagueStatus: (doc.leagueStatus || 'open') as any,
        draftStatus: (doc.draftStatus || 'pre-draft') as any,
        createdAt: doc.$createdAt
      };
      setAvailableLeagues(prev => prev.map(l => (String(l.$id) === String(id) ? { ...l, ...updated } : l)));
      setSelectedLeague(prev => (prev && String(prev.$id) === String(id) ? { ...prev, ...updated } : prev));
    } catch {}
  };

  // Realtime: update counts and button state when leagues or fantasy_teams change
  useEffect(() => {
    const unsubLeagues = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`, (event) => {
      const payload: any = event.payload;
      if (!payload?.$id) return;
      if (!trackedIdsRef.current.has(String(payload.$id))) return;
      void refreshLeague(String(payload.$id));
    });
    const unsubRosters = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.FANTASY_TEAMS}.documents`, (event) => {
      const payload: any = event.payload;
      const leagueId = String(payload?.leagueId || '');
      if (!leagueId) return;
      if (!trackedIdsRef.current.has(leagueId)) return;
      void refreshLeague(leagueId);
    });
    return () => {
      try { unsubLeagues(); } catch {}
      try { unsubRosters(); } catch {}
    };
  }, []);

  // Invite code system removed - only token-based invites are supported

  // Load current user from auth hook
  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        setCurrentUser({ $id: authUser.$id, name: authUser.name || authUser.email, email: authUser.email });
      } else {
        setCurrentUser(null);
      }
    }
  }, [authUser, authLoading]);

  // Check for invite token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const leagueId = searchParams.get('league');
    
    if (token && leagueId) {
      // If not logged in, redirect to login, then back to this URL
      if (!authUser && !authLoading) {
        const redirectUrl = encodeURIComponent(`/league/join?token=${token}&league=${leagueId}`);
        router.push(`/login?redirect=${redirectUrl}`);
        return;
      }
      setInviteToken(token);
      setInviteLeagueId(leagueId);
      checkInviteToken(token, leagueId);
    } else if (token && !leagueId) {
      // Token-only link: resolve league via API
      if (!authUser && !authLoading) {
        const redirectUrl = encodeURIComponent(`/league/join?token=${token}`);
        router.push(`/login?redirect=${redirectUrl}`);
        return;
      }
      setInviteToken(token);
      setInviteLeagueId(null);
      setCheckingInvite(true);
      (async () => {
        try {
          const response = await fetch(`/api/leagues/invite?token=${token}`);
          const data = await response.json();
          if (response.ok && data.valid) {
            const normalized: League = {
              $id: data.league.id,
              name: data.league.leagueName || data.league.name,
              owner: data.league.commissioner || 'Commissioner',
              teams: data.league.currentTeams || 0,
              maxTeams: data.league.maxTeams || 12,
              draftType: 'snake',
              entryFee: 0,
              draftDate: new Date().toISOString(),
              draftTime: '19:00',
              description: '',
              type: 'private',
              leagueStatus: 'open' as const,
              draftStatus: 'drafting' as const,
              createdAt: new Date().toISOString(),
            };
            setSelectedLeague(normalized);
            setInviteLeagueId(data.league.id);
            setShowPasswordModal(true);
          } else {
            alert(data.error || 'Invalid or expired invite link');
          }
        } catch (e) {
          console.error('Token-only invite resolution failed', e);
          alert('Failed to validate invite link');
        } finally {
          setCheckingInvite(false);
        }
      })();
    } else if (leagueId && !token) {
      // Handle direct league link without token or code
      if (!authUser && !authLoading) {
        const redirectUrl = encodeURIComponent(`/league/join?league=${leagueId}`);
        router.push(`/login?redirect=${redirectUrl}`);
        return;
      }
      // Fetch and display the league
      (async () => {
        try {
          const response = await fetch(`/api/leagues/${leagueId}`);
          const data = await response.json();
          
          if (!response.ok || !data.success) {
            throw new Error('League not found');
          }
          
          const leagueDoc = data.league;
          const league: League = {
            $id: leagueDoc.$id || leagueDoc.id,
            name: leagueDoc.name,
            owner: leagueDoc.commissioner || leagueDoc.commissionerId || 'Commissioner',
            teams: leagueDoc.currentTeams || leagueDoc.members?.length || 0,
            maxTeams: leagueDoc.maxTeams || 12,
            draftType: leagueDoc.draftType || 'snake',
            entryFee: typeof leagueDoc.entryFee === 'number' ? leagueDoc.entryFee : 0,
            // scoringType omitted; not part of League interface
            // buyIn/prize omitted; not part of League interface
            draftDate: leagueDoc.draftDate || '',
            draftTime: leagueDoc.draftTime || '',
            description: leagueDoc.description || '',
            type: (leagueDoc.isPublic === false || !!leagueDoc.password) ? 'private' : 'public',
            password: leagueDoc.password,
            leagueStatus: (leagueDoc.leagueStatus || 'open') as any,
            draftStatus: (leagueDoc.draftStatus || 'pre-draft') as any,
            createdAt: leagueDoc.$createdAt
          };
          setSelectedLeague(league);
          if (league.type === 'private' || !!league.password) {
            setShowPasswordModal(true);
          } else {
            await joinLeague(league);
          }
        } catch (e) {
          console.error('Failed to fetch league', e);
        }
      })();
    }
  }, [searchParams, authUser, authLoading, router]);

  // Validate invite token
  const checkInviteToken = async (token: string, leagueId: string) => {
    setCheckingInvite(true);
    try {
      const response = await fetch(`/api/leagues/invite?token=${token}&league=${leagueId}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        // Normalize API response (which uses `id`) to expected League shape (which uses `$id`)
        const normalized: League = {
          $id: data.league.id,
          name: data.league.leagueName || data.league.name,
          owner: data.league.commissioner || 'Commissioner',
          teams: data.league.currentTeams || 0,
          maxTeams: data.league.maxTeams || 12,
          draftType: 'snake',
          entryFee: 0,
          draftDate: new Date().toISOString(),
          draftTime: '19:00',
          description: '',
          type: 'private',
          leagueStatus: 'open' as const,
              draftStatus: 'drafting' as const,
          createdAt: new Date().toISOString(),
        };
        setSelectedLeague(normalized);
        setInviteLeagueId(data.league.id);
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

  // Search leagues by name (public endpoint; no auth required)
  const searchLeagues = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAvailableLeagues([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Use the public search endpoint which exposes leagueName safely
      const params = new URLSearchParams();
      params.append('type', 'leagues');
      params.append('q', searchQuery);
      params.append('limit', '20');

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
      const mapped: League[] = suggestions.map((s: any) => ({
        $id: s.id,
        name: s.name, // This is leagueName from the search API
        owner: 'Commissioner',
        teams: s.teams ?? 0,
        maxTeams: 12,
        draftType: 'snake',
        entryFee: 0,
        draftDate: new Date().toISOString(),
        draftTime: '',
        description: '',
        type: 'public',
        leagueStatus: 'open',
        draftStatus: 'pre-draft',
        createdAt: new Date().toISOString(),
      }));

      setAvailableLeagues(mapped);
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
          leagueStatus: 'open' as const,
              draftStatus: 'drafting' as const,
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
          leagueStatus: 'open' as const,
              draftStatus: 'drafting' as const,
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
      const redirectUrl = encodeURIComponent(`/league/join?league=${league.$id}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    if (league.type === 'private' || !!league.password) {
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

    await joinLeague(selectedLeague, password);
  };

  const joinLeague = async (league: League, password?: string) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Use the API endpoint for joining
      const response = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId: league.$id,
          password: password,
          teamName: `${currentUser.name}'s Team`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setPasswordError(data.error || 'Invalid password. Please try again.');
          return;
        }
        throw new Error(data.error || 'Failed to join league');
      }

      console.log('Successfully joined league:', league.name);
      
      // Redirect to the league home page
      router.push(`/league/${league.$id}`);
    } catch (error: any) {
      console.error('Error joining league:', error);
      alert(error.message || 'Failed to join league. Please try again.');
    } finally {
      setLoading(false);
      if (!password || !passwordError) {
        setShowPasswordModal(false);
        setSelectedLeague(null);
        setPassword('');
      }
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
      {inviteToken && (
        <div className="bg-[#E73C7E] text-white py-2 px-4 text-center">
          <p className="text-sm">
            🎉 You have been invited to join a league!
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
                      {((league as any).members?.length ?? league.teams)}/{league.maxTeams} Teams
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      league.type === 'private' 
                        ? 'bg-[#8A6B4D]/20 text-[#8A6B4D] border border-[#8A6B4D]/30' 
                        : 'bg-[#8A5EAA]/20 text-[#8A5EAA] border border-[#8A5EAA]/30'
                    }`}>
                      {league.type === 'private' ? '🔒 Private' : '🌐 Public'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      league.draftStatus === 'drafting' ? 'bg-[#FF0080]/20 text-[#FF0080] border border-[#FF0080]/30' :
                      league.draftStatus === 'post-draft' ? 'bg-[#8A5EAA]/20 text-[#8A5EAA] border border-[#8A5EAA]/30' :
                      'bg-[#8A6B4D]/20 text-[#8A6B4D] border border-[#8A6B4D]/30'
                    }`}>
                      {league.draftStatus?.replace('-', ' ').toUpperCase() || 'PRE-DRAFT'}
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
                    disabled={
                      loading ||
                      (league.teams >= league.maxTeams)
                    }
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      (league.teams >= league.maxTeams)
                        ? 'bg-[#8A6B4D]/30 text-[#8A6B4D] cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FF0080] to-[#8A5EAA] text-white hover:from-[#FF0080]/90 hover:to-[#8A5EAA]/90'
                    }`}
                  >
                    {league.teams >= league.maxTeams
                      ? 'Full'
                      : loading
                      ? 'Joining...'
                      : 'Join League'}
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