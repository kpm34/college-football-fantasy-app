'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  leagueName: string;
  gameMode: 'CONFERENCE' | 'POWER4';
  selectedConference: string;
  maxTeams: number;
  seasonStartWeek: number;
  draftDate: string;
}

const CONFERENCES = [
  { id: 'big_ten', name: 'Big Ten Conference', teamCount: 18 },
  { id: 'sec', name: 'SEC Conference', teamCount: 16 },
  { id: 'big_12', name: 'Big 12 Conference', teamCount: 16 },
  { id: 'acc', name: 'ACC Conference', teamCount: 17 }
];

export default function CreateLeaguePage() {
  const router = useRouter();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    leagueName: '',
    gameMode: 'CONFERENCE',
    selectedConference: 'big_ten',
    maxTeams: 12,
    seasonStartWeek: 1,
    draftDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdLeague, setCreatedLeague] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      const response = await fetch('/api/leagues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          commissionerId: 'demo-user-123' // TODO: Get from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create league');
      }

      const result = await response.json();
      
      if (result.success) {
        setCreatedLeague(result.league);
        setShowSuccess(true);
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push(`/league/${result.league.id}`);
        }, 3000);
      } else {
        console.error('Error creating league:', result.error);
      }
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            🏈 Create Your League
          </h1>
          <p className="text-xl text-gray-400">
            Set up your college football fantasy league with unique eligibility rules
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* League Name */}
            <div>
              <label htmlFor="leagueName" className="block text-lg font-semibold mb-3 text-white">
                League Name
              </label>
              <input
                type="text"
                id="leagueName"
                name="leagueName"
                value={formData.leagueName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black placeholder-gray-500 bg-white"
                placeholder={isInputFocused ? "" : "Enter your league name..."}
                required
                style={{ color: '#000000' }}
              />
            </div>

            {/* Game Mode Selection */}
            <div>
              <label className="block text-lg font-semibold mb-3 text-white">
                Game Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Conference Mode */}
                <div 
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.gameMode === 'CONFERENCE' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 bg-white/5 hover:border-gray-500'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, gameMode: 'CONFERENCE' }))}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      formData.gameMode === 'CONFERENCE' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                    }`}>
                      {formData.gameMode === 'CONFERENCE' && (
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">Conference Mode</h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Players from one chosen conference. Always start-eligible.
                  </p>
                  <div className="text-sm text-gray-500">
                    <div>• 1 QB • 1 RB • 2 WR • 1 TE • 1 K</div>
                    <div>• Simple scoring • No defense</div>
                  </div>
                </div>

                {/* Power-4 Mode */}
                <div 
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.gameMode === 'POWER4' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-600 bg-white/5 hover:border-gray-500'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, gameMode: 'POWER4' }))}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      formData.gameMode === 'POWER4' ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                    }`}>
                      {formData.gameMode === 'POWER4' && (
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">Power-4 Mode</h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Players from all Power-4 conferences. Start-eligible only in conference games or vs AP Top-25.
                  </p>
                  <div className="text-sm text-gray-500">
                    <div>• 1 QB • 2 RB • 2 WR • 1 FLEX • 1 TE • 1 K • 1 DEF</div>
                    <div>• Advanced scoring • Defense included</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conference Selection (only for Conference Mode) */}
            {formData.gameMode === 'CONFERENCE' && (
              <div>
                <label htmlFor="selectedConference" className="block text-lg font-semibold mb-3 text-white">
                  Select Conference
                </label>
                <select
                  id="selectedConference"
                  name="selectedConference"
                  value={formData.selectedConference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black bg-white"
                  required
                >
                  {CONFERENCES.map(conf => (
                    <option key={conf.id} value={conf.id}>
                      {conf.name} ({conf.teamCount} teams)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* League Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Max Teams */}
              <div>
                <label htmlFor="maxTeams" className="block text-lg font-semibold mb-3 text-white">
                  Max Teams
                </label>
                <select
                  id="maxTeams"
                  name="maxTeams"
                  value={formData.maxTeams}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black bg-white"
                  required
                >
                  {[4, 6, 8, 10, 12, 14, 16, 18, 20].map(num => (
                    <option key={num} value={num}>{num} teams</option>
                  ))}
                </select>
              </div>

              {/* Season Start Week */}
              <div>
                <label htmlFor="seasonStartWeek" className="block text-lg font-semibold mb-3 text-white">
                  Season Start Week
                </label>
                <select
                  id="seasonStartWeek"
                  name="seasonStartWeek"
                  value={formData.seasonStartWeek}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black bg-white"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(week => (
                    <option key={week} value={week}>Week {week}</option>
                  ))}
                </select>
              </div>

              {/* Draft Date */}
              <div>
                <label htmlFor="draftDate" className="block text-lg font-semibold mb-3 text-white">
                  Draft Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="draftDate"
                  name="draftDate"
                  value={formData.draftDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg text-black bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-green-500 to-blue-500 px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating League...
                  </div>
                ) : (
                  'Create League'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Game Mode Explanation */}
        <div className="mt-12 bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-8 border border-green-500/30">
          <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">🎯 Game Mode Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div>
              <h4 className="text-xl font-semibold text-white mb-3">Conference Mode</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Players from one chosen conference only</li>
                <li>• Always start-eligible regardless of opponent</li>
                <li>• Simpler lineup: 1 QB, 1 RB, 2 WR, 1 TE, 1 K</li>
                <li>• Perfect for beginners or single-conference fans</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-white mb-3">Power-4 Mode</h4>
              <ul className="space-y-2 text-gray-300">
                <li>• Players from all Power-4 conferences (SEC, ACC, Big Ten, Big 12)</li>
                <li>• Start-eligible only in conference games OR vs AP Top-25 teams</li>
                <li>• Advanced lineup: 1 QB, 2 RB, 2 WR, 1 FLEX, 1 TE, 1 K, 1 DEF</li>
                <li>• Strategic depth with defense and flex positions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && createdLeague && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-2">League Created!</h2>
                <p className="text-gray-300 mb-6">
                  Your league <strong className="text-white">{createdLeague.name}</strong> has been successfully created and is now live in the database.
                </p>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Mode:</span>
                      <div className="text-white font-semibold">
                        {createdLeague.mode === 'CONFERENCE' ? 'Conference' : 'Power-4'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Teams:</span>
                      <div className="text-white font-semibold">{createdLeague.maxTeams}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <div className="text-white font-semibold">{createdLeague.status}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">League ID:</span>
                      <div className="text-white font-semibold text-xs">{createdLeague.id}</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Redirecting to your league portal in 3 seconds...
                </div>

                <button
                  onClick={() => router.push(`/league/${createdLeague.id}`)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
                >
                  Go to League Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 