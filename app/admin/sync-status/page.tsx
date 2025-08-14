'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiRefreshCw, FiDatabase, FiServer, FiCloud } from 'react-icons/fi';

interface SyncStatus {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  services: {
    appwrite: {
      status: boolean;
      configured: boolean;
      database: boolean;
      collections: Record<string, boolean>;
      error?: string;
    };
    vercel: {
      status: boolean;
      environment: string;
      region: string;
      kv?: {
        status: boolean;
        error?: string;
      };
    };
    environment: {
      hasApiKey: boolean;
      hasEndpoint: boolean;
      hasProjectId: boolean;
      hasDatabaseId: boolean;
    };
  };
}

export default function SyncStatusPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check status');
      setStatus({
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        services: {
          appwrite: {
            status: false,
            configured: false,
            database: false,
            collections: {},
            error: 'Unable to connect',
          },
          vercel: {
            status: true,
            environment: 'unknown',
            region: 'unknown',
          },
          environment: {
            hasApiKey: false,
            hasEndpoint: false,
            hasProjectId: false,
            hasDatabaseId: false,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <FiCheck className="text-green-600 text-xl" />
    ) : (
      <FiX className="text-red-600 text-xl" />
    );
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Checking sync status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vercel-Appwrite Sync Status</h1>
            <p className="text-gray-600 mt-1">Monitor the health of your integrations</p>
          </div>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Overall Status */}
        {status && (
          <div className={`mb-8 p-6 rounded-lg border-2 ${getOverallStatusColor(status.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold capitalize">{status.status}</h2>
                <p className="text-sm opacity-75">
                  Last checked: {new Date(status.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">
                {status.status === 'healthy' && '✅'}
                {status.status === 'degraded' && '⚠️'}
                {status.status === 'unhealthy' && '❌'}
              </div>
            </div>
          </div>
        )}

        {/* Service Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Appwrite Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiDatabase className="text-2xl text-purple-600" />
              <h3 className="text-xl font-semibold">Appwrite</h3>
              {status && getStatusIcon(status.services.appwrite.status)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Configuration</span>
                {status && getStatusIcon(status.services.appwrite.configured)}
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Database Connection</span>
                {status && getStatusIcon(status.services.appwrite.database)}
              </div>
              
              {status?.services.appwrite.error && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{status.services.appwrite.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vercel Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiCloud className="text-2xl text-black" />
              <h3 className="text-xl font-semibold">Vercel</h3>
              {status && getStatusIcon(status.services.vercel.status)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Environment</span>
                <span className="font-medium">{status?.services.vercel.environment || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Region</span>
                <span className="font-medium">{status?.services.vercel.region || 'N/A'}</span>
              </div>
              {status?.services.vercel.kv && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-600">KV Storage</span>
                  {getStatusIcon(status.services.vercel.kv.status)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FiServer className="text-gray-600" />
            Environment Variables
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">API Key</span>
              {status && getStatusIcon(status.services.environment.hasApiKey)}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Endpoint</span>
              {status && getStatusIcon(status.services.environment.hasEndpoint)}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Project ID</span>
              {status && getStatusIcon(status.services.environment.hasProjectId)}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Database ID</span>
              {status && getStatusIcon(status.services.environment.hasDatabaseId)}
            </div>
          </div>
        </div>

        {/* Collections Status */}
        {status && Object.keys(status.services.appwrite.collections).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Database Collections</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(status.services.appwrite.collections).map(([name, isHealthy]) => (
                <div
                  key={name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isHealthy ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <span className="text-sm font-medium">{name}</span>
                  {getStatusIcon(isHealthy)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <FiAlertTriangle />
              <p className="font-medium">Connection Error</p>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/health"
              target="_blank"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Raw API Response
            </a>
            <a
              href="/admin/cache-status"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Cache Status
            </a>
            <a
              href="/test-sentry"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Test Error Tracking
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
