'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinLeaguePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableLeagues, setAvailableLeagues] = useState([
    {
      id: '1',
      name: 'Power 4 Champions',
      owner: 'John Smith',
      teams: 8,
      maxTeams: 12,
      draftType: 'Snake',
      entryFee: 0,
      draftDate: '2025-08-30',
      draftTime: '19:00',
      description: 'Competitive league for Power 4 conference fans'
    },
    {
      id: '2',
      name: 'SEC Legends',
      owner: 'Sarah Johnson',
      teams: 6,
      maxTeams: 10,
      draftType: 'Auction',
      entryFee: 25,
      draftDate: '2025-08-28',
      draftTime: '20:00',
      description: 'SEC-focused league with auction draft'
    },
    {
      id: '3',
      name: 'Big Ten Battle',
      owner: 'Mike Davis',
      teams: 10,
      maxTeams: 12,
      draftType: 'Snake',
      entryFee: 0,
      draftDate: '2025-08-29',
      draftTime: '18:30',
      description: 'Big Ten conference fantasy league'
    }
  ]);

  const handleJoinLeague = async (leagueId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the league
      router.push(`/league/${leagueId}/draft`);
    } catch (error) {
      console.error('Error joining league:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = availableLeagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/league/create" className="text-gray-600 hover:text-gray-900">Create League</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join a League</h2>
          <p className="text-gray-600">Find and join an existing College Football Fantasy league</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <label htmlFor="search" className="sr-only">Search leagues</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search leagues by name or owner..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Available Leagues */}
        <div className="space-y-6">
          {filteredLeagues.map((league) => (
            <div key={league.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{league.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {league.teams}/{league.maxTeams} Teams
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Owner: {league.owner}</p>
                    <p>Draft: {league.draftType} • {new Date(league.draftDate).toLocaleDateString()} at {league.draftTime}</p>
                    <p>Entry Fee: {league.entryFee === 0 ? 'Free' : `$${league.entryFee}`}</p>
                  </div>
                  
                  <p className="text-gray-700">{league.description}</p>
                </div>
                
                <div className="ml-6">
                  <button
                    onClick={() => handleJoinLeague(league.id)}
                    disabled={loading || league.teams >= league.maxTeams}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      league.teams >= league.maxTeams
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {league.teams >= league.maxTeams ? 'Full' : loading ? 'Joining...' : 'Join League'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredLeagues.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No leagues found</p>
              <p className="text-gray-600">Try adjusting your search terms or create a new league</p>
            </div>
          </div>
        )}

        {/* Create League CTA */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Can't find the right league?</h3>
            <p className="text-blue-800 mb-4">Create your own league and invite friends to join!</p>
            <button
              onClick={() => router.push('/league/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New League
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 