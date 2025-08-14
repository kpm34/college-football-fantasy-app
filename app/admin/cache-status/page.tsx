'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiDatabase, FiZap, FiTrash2 } from 'react-icons/fi';

interface CacheStats {
  hits: number;
  misses: number;
  keys: string[];
  size: string;
}

export default function CacheStatusPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalidating, setInvalidating] = useState(false);

  useEffect(() => {
    fetchCacheStats();
  }, []);

  const fetchCacheStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cache/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = async (pattern: string) => {
    if (!confirm(`Are you sure you want to invalidate cache pattern: ${pattern}?`)) {
      return;
    }

    try {
      setInvalidating(true);
      const response = await fetch('/api/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern }),
      });
      
      if (response.ok) {
        alert('Cache invalidated successfully');
        fetchCacheStats();
      } else {
        alert('Failed to invalidate cache');
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
      alert('Error invalidating cache');
    } finally {
      setInvalidating(false);
    }
  };

  const warmCache = async (type: string) => {
    try {
      setInvalidating(true);
      const response = await fetch(`/api/${type}/cached`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-secret'}`
        },
      });
      
      if (response.ok) {
        alert(`${type} cache warmed successfully`);
        fetchCacheStats();
      } else {
        alert(`Failed to warm ${type} cache`);
      }
    } catch (error) {
      console.error(`Error warming ${type} cache:`, error);
      alert(`Error warming ${type} cache`);
    } finally {
      setInvalidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hitRate = stats ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cache Status</h1>
          <button
            onClick={fetchCacheStats}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cache Hits</p>
                <p className="text-2xl font-bold text-green-600">{stats?.hits || 0}</p>
              </div>
              <FiZap className="text-green-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cache Misses</p>
                <p className="text-2xl font-bold text-red-600">{stats?.misses || 0}</p>
              </div>
              <FiDatabase className="text-red-600 text-2xl" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hit Rate</p>
                <p className="text-2xl font-bold text-blue-600">{hitRate}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.keys.length || 0}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">#</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Cache Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => warmCache('games')}
              disabled={invalidating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <FiZap />
              Warm Games Cache
            </button>
            
            <button
              onClick={() => warmCache('players')}
              disabled={invalidating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <FiZap />
              Warm Players Cache
            </button>
            
            <button
              onClick={() => invalidateCache('*')}
              disabled={invalidating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <FiTrash2 />
              Clear All Cache
            </button>
          </div>
        </div>

        {/* Cache Keys */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cached Keys</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats?.keys.length === 0 ? (
              <p className="text-gray-500">No cached keys found</p>
            ) : (
              stats?.keys.map((key) => (
                <div key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <code className="text-sm text-gray-700">{key}</code>
                  <button
                    onClick={() => invalidateCache(key)}
                    disabled={invalidating}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cache Strategy Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Cache Durations</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">SHORT:</span>
              <span className="text-blue-600"> 1 min</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">MEDIUM:</span>
              <span className="text-blue-600"> 5 min</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">LONG:</span>
              <span className="text-blue-600"> 1 hour</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">VERY_LONG:</span>
              <span className="text-blue-600"> 24 hours</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">WEEK:</span>
              <span className="text-blue-600"> 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
