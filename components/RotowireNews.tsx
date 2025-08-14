'use client';

import { useState, useEffect } from 'react';
import { NewspaperIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  player?: string;
  team?: string;
  impact?: 'high' | 'medium' | 'low';
}

interface RotowireNewsProps {
  player?: string;
  team?: string;
  compact?: boolean;
  maxItems?: number;
}

export function RotowireNews({ player, team, compact = false, maxItems = 5 }: RotowireNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = async (refresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (player) params.append('player', player);
      if (team) params.append('team', team);
      if (refresh) params.append('refresh', 'true');
      
      const response = await fetch(`/api/rotowire/news?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }
      
      setNews(data.data.slice(0, maxItems));
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [player, team]);

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        <NewspaperIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No news available</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {news.map((item) => (
          <div key={item.id} className="border-l-2 border-gray-200 pl-3 py-1">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {item.title}
            </p>
            <p className="text-xs text-gray-500">
              {item.player && <span className="font-medium">{item.player}</span>}
              {item.player && item.team && ' • '}
              {item.team && <span>{item.team}</span>}
              {(item.player || item.team) && ' • '}
              {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <NewspaperIcon className="h-5 w-5 mr-2" />
          Rotowire News
        </h3>
        <button
          onClick={() => fetchNews(true)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          disabled={loading}
        >
          <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900 flex-1">{item.title}</h4>
              {item.impact && (
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getImpactColor(item.impact)}`}>
                  {item.impact}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 mb-2 line-clamp-3">
              {item.content}
            </p>
            
            <div className="flex items-center text-xs text-gray-500">
              {item.player && (
                <span className="font-medium text-gray-700">{item.player}</span>
              )}
              {item.player && item.team && <span className="mx-1">•</span>}
              {item.team && <span>{item.team}</span>}
              {(item.player || item.team) && <span className="mx-1">•</span>}
              <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
      </div>

      {lastFetched && (
        <p className="text-xs text-gray-500 text-center mt-4">
          Last updated {formatDistanceToNow(lastFetched, { addSuffix: true })}
        </p>
      )}
    </div>
  );
}
