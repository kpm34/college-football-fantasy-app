'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface TestResult {
  status: 'pending' | 'success' | 'failed' | 'skipped';
  details: any;
}

interface ConnectionTestResult {
  timestamp: string;
  environment: string;
  checks: {
    envVars: TestResult;
    appwriteConnection: TestResult;
    databaseAccess: TestResult;
    collectionList: TestResult;
    authService: TestResult;
    documentCreation: TestResult;
  };
  summary?: {
    status: string;
    totalChecks: number;
    passed: number;
    failed: number;
    failedCheckNames?: string[];
  };
  error?: any;
}

interface RepositoryTestResult {
  timestamp: string;
  tests: {
    repositoryInit: TestResult;
    findLeagues: TestResult;
    createTestLeague: TestResult;
    deleteTestLeague: TestResult;
  };
  summary?: {
    status: string;
    totalTests: number;
    passed: number;
    failed: number;
    failedTests?: string[];
  };
  error?: any;
}

export default function DebugConnectionPage() {
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [repositoryTest, setRepositoryTest] = useState<RepositoryTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runConnectionTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug/test-connection');
      const data = await response.json();
      setConnectionTest(data);
    } catch (err: any) {
      setError(`Connection test failed: ${err.message}`);
    }
    setLoading(false);
  };

  const runRepositoryTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/debug/test-repository');
      const data = await response.json();
      setRepositoryTest(data);
    } catch (err: any) {
      setError(`Repository test failed: ${err.message}`);
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    await runConnectionTest();
    await runRepositoryTest();
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getOverallStatus = () => {
    const connStatus = connectionTest?.summary?.status;
    const repoStatus = repositoryTest?.summary?.status;
    
    if (!connStatus && !repoStatus) return 'unknown';
    if (connStatus === 'critical' || repoStatus === 'critical') return 'critical';
    if (connStatus === 'degraded' || repoStatus === 'degraded') return 'degraded';
    if (connStatus === 'healthy' && repoStatus === 'healthy') return 'healthy';
    return 'unknown';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🔍 Appwrite ↔️ Vercel Connection Diagnostics</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              overallStatus === 'healthy' ? 'bg-green-600' :
              overallStatus === 'degraded' ? 'bg-yellow-600' :
              overallStatus === 'critical' ? 'bg-red-600' :
              'bg-gray-600'
            }`}>
              Overall Status: {overallStatus.toUpperCase()}
            </div>
            
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5" />
                  Run All Tests
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Connection Test Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Connection Tests</h2>
            <button
              onClick={runConnectionTest}
              disabled={loading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Rerun
            </button>
          </div>
          
          {connectionTest && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(connectionTest.checks).map(([key, check]) => (
                  <div key={key} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      {getStatusIcon(check.status)}
                    </div>
                    
                    {check.status === 'failed' && check.details.error && (
                      <div className="text-sm text-red-400 mt-2">
                        Error: {check.details.error}
                      </div>
                    )}
                    
                    {check.status === 'success' && (
                      <div className="text-sm text-gray-300 mt-2">
                        <pre className="overflow-x-auto">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {connectionTest.summary && (
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-gray-400">
                    Passed: {connectionTest.summary.passed}/{connectionTest.summary.totalChecks} checks
                  </p>
                  {connectionTest.summary.failedCheckNames && connectionTest.summary.failedCheckNames.length > 0 && (
                    <p className="text-sm text-red-400 mt-1">
                      Failed: {connectionTest.summary.failedCheckNames.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Repository Test Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Repository Tests</h2>
            <button
              onClick={runRepositoryTest}
              disabled={loading}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Rerun
            </button>
          </div>
          
          {repositoryTest && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(repositoryTest.tests).map(([key, test]) => (
                  <div key={key} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      {getStatusIcon(test.status)}
                    </div>
                    
                    {test.status === 'failed' && test.details.error && (
                      <div className="text-sm text-red-400 mt-2">
                        Error: {test.details.error}
                        {test.details.code && <div>Code: {test.details.code}</div>}
                      </div>
                    )}
                    
                    {test.status === 'success' && (
                      <div className="text-sm text-gray-300 mt-2">
                        <pre className="overflow-x-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {repositoryTest.summary && (
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-gray-400">
                    Passed: {repositoryTest.summary.passed}/{repositoryTest.summary.totalTests} tests
                  </p>
                  {repositoryTest.summary.failedTests && repositoryTest.summary.failedTests.length > 0 && (
                    <p className="text-sm text-red-400 mt-1">
                      Failed: {repositoryTest.summary.failedTests.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-sm text-gray-500 text-center">
          {connectionTest && (
            <p>Last connection test: {new Date(connectionTest.timestamp).toLocaleString()}</p>
          )}
          {repositoryTest && (
            <p>Last repository test: {new Date(repositoryTest.timestamp).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
