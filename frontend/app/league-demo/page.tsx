'use client';

// Temporarily disabled LeaguePortal for deployment
// import LeaguePortal from '@/components/LeaguePortal';

export default function LeagueDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">🏈 League Demo</h1>
        <p className="text-xl text-gray-400 mb-8">
          League portal temporarily disabled for deployment
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-gray-300">
            The full league portal will be available once deployment is complete.
          </p>
        </div>
      </div>
    </div>
  );
} 