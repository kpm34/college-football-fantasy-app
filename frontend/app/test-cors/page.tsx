"use client";

import { useEffect, useState } from "react";

export default function TestCORS() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testEndpoints() {
      const tests = [
        {
          name: "Direct Appwrite Health Check",
          url: "https://nyc.cloud.appwrite.io/v1/health",
          headers: {
            'X-Appwrite-Project': 'college-football-fantasy-app'
          }
        },
        {
          name: "Account Endpoint (Preflight)",
          url: "https://nyc.cloud.appwrite.io/v1/account",
          method: "OPTIONS",
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'X-Appwrite-Project'
          }
        },
        {
          name: "Account Endpoint (GET)",
          url: "https://nyc.cloud.appwrite.io/v1/account",
          headers: {
            'X-Appwrite-Project': 'college-football-fantasy-app'
          }
        }
      ];

      const testResults = [];

      for (const test of tests) {
        try {
          const response = await fetch(test.url, {
            method: test.method || 'GET',
            headers: test.headers,
            credentials: 'include'
          });

          const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
          };

          testResults.push({
            name: test.name,
            status: response.status,
            statusText: response.statusText,
            corsHeaders,
            origin: window.location.origin
          });
        } catch (error: any) {
          testResults.push({
            name: test.name,
            error: error.message,
            origin: window.location.origin
          });
        }
      }

      setResults(testResults);
      setLoading(false);
    }

    testEndpoints();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CORS Diagnostic Tool</h1>
        
        <div className="mb-4 p-4 bg-gray-800 rounded">
          <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p><strong>Expected CORS Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>

        {loading ? (
          <p>Running tests...</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded">
                <h3 className="text-xl font-semibold mb-2">{result.name}</h3>
                
                {result.error ? (
                  <div className="text-red-400">
                    <p><strong>Error:</strong> {result.error}</p>
                  </div>
                ) : (
                  <div>
                    <p><strong>Status:</strong> {result.status} {result.statusText}</p>
                    <div className="mt-2">
                      <strong>CORS Headers:</strong>
                      <ul className="ml-4 mt-1">
                        {Object.entries(result.corsHeaders).map(([key, value]) => (
                          <li key={key} className={value === null ? 'text-gray-500' : ''}>
                            {key}: {value || 'NOT SET'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-900 rounded">
          <h3 className="text-xl font-semibold mb-2">Troubleshooting Steps:</h3>
          <ol className="list-decimal ml-4 space-y-2">
            <li>Check if Appwrite Cloud is experiencing issues</li>
            <li>Verify all platforms are correctly configured in Appwrite Console</li>
            <li>Clear browser cache and cookies for nyc.cloud.appwrite.io</li>
            <li>Try accessing from an incognito/private window</li>
            <li>Contact Appwrite support if the issue persists</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
