'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  leagueName: string;
  gameMode: 'CONFERENCE' | 'POWER4';
  selectedConference: string;
  scoringType: 'PPR' | 'STANDARD';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [showAnimation, setShowAnimation] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    leagueName: '',
    gameMode: 'CONFERENCE',
    selectedConference: 'big_ten',
    scoringType: 'PPR',
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
    
    // Auto-advance to next step when a value is selected
    if (name === 'leagueName' && value.length > 0) {
      setTimeout(() => {
        setCurrentStep(2);
        setShowAnimation(2);
      }, 500);
    }
  };

  const handleGameModeSelect = (mode: 'CONFERENCE' | 'POWER4') => {
    setFormData(prev => ({ ...prev, gameMode: mode }));
    setTimeout(() => {
      if (mode === 'CONFERENCE') {
        setCurrentStep(3);
        setShowAnimation(3);
      } else {
        setCurrentStep(4);
        setShowAnimation(4);
      }
    }, 300);
  };

  const handleConferenceSelect = (conference: string) => {
    setFormData(prev => ({ ...prev, selectedConference: conference }));
    setTimeout(() => {
      setCurrentStep(4);
      setShowAnimation(4);
    }, 300);
  };

  const handleScoringTypeSelect = (type: 'PPR' | 'STANDARD') => {
    setFormData(prev => ({ ...prev, scoringType: type }));
    setTimeout(() => {
      setCurrentStep(5);
      setShowAnimation(5);
    }, 300);
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
    <div className="min-h-screen bg-gradient-to-br from-[#8B4513] via-[#D2B48C] to-[#A0522D] text-[#3A1220]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#3A1220] to-[#5C1F30] bg-clip-text text-transparent">
            🏈 Create Your League
          </h1>
          <p className="text-xl text-[#5C1F30]">
            Set up your college football fantasy league with unique eligibility rules
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-white' 
                    : 'bg-[#3A1220]/20 text-[#5C1F30]'
                }`}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`w-full h-1 mx-2 transition-all duration-500 ${
                    currentStep > step ? 'bg-gradient-to-r from-[#DAA520] to-[#B8860B]' : 'bg-[#3A1220]/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-[#5C1F30]">
            Step {currentStep} of 5
          </div>
        </div>

        <div className="bg-[#F5F5DC]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#3A1220]/20 min-h-[500px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: League Name */}
            <div className={`transition-all duration-500 ${
              currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <label htmlFor="leagueName" className="block text-2xl font-bold mb-4 text-[#3A1220]">
                Step 1: Name Your League
              </label>
              <p className="text-[#5C1F30] mb-6">Choose a unique name that represents your league's identity</p>
              <input
                type="text"
                id="leagueName"
                name="leagueName"
                value={formData.leagueName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full px-6 py-4 border-2 border-[#D2B48C] rounded-xl focus:ring-4 focus:ring-[#DAA520] focus:border-[#DAA520] text-xl text-[#3A1220] placeholder-[#8B4513] bg-white transition-all"
                placeholder={isInputFocused ? "" : "Enter your league name..."}
                required
                style={{ color: '#3A1220' }}
              />
              {formData.leagueName && (
                <div className="mt-4 text-[#DAA520] flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Great choice!
                </div>
              )}
            </div>

            {/* Step 2: Game Mode Selection */}
            {currentStep >= 2 && formData.leagueName && (
              <div className={`transition-all duration-500 ${
                showAnimation >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className="block text-2xl font-bold mb-4 text-[#3A1220]">
                  Step 2: Choose Your Game Mode
                </label>
                <p className="text-[#5C1F30] mb-6">Select how player eligibility and roster construction will work</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Conference Mode */}
                  <div 
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                      formData.gameMode === 'CONFERENCE' 
                        ? 'border-[#DAA520] bg-[#DAA520]/20 ring-4 ring-[#DAA520]/30' 
                        : 'border-[#3A1220]/60 bg-[#3A1220]/5 hover:border-[#DAA520]/40'
                    }`}
                    onClick={() => handleGameModeSelect('CONFERENCE')}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 transition-all ${
                        formData.gameMode === 'CONFERENCE' ? 'border-[#DAA520] bg-[#DAA520]' : 'border-[#3A1220]/40'
                      }`}>
                        {formData.gameMode === 'CONFERENCE' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#3A1220]">Conference Mode</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[#3A1220]">
                        Players from one chosen conference. Always start-eligible.
                      </p>
                      <div className="bg-[#DAA520]/10 rounded-lg p-3">
                        <div className="text-sm text-[#DAA520]">
                          <div>• 1 QB • 1 RB • 2 WR • 1 TE • 1 K</div>
                          <div className="mt-1">• Simple scoring • No defense</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#5C1F30]">Perfect for beginners</div>
                    </div>
                  </div>

                  {/* Power-4 Mode */}
                  <div 
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                      formData.gameMode === 'POWER4' 
                        ? 'border-[#DAA520] bg-[#DAA520]/20 ring-4 ring-[#DAA520]/30' 
                        : 'border-[#3A1220]/60 bg-[#3A1220]/5 hover:border-[#DAA520]/40'
                    }`}
                    onClick={() => handleGameModeSelect('POWER4')}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 transition-all ${
                        formData.gameMode === 'POWER4' ? 'border-[#DAA520] bg-[#DAA520]' : 'border-[#3A1220]/40'
                      }`}>
                        {formData.gameMode === 'POWER4' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#3A1220]">Power-4 Mode</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[#3A1220]">
                        Players from all Power-4 conferences with strategic eligibility.
                      </p>
                      <div className="bg-[#DAA520]/10 rounded-lg p-3">
                        <div className="text-sm text-[#DAA520]">
                          <div>• 1 QB • 2 RB • 2 WR • 1 FLEX</div>
                          <div className="mt-1">• 1 TE • 1 K • 1 DEF</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#5C1F30]">Advanced strategy required</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Conference Selection (only for Conference Mode) */}
            {currentStep >= 3 && formData.gameMode === 'CONFERENCE' && (
              <div className={`transition-all duration-500 ${
                showAnimation >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className="block text-2xl font-bold mb-4 text-[#3A1220]">
                  Step 3: Select Your Conference
                </label>
                <p className="text-[#5C1F30] mb-6">Choose which conference your league will draft players from</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONFERENCES.map(conf => (
                    <div
                      key={conf.id}
                      onClick={() => handleConferenceSelect(conf.id)}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                        formData.selectedConference === conf.id
                          ? 'border-[#DAA520] bg-[#DAA520]/20 ring-4 ring-[#DAA520]/30'
                          : 'border-[#3A1220]/60 bg-[#3A1220]/5 hover:border-[#DAA520]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-[#3A1220]">{conf.name}</h3>
                        <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                          formData.selectedConference === conf.id ? 'border-[#DAA520] bg-[#DAA520]' : 'border-[#3A1220]/40'
                        }`}>
                          {formData.selectedConference === conf.id && (
                            <div className="w-3 h-3 bg-white rounded-full m-auto mt-0.5"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#3A1220]">{conf.teamCount} Teams</span>
                        <span className="text-sm text-[#5C1F30]">Established powerhouse</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Scoring Type Selection */}
            {currentStep >= 4 && (formData.gameMode === 'POWER4' || formData.selectedConference) && (
              <div className={`transition-all duration-500 ${
                showAnimation >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className="block text-2xl font-bold mb-4 text-[#3A1220]">
                  Step 4: Choose Scoring System
                </label>
                <p className="text-[#5C1F30] mb-6">Select how points are awarded for player actions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                      formData.scoringType === 'PPR' 
                        ? 'border-[#DAA520] bg-[#DAA520]/20 ring-4 ring-[#DAA520]/30' 
                        : 'border-[#3A1220]/60 bg-[#3A1220]/5 hover:border-[#DAA520]/40'
                    }`}
                    onClick={() => handleScoringTypeSelect('PPR')}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 transition-all ${
                        formData.scoringType === 'PPR' ? 'border-[#DAA520] bg-[#DAA520]' : 'border-[#3A1220]/40'
                      }`}>
                        {formData.scoringType === 'PPR' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#3A1220]">PPR</h3>
                    </div>
                    <p className="text-lg text-[#3A1220] mb-3">Points Per Reception</p>
                    <div className="bg-[#DAA520]/10 rounded-lg p-3">
                      <p className="text-sm text-[#DAA520]">
                        +1 point for each catch
                      </p>
                    </div>
                    <p className="text-xs text-[#5C1F30] mt-3">
                      Rewards high-volume pass catchers and adds strategy to WR/TE selections
                    </p>
                  </div>

                  <div 
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                      formData.scoringType === 'STANDARD' 
                        ? 'border-[#DAA520] bg-[#DAA520]/20 ring-4 ring-[#DAA520]/30' 
                        : 'border-[#3A1220]/60 bg-[#3A1220]/5 hover:border-[#DAA520]/40'
                    }`}
                    onClick={() => handleScoringTypeSelect('STANDARD')}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 transition-all ${
                        formData.scoringType === 'STANDARD' ? 'border-[#DAA520] bg-[#DAA520]' : 'border-[#3A1220]/40'
                      }`}>
                        {formData.scoringType === 'STANDARD' && (
                          <div className="w-3 h-3 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#3A1220]">Standard</h3>
                    </div>
                    <p className="text-lg text-[#3A1220] mb-3">Traditional Scoring</p>
                    <div className="bg-[#DAA520]/10 rounded-lg p-3">
                      <p className="text-sm text-[#DAA520]">
                        No reception points
                      </p>
                    </div>
                    <p className="text-xs text-[#5C1F30] mt-3">
                      Values touchdowns and big plays more, traditional fantasy format
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Final Settings */}
            {currentStep >= 5 && formData.scoringType && (
              <div className={`transition-all duration-500 ${
                showAnimation >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <label className="block text-2xl font-bold mb-4 text-[#3A1220]">
                  Step 5: Final Details
                </label>
                <p className="text-[#5C1F30] mb-6">Configure the last few settings for your league</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Max Teams */}
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label htmlFor="maxTeams" className="block text-lg font-semibold mb-3 text-[#3A1220]">
                      🏆 Max Teams
                    </label>
                    <select
                      id="maxTeams"
                      name="maxTeams"
                      value={formData.maxTeams}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[#D2B48C] rounded-lg focus:ring-4 focus:ring-[#DAA520] focus:border-[#DAA520] text-lg text-[#3A1220] bg-white"
                      required
                    >
                      {[4, 6, 8, 10, 12, 14, 16, 18, 20].map(num => (
                        <option key={num} value={num}>{num} teams</option>
                      ))}
                    </select>
                    <p className="text-xs text-[#5C1F30] mt-2">Recommended: 10-12 teams</p>
                  </div>

                  {/* Season Start Week */}
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label htmlFor="seasonStartWeek" className="block text-lg font-semibold mb-3 text-[#3A1220]">
                      📅 Start Week
                    </label>
                    <select
                      id="seasonStartWeek"
                      name="seasonStartWeek"
                      value={formData.seasonStartWeek}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[#D2B48C] rounded-lg focus:ring-4 focus:ring-[#DAA520] focus:border-[#DAA520] text-lg text-[#3A1220] bg-white"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(week => (
                        <option key={week} value={week}>Week {week}</option>
                      ))}
                    </select>
                    <p className="text-xs text-[#5C1F30] mt-2">When your season begins</p>
                  </div>

                  {/* Draft Date */}
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label htmlFor="draftDate" className="block text-lg font-semibold mb-3 text-[#3A1220]">
                      🎯 Draft Date
                    </label>
                    <input
                      type="datetime-local"
                      id="draftDate"
                      name="draftDate"
                      value={formData.draftDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[#D2B48C] rounded-lg focus:ring-4 focus:ring-[#DAA520] focus:border-[#DAA520] text-lg text-[#3A1220] bg-white"
                    />
                    <p className="text-xs text-[#5C1F30] mt-2">Optional - Set later if needed</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 bg-gradient-to-r from-[#DAA520]/20 to-[#B8860B]/20 rounded-xl p-6 border border-[#DAA520]/30">
                  <h3 className="text-lg font-bold text-[#3A1220] mb-4">League Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[#5C1F30]">Name:</span>
                      <div className="text-[#3A1220] font-semibold">{formData.leagueName}</div>
                    </div>
                    <div>
                      <span className="text-[#5C1F30]">Mode:</span>
                      <div className="text-[#3A1220] font-semibold">{formData.gameMode === 'CONFERENCE' ? 'Conference' : 'Power-4'}</div>
                    </div>
                    {formData.gameMode === 'CONFERENCE' && (
                      <div>
                        <span className="text-[#5C1F30]">Conference:</span>
                        <div className="text-[#3A1220] font-semibold">
                          {CONFERENCES.find(c => c.id === formData.selectedConference)?.name.split(' ')[0]}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-[#5C1F30]">Scoring:</span>
                      <div className="text-[#3A1220] font-semibold">{formData.scoringType}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button - Only show when all steps complete */}
            {currentStep >= 5 && formData.maxTeams && (
              <div className="text-center pt-6 animate-pulse">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-all transform shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating League...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span>Create League</span>
                      <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Quick Tips - Show at bottom */}
        <div className="mt-12 bg-gradient-to-r from-[#3A1220]/20 to-[#5C1F30]/20 backdrop-blur-sm rounded-xl p-6 border border-[#3A1220]/30">
          <h3 className="text-lg font-bold text-[#5C1F30] mb-3">💡 Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#5C1F30]">
            <div>
              <strong className="text-[#5C1F30]">Conference Mode:</strong> Best for beginners or fans of a specific conference
            </div>
            <div>
              <strong className="text-[#5C1F30]">Power-4 Mode:</strong> More strategic with eligibility rules and larger rosters
            </div>
            <div>
              <strong className="text-[#5C1F30]">PPR Scoring:</strong> Higher scores, more emphasis on pass-catching backs
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && createdLeague && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#F5F5DC]/10 backdrop-blur-sm rounded-2xl p-8 border border-[#3A1220]/20 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-[#3A1220] mb-2">League Created!</h2>
                <p className="text-[#5C1F30] mb-6">
                  Your league <strong className="text-[#3A1220]">{createdLeague.name}</strong> has been successfully created and is now live in the database.
                </p>
                
                <div className="bg-[#F5F5DC]/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#5C1F30]">Mode:</span>
                      <div className="text-[#3A1220] font-semibold">
                        {createdLeague.mode === 'CONFERENCE' ? 'Conference' : 'Power-4'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#5C1F30]">Teams:</span>
                      <div className="text-[#3A1220] font-semibold">{createdLeague.maxTeams}</div>
                    </div>
                    <div>
                      <span className="text-[#5C1F30]">Status:</span>
                      <div className="text-[#3A1220] font-semibold">{createdLeague.status}</div>
                    </div>
                    <div>
                      <span className="text-[#5C1F30]">League ID:</span>
                      <div className="text-[#3A1220] font-semibold text-xs">{createdLeague.id}</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[#5C1F30] mb-4">
                  Redirecting to your league portal in 3 seconds...
                </div>

                <button
                  onClick={() => router.push(`/league/${createdLeague.id}`)}
                  className="bg-gradient-to-r from-[#DAA520] to-[#B8860B] px-6 py-3 rounded-lg font-bold text-lg hover:scale-105 transition-transform"
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