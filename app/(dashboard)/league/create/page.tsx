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
  isPrivate?: boolean;
  password?: string;
  rosterRB?: number;
  rosterWR?: number;
  benchSize?: number;
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
    gameMode: '' as any, // No default selection
    selectedConference: '',
    scoringType: '' as any, // No default selection
    maxTeams: 12,
    seasonStartWeek: 1,
    draftDate: '',
    isPrivate: false,
    password: '',
    rosterRB: 2,
    rosterWR: 2,
    benchSize: 5
  });
  const palette = {
    maroon: '#3A1220',
    orange: '#E89A5C',
    periwinkle: '#8091BB',
    tan: '#D9BBA4',
    gold: '#DAA520',
    bronze: '#B8860B',
  } as const;

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
        setFormData(prev => ({ ...prev, rosterRB: Math.min(prev.rosterRB || 2, 2), rosterWR: Math.min(prev.rosterWR || 2, 5) }));
      } else {
        setCurrentStep(4);
        setShowAnimation(4);
        setFormData(prev => ({ ...prev, rosterRB: prev.rosterRB || 2, rosterWR: Math.min(prev.rosterWR || 4, 6) }));
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

  const canProceed = (step: number) => {
    if (step === 1) return !!formData.leagueName?.trim();
    if (step === 2) return formData.gameMode === 'POWER4' || formData.gameMode === 'CONFERENCE';
    if (step === 3) return formData.gameMode === 'POWER4' || !!formData.selectedConference;
    if (step === 4) return !!formData.scoringType;
    if (step === 5) return !!formData.maxTeams;
    return true;
  };

  const goNext = () => {
    if (currentStep < 5 && canProceed(currentStep)) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setShowAnimation(next);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setShowAnimation(prev);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🏈 Creating league with data:', formData);
    
    try {
      setIsCreating(true);
      
      // Validate required fields
      const trimmedName = formData.leagueName?.trim() || '';
      if (trimmedName.length < 3) {
        alert('Please enter a league name with at least 3 characters');
        return;
      }
      
      if (!formData.gameMode) {
        alert('Please select a game mode');
        return;
      }
      
      if (formData.gameMode === 'CONFERENCE' && !formData.selectedConference) {
        alert('Please select a conference');
        return;
      }
      
      if (!formData.scoringType) {
        alert('Please select a scoring type');
        return;
      }
      
      const requestData = {
        ...formData,
        leagueName: trimmedName,
        maxTeams: Number(formData.maxTeams),
        draftDate: formData.draftDate || null,
        commissionerId: 'auto', // server resolves user from session
        season: 2025
      };
      
      console.log('📡 Sending request:', requestData);
      
      const response = await fetch('/api/leagues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        alert(`Failed to create league: ${response.status} - ${errorText}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Success result:', result);
      
      if (result.success) {
        setCreatedLeague(result.league);
        setShowSuccess(true);
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push(`/league/${result.league.$id || result.league.id}`);
        }, 3000);
      } else {
        console.error('❌ Server error:', result.error);
        alert(`Error creating league: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert(`Network error creating league: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="min-h-screen text-[#3A1220]"
      style={{
        background:
          `linear-gradient(135deg, ${palette.maroon} 0%, ${palette.orange} 35%, ${palette.periwinkle} 65%, ${palette.tan} 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent drop-shadow">
            Create Your League
          </h1>
          <p className="text-xl" style={{ color: '#2D0E17' }}>
            Set up your college football fantasy league with unique eligibility rules
          </p>
        </div>

        {/* Progress Bar (tech-styled) */}
        <div className="mb-10">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-white/10 rounded" />
            <div className="grid grid-cols-5 gap-6 relative">
              {[1,2,3,4,5].map((step) => {
                const isDone = currentStep > step;
                const isActive = currentStep === step;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold tracking-widest transition-all duration-300 ${
                        isDone ? 'bg-gradient-to-r from-[#DAA520] to-[#B8860B] text-white shadow-lg shadow-[#DAA520]/20'
                        : isActive ? 'bg-white/90 text-[#3A1220] shadow-md' 
                        : 'bg-white/20 text-white/70'
                      }`}>
                        {isDone ? '✓' : step}
                      </div>
                      {isActive && (
                        <div className="absolute -inset-1 rounded-xl border border-[#DAA520]/40 animate-pulse" />
                      )}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-wider text-white/70">
                      {['Name','Mode','Conference','Scoring','Details'][step-1]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center mt-3 text-sm text-white/70">Step {currentStep} of 5</div>
        </div>

        <div
          className="backdrop-blur-sm rounded-2xl p-8 min-h-[500px]"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${palette.tan}33`,
            boxShadow: `0 10px 30px ${palette.maroon}33`,
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: League Name */}
            <div className={`transition-all duration-500 ${
              currentStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <label htmlFor="leagueName" className="block text-2xl font-bold mb-4 text-[#3A1220]">
                Step 1: Name Your League
              </label>
              <p className="text-[#2D0E17] mb-6 font-medium">Choose a unique name that represents your league's identity</p>
              <input
                type="text"
                id="leagueName"
                name="leagueName"
                value={formData.leagueName}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full px-6 py-4 rounded-xl focus:ring-4 text-xl transition-all"
                style={{
                  border: `2px solid ${palette.tan}`,
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                  background: '#fff',
                  color: palette.maroon,
                }}
                placeholder={isInputFocused ? "" : "Enter your league name..."}
                required
              />
              {formData.leagueName && (
                <div className="mt-4 text-[#3A1220] font-semibold flex items-center">
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
                <p className="text-[#2D0E17] mb-6 font-medium">Select how player eligibility and roster construction will work</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Conference Mode */}
                  <div 
                    className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105`}
                    onClick={() => handleGameModeSelect('CONFERENCE')}
                    style={{
                      border: `2px solid ${formData.gameMode === 'CONFERENCE' ? palette.gold : `${palette.maroon}99`}`,
                      background: formData.gameMode === 'CONFERENCE' ? `${palette.gold}22` : `${palette.maroon}0D`,
                      boxShadow: formData.gameMode === 'CONFERENCE' ? `0 0 0 4px ${palette.gold}33` : 'none',
                    }}
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
                        <div className="text-sm text-[#3A1220] font-medium">
                          <div>• 1 QB • 1 RB • 2 WR • 1 TE • 1 K</div>
                          <div className="mt-1">• Simple scoring • No defense</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#2D0E17] font-medium">Perfect for beginners</div>
                    </div>
                  </div>

                  {/* Power-4 Mode */}
                  <div 
                    className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105`}
                    onClick={() => handleGameModeSelect('POWER4')}
                    style={{
                      border: `2px solid ${formData.gameMode === 'POWER4' ? palette.gold : `${palette.maroon}99`}`,
                      background: formData.gameMode === 'POWER4' ? `${palette.gold}22` : `${palette.maroon}0D`,
                      boxShadow: formData.gameMode === 'POWER4' ? `0 0 0 4px ${palette.gold}33` : 'none',
                    }}
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
                        <div className="text-sm text-[#3A1220] font-medium">
                          <div>• 1 QB • 2 RB • 2 WR • 1 FLEX</div>
                          <div className="mt-1">• 1 TE • 1 K • 1 DEF</div>
                        </div>
                      </div>
                      <div className="text-xs text-[#2D0E17] font-medium">Advanced strategy required</div>
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
                <p className="text-[#2D0E17] mb-6 font-medium">Choose which conference your league will draft players from</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CONFERENCES.map(conf => (
                    <div
                      key={conf.id}
                      onClick={() => handleConferenceSelect(conf.id)}
                      className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105`}
                      style={{
                        border: `2px solid ${formData.selectedConference === conf.id ? palette.periwinkle : `${palette.maroon}99`}`,
                        background: formData.selectedConference === conf.id ? `${palette.periwinkle}22` : `${palette.maroon}0D`,
                        boxShadow: formData.selectedConference === conf.id ? `0 0 0 4px ${palette.periwinkle}33` : 'none',
                      }}
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
                        <span className="text-sm text-[#2D0E17] font-medium">Established powerhouse</span>
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
                <p className="text-[#2D0E17] mb-6 font-medium">Select how points are awarded for player actions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105`}
                    style={{
                      border: `2px solid ${formData.scoringType === 'PPR' ? palette.gold : `${palette.maroon}99`}`,
                      background: formData.scoringType === 'PPR' ? `${palette.gold}22` : `${palette.maroon}0D`,
                      boxShadow: formData.scoringType === 'PPR' ? `0 0 0 4px ${palette.gold}33` : 'none',
                    }}
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
                      <p className="text-sm text-[#3A1220] font-medium">
                        +1 point for each catch
                      </p>
                    </div>
                    <p className="text-xs text-[#2D0E17] font-medium mt-3">
                      Rewards high-volume pass catchers and adds strategy to WR/TE selections
                    </p>
                  </div>

                  <div 
                    className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105`}
                    style={{
                      border: `2px solid ${formData.scoringType === 'STANDARD' ? palette.gold : `${palette.maroon}99`}`,
                      background: formData.scoringType === 'STANDARD' ? `${palette.gold}22` : `${palette.maroon}0D`,
                      boxShadow: formData.scoringType === 'STANDARD' ? `0 0 0 4px ${palette.gold}33` : 'none',
                    }}
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
                      <p className="text-sm text-[#3A1220] font-medium">
                        No reception points
                      </p>
                    </div>
                    <p className="text-xs text-[#2D0E17] font-medium mt-3">
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
                <p className="text-[#2D0E17] mb-6 font-medium">Configure the last few settings for your league</p>
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
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                      required
                    >
                      {[4, 6, 8, 10, 12, 14, 16, 18, 20].map(num => (
                        <option key={num} value={num}>{num} teams</option>
                      ))}
                    </select>
                    <p className="text-xs text-[#2D0E17] font-medium mt-2">Recommended: 10-12 teams</p>
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
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(week => (
                        <option key={week} value={week}>Week {week}</option>
                      ))}
                    </select>
                    <p className="text-xs text-[#2D0E17] font-medium mt-2">When your season begins</p>
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
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                    />
                    <p className="text-xs text-[#2D0E17] font-medium mt-2">Optional - Set later if needed</p>
                  </div>
                </div>

                {/* Privacy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label className="block text-lg font-semibold mb-3" style={{ color: palette.maroon }}>
                      🔒 Private League
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="isPrivate"
                        type="checkbox"
                        checked={!!formData.isPrivate}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                        className="h-5 w-5"
                      />
                      <label htmlFor="isPrivate" className="text-sm text-[#2D0E17] font-medium">
                        Require an invite code to join
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label htmlFor="password" className="block text-lg font-semibold mb-3" style={{ color: palette.maroon }}>
                      🧷 Optional Password
                    </label>
                    <input
                      type="text"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                      placeholder="Set a simple password for entry (optional)"
                    />
                    <p className="text-xs mt-2 text-[#2D0E17] font-medium">Useful for friends-only leagues.</p>
                  </div>
                </div>

                {/* Roster Settings */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label className="block text-lg font-semibold mb-3" style={{ color: palette.maroon }}>
                      🏃‍♂️ RB Slots
                    </label>
                    <input
                      type="number"
                      name="rosterRB"
                      min={1}
                      max={formData.gameMode === 'CONFERENCE' ? 2 : 6}
                      value={formData.rosterRB}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                    />
                    <p className="text-xs mt-2 text-[#2D0E17] font-medium">Max 2 in Conference mode.</p>
                  </div>
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label className="block text-lg font-semibold mb-3" style={{ color: palette.maroon }}>
                      🟦 WR Slots
                    </label>
                    <input
                      type="number"
                      name="rosterWR"
                      min={2}
                      max={formData.gameMode === 'CONFERENCE' ? 5 : 6}
                      value={formData.rosterWR}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                    />
                    <p className="text-xs mt-2 text-[#2D0E17] font-medium">Max {formData.gameMode === 'CONFERENCE' ? 5 : 6} in {formData.gameMode === 'CONFERENCE' ? 'Conference' : 'Power-4'} mode.</p>
                  </div>
                  <div className="bg-[#F5F5DC]/10 rounded-xl p-6 border border-[#3A1220]/20">
                    <label className="block text-lg font-semibold mb-3" style={{ color: palette.maroon }}>
                      🛋️ Bench Size
                    </label>
                    <input
                      type="number"
                      name="benchSize"
                      min={3}
                      max={12}
                      value={formData.benchSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg focus:ring-4 text-lg"
                      style={{ border: `2px solid ${palette.tan}`, background: '#fff', color: palette.maroon }}
                    />
                    <p className="text-xs mt-2 text-[#2D0E17] font-medium">Configurable bench capacity.</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 rounded-xl p-6" style={{ background: `${palette.tan}22`, border: `1px solid ${palette.tan}66` }}>
                  <h3 className="text-lg font-bold text-[#3A1220] mb-4">League Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[#2D0E17] font-medium">Name:</span>
                      <div className="text-[#3A1220] font-semibold">{formData.leagueName}</div>
                    </div>
                    <div>
                      <span className="text-[#2D0E17] font-medium">Mode:</span>
                      <div className="text-[#3A1220] font-semibold">{formData.gameMode === 'CONFERENCE' ? 'Conference' : 'Power-4'}</div>
                    </div>
                    {formData.gameMode === 'CONFERENCE' && (
                      <div>
                        <span className="text-[#2D0E17] font-medium">Conference:</span>
                        <div className="text-[#3A1220] font-semibold">
                          {CONFERENCES.find(c => c.id === formData.selectedConference)?.name.split(' ')[0]}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-[#2D0E17] font-medium">Scoring:</span>
                      <div className="text-[#3A1220] font-semibold">{formData.scoringType}</div>
                    </div>
                    <div>
                      <span className="text-[#2D0E17] font-medium">Roster:</span>
                      <div className="text-[#3A1220] font-semibold">RB {formData.rosterRB} • WR {formData.rosterWR} • Bench {formData.benchSize}</div>
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
                  className="px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-all transform shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(90deg, ${palette.gold}, ${palette.bronze})`,
                    color: '#fff',
                    boxShadow: `0 10px 20px ${palette.maroon}33`,
                  }}
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

        {/* Sticky Step Controls (mobile-friendly) */}
        <div className="fixed bottom-4 left-0 right-0 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
            <button
              onClick={goBack}
              disabled={currentStep === 1}
              className="py-3 rounded-xl font-semibold disabled:opacity-40"
              style={{ background: `${palette.periwinkle}22`, border: `1px solid ${palette.periwinkle}66`, color: palette.periwinkle }}
            >
              Back
            </button>
            <button
              onClick={currentStep < 5 ? goNext : undefined}
              disabled={!canProceed(currentStep)}
              className="py-3 rounded-xl font-semibold disabled:opacity-40"
              style={{ background: `linear-gradient(90deg, ${palette.gold}, ${palette.bronze})`, color: '#fff' }}
            >
              {currentStep < 5 ? 'Continue' : 'Review'}
            </button>
          </div>
        </div>

        {/* Quick Tips - subtler and smaller */}
        <div className="mt-16">
          <div className="max-w-4xl mx-auto bg-white/6 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
              <span>💡</span>
              <span className="font-semibold">Quick Tips</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed text-white/60">
              <div><span className="font-semibold">Conference Mode:</span> Best for beginners or fans of a specific conference</div>
              <div><span className="font-semibold">Power-4 Mode:</span> More strategic with eligibility rules and larger rosters</div>
              <div><span className="font-semibold">PPR Scoring:</span> Higher scores; more emphasis on pass-catching backs</div>
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
                <p className="text-[#2D0E17] mb-6">
                  Your league <strong className="text-[#3A1220]">{createdLeague.name}</strong> has been successfully created and is now live in the database.
                </p>
                
                <div className="bg-[#F5F5DC]/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#2D0E17] font-medium">Mode:</span>
                      <div className="text-[#3A1220] font-semibold">
                        {(createdLeague.mode || createdLeague.gameMode) === 'CONFERENCE' ? 'Conference' : 'Power-4'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#2D0E17] font-medium">Teams:</span>
                      <div className="text-[#3A1220] font-semibold">{createdLeague.maxTeams}</div>
                    </div>
                    <div>
                      <span className="text-[#2D0E17] font-medium">Status:</span>
                      <div className="text-[#3A1220] font-semibold">{createdLeague.status}</div>
                    </div>
                    <div>
                      <span className="text-[#2D0E17] font-medium">League ID:</span>
                      <div className="text-[#3A1220] font-semibold text-xs">{createdLeague.$id || createdLeague.id}</div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[#2D0E17] font-medium mb-4">
                  Redirecting to your league portal in 3 seconds...
                </div>

                <button
                  onClick={() => router.push(`/league/${createdLeague.$id || createdLeague.id}`)}
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