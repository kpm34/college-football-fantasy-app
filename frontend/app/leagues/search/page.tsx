'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface League {
  id: string;
  name: string;
  mode: 'CONFERENCE' | 'POWER4';
  conf: string | null;
  maxTeams: number;
  currentTeams: number;
  status: string;
  commissionerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeagueSearchPage() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [totalLeagues, setTotalLeagues] = useState(0);

  useEffect(() => {
    fetchLeagues();
  }, [searchTerm, modeFilter]);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (modeFilter) params.append('mode', modeFilter);
      params.append('limit', '50');

      const response = await fetch(`/api/leagues/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeagues(data.leagues);
        setTotalLeagues(data.total);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModeBadge = (mode: string) => {
    if (mode === 'CONFERENCE') {
      return <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">Conference</span>;
    } else {
      return <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">Power-4</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFTING':
        return <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">Drafting</span>;
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">Active</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">Completed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };

  const getConferenceName = (conf: string | null) => {
    if (!conf) return 'All Power-4';
    const confMap: { [key: string]: string } = {
      'big_ten': 'Big Ten',
      'sec': 'SEC',
      'big_12': 'Big 12',
      'acc': 'ACC'
    };
    return confMap[conf] || conf;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            🔍 Find Your League
          </h1>
          <p className="text-xl text-gray-400">
            Discover and join college football fantasy leagues
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Search Input */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-white">
                Search Leagues
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by league name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black bg-white"
              />
            </div>

            {/* Mode Filter */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-white">
                Game Mode
              </label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black bg-white"
              >
                <option value="">All Modes</option>
                <option value="CONFERENCE">Conference Mode</option>
                <option value="POWER4">Power-4 Mode</option>
              </select>
            </div>

            {/* Create League Button */}
            <div className="flex items-end">
              <button
                onClick={() => router.push('/league/create')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-lg backdrop-blur-sm"
              >
                Create New League
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {loading ? 'Loading...' : `${totalLeagues} Leagues Found`}
            </h2>
            <button
              onClick={fetchLeagues}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Leagues Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading leagues...</p>
            </div>
          ) : leagues.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏈</div>
              <h3 className="text-xl font-semibold text-white mb-2">No leagues found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || modeFilter ? 'Try adjusting your search criteria' : 'Be the first to create a league!'}
              </p>
              <button
                onClick={() => router.push('/league/create')}
                className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
              >
                Create League
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league) => (
                <div
                  key={league.id}
                  className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
                  onClick={() => router.push(`/league/${league.id}`)}
                >
                  {/* League Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        {getModeBadge(league.mode)}
                        {getStatusBadge(league.status)}
                      </div>
                    </div>
                  </div>

                  {/* League Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Conference:</span>
                      <span className="text-white font-semibold">{getConferenceName(league.conf)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Teams:</span>
                      <span className="text-white font-semibold">{league.currentTeams}/{league.maxTeams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white font-semibold">{formatDate(league.createdAt)}</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/league/${league.id}`);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    View League
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 