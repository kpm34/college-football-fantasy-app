'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  useEffect(() => {
    // Simple Spline viewer loading
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';
    script.onload = () => {
      // Set loaded after a short delay to ensure Spline is ready
      setTimeout(() => setSplineLoaded(true), 1000);
    };
    document.head.appendChild(script);
  }, []);

  const handleConferenceClick = (conference: string) => {
    setSelectedConference(conference);
    console.log(`Selected conference: ${conference}`);
  };

  return (
    <main className="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white min-h-screen overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-slate-600/5 to-slate-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black"></div>
        
        {/* Spline 3D Scene Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ zIndex: 1 }}
          dangerouslySetInnerHTML={{
            __html: '<spline-viewer url="https://prod.spline.design/JlsVpBPjLj-iOBRj/scene.splinecode"></spline-viewer>'
          }}
        />
        
        {/* Loading Overlay - Hidden when Spline loads */}
        {!splineLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-50" style={{ zIndex: 1 }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4 p-8 glass-card rounded-xl">
                <h3 className="text-xl font-bold chrome-text">🏈 Loading 3D Scene</h3>
                <div className="w-16 h-16 border-4 border-slate-700 rounded-full animate-spin border-t-blue-500 mx-auto"></div>
                <p className="text-slate-400 text-sm">Preparing immersive experience...</p>
              </div>
          </div>
          </div>
        )}
        

        
        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-6xl mx-auto">
            <div className="space-y-8">
              {/* Main Title with Chrome Effect */}
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                  <span className="chrome-text block">COLLEGE FOOTBALL</span>
                  <span className="metallic-text block mt-2">FANTASY</span>
          </h1>
          
                {/* Chrome Shine Effect */}
                <div className="h-1 w-96 mx-auto chrome-shine rounded-full"></div>
              </div>
              
              {/* Description with Glass Cards */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl max-w-3xl mx-auto">
                  <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Play fantasy football with the Power 4 conferences.
                  </p>
                  <p className="text-lg md:text-xl chrome-text font-semibold">
            Only elite matchups count - AP Top 25 & conference games!
          </p>
                </div>
              </div>
          
              {/* Chrome Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button className="chrome-button text-slate-800 px-10 py-5 rounded-xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-lg">
              Start a League
            </button>
                <button className="glass-card text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/20 transition-all duration-300 border border-white/20">
              Join League
            </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 chrome-text">Why Play With Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl hover:bg-white/15 transition-all duration-300 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform chrome-text">🏈</div>
              <h3 className="text-2xl font-bold mb-4 metallic-text">Power 4 Only</h3>
              <p className="text-slate-300">SEC, ACC, Big 12, and Big Ten - only the best conferences</p>
            </div>
            <div className="glass-card p-8 rounded-2xl hover:bg-white/15 transition-all duration-300 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform chrome-text">🏆</div>
              <h3 className="text-2xl font-bold mb-4 metallic-text">Elite Matchups</h3>
              <p className="text-slate-300">Start players only in AP Top-25 or conference games</p>
            </div>
            <div className="glass-card p-8 rounded-2xl hover:bg-white/15 transition-all duration-300 group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform chrome-text">📊</div>
              <h3 className="text-2xl font-bold mb-4 metallic-text">Live Scoring</h3>
              <p className="text-slate-300">Real-time updates powered by ESPN data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 relative bg-black/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-8 chrome-text">This Week's Games</h2>
          <div className="glass-card p-8 rounded-2xl mb-12 max-w-4xl mx-auto">
            <p className="text-center text-slate-300 text-lg">
              Games with chrome borders are eligible for fantasy scoring - AP Top 25 matchups or conference games only!
            </p>
          </div>
          
          <div className="mb-8" id="games-container">
            {/* Games will be loaded here */}
            <div className="text-center text-slate-400">Loading games...</div>
          </div>
          
          <div className="text-center">
            <button className="chrome-button text-slate-800 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300">
              View All Games
            </button>
          </div>
        </div>
      </section>

      {/* Conference Showcase */}
      <section className="py-20 px-4 relative bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 chrome-text">Featured Conferences</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* SEC */}
            <div 
              className={`conference-card glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group h-64 relative overflow-hidden ${
                selectedConference === 'SEC' ? 'ring-4 ring-blue-400 bg-white/25' : ''
              }`}
              onClick={() => handleConferenceClick('SEC')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-800/20"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-center text-white mb-6">SEC</h3>
                <div className="w-full h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 chrome-text">🏈</div>
                    <div className="text-white text-sm font-medium">SEC</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Big Ten */}
            <div 
              className={`conference-card glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group h-64 relative overflow-hidden ${
                selectedConference === 'Big Ten' ? 'ring-4 ring-blue-400 bg-white/25' : ''
              }`}
              onClick={() => handleConferenceClick('Big Ten')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-center text-white mb-6">Big Ten</h3>
                <div className="w-full h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 chrome-text">🏈</div>
                    <div className="text-white text-sm font-medium">Big Ten</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ACC */}
            <div 
              className={`conference-card glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group h-64 relative overflow-hidden ${
                selectedConference === 'ACC' ? 'ring-4 ring-blue-400 bg-white/25' : ''
              }`}
              onClick={() => handleConferenceClick('ACC')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-orange-800/20"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-center text-white mb-6">ACC</h3>
                <div className="w-full h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 chrome-text">🏈</div>
                    <div className="text-white text-sm font-medium">ACC</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Big 12 */}
            <div 
              className={`conference-card glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300 cursor-pointer group h-64 relative overflow-hidden ${
                selectedConference === 'Big 12' ? 'ring-4 ring-blue-400 bg-white/25' : ''
              }`}
              onClick={() => handleConferenceClick('Big 12')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-purple-800/20"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl font-bold text-center text-white mb-6">Big 12</h3>
                <div className="w-full h-32 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2 chrome-text">🏈</div>
                    <div className="text-white text-sm font-medium">Big 12</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .chrome-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .metallic-text {
          background: linear-gradient(145deg, #e6e6e6, #ffffff, #e6e6e6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
        }
        
        .chrome-button {
          background: linear-gradient(145deg, #e6e6e6, #ffffff, #e6e6e6);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .chrome-button:hover {
          background: linear-gradient(145deg, #ffffff, #e6e6e6, #ffffff);
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        

        
        @keyframes chrome-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .chrome-shine {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: chrome-shine 3s infinite;
        }
        

      `}</style>
    </main>
  );
}