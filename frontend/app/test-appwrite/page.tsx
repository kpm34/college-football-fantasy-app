'use client';

import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

export default function TestAppwritePage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [collections, setCollections] = useState<string[]>([]);
  
  useEffect(() => {
    testAppwriteConnection();
  }, []);
  
  const testAppwriteConnection = async () => {
    try {
      setStatus('Testing Appwrite connection...');
      
      // Test 1: List collections (basic connectivity test)
      setStatus('Fetching games collection...');
      const gamesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [Query.limit(5)]
      );
      
      setStatus('✅ Connected to Appwrite!');
      setData({
        games: gamesResponse.documents.length,
        totalGames: gamesResponse.total
      });
      
      // Test 2: Check various collections
      const collectionsToTest = [
        { name: 'Games', id: COLLECTIONS.GAMES },
        { name: 'Rankings', id: COLLECTIONS.RANKINGS },
        { name: 'Teams', id: COLLECTIONS.TEAMS },
        { name: 'Players', id: COLLECTIONS.PLAYERS || 'players' },
        { name: 'Leagues', id: COLLECTIONS.LEAGUES }
      ];
      
      const collectionStatus = [];
      
      for (const col of collectionsToTest) {
        try {
          const response = await databases.listDocuments(
            DATABASE_ID,
            col.id,
            [Query.limit(1)]
          );
          collectionStatus.push(`${col.name}: ${response.total} documents`);
        } catch (err) {
          collectionStatus.push(`${col.name}: ❌ Not found`);
        }
      }
      
      setCollections(collectionStatus);
      
    } catch (err: any) {
      setStatus('❌ Connection failed');
      setError(err.message || 'Unknown error');
      console.error('Appwrite error:', err);
    }
  };
  
  const testApiRoute = async () => {
    try {
      setStatus('Testing API routes...');
      
      // Test players API
      const playersResponse = await fetch('/api/players/draftable?week=1');
      const playersData = await playersResponse.json();
      
      // Test draft status API
      const draftResponse = await fetch('/api/draft/test-league/status');
      const draftData = await draftResponse.json();
      
      setData(prev => ({
        ...prev,
        apiPlayers: playersData.players?.length || 0,
        draftStatus: draftData.draftStatus || 'Unknown'
      }));
      
      setStatus('✅ API routes working!');
      
    } catch (err: any) {
      setError(`API Error: ${err.message}`);
    }
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Appwrite Integration Test</h1>
      
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <p className="text-lg">{status}</p>
        {error && (
          <p className="text-red-500 mt-2">Error: {error}</p>
        )}
      </div>
      
      {data && (
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
          <pre className="bg-black p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {collections.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Collections Status</h2>
          <ul className="space-y-2">
            {collections.map((col, idx) => (
              <li key={idx} className="font-mono">{col}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          onClick={testAppwriteConnection}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          Test Appwrite Connection
        </button>
        
        <button
          onClick={testApiRoute}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
        >
          Test API Routes
        </button>
      </div>
      
      <div className="mt-8 text-gray-400">
        <p>Database ID: {DATABASE_ID}</p>
        <p>Endpoint: {process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not configured'}</p>
        <p>Project ID: {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not configured'}</p>
      </div>
    </div>
  );
}