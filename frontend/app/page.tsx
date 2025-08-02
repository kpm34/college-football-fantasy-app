'use client';

export default function Home() {
  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
          🏈 College Football Fantasy
        </h1>
        <p className="text-xl text-slate-300 mb-8 drop-shadow-lg">Power 4 Conferences Only</p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.href='https://college-football-fantasy-app.vercel.app/league/create'}
            className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg backdrop-blur-sm"
          >
            Start a League
          </button>
          <br />
          <button
            onClick={() => window.location.href='https://college-football-fantasy-app.vercel.app/league/join'}
            className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors border border-white/20 shadow-lg"
          >
            Join League
          </button>
        </div>
      </div>
    </main>
  );
}