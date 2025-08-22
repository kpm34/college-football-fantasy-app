'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@hooks/useAuth';
import Link from 'next/link';
import { ChevronLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { leagueColors } from '@/lib/theme/colors';
import { InviteModal } from '@/components/features/leagues/InviteModal';

interface ScoringRules {
  // Passing
  passingYards: number;
  passingTouchdowns: number;
  interceptions: number;
  
  // Rushing
  rushingYards: number;
  rushingTouchdowns: number;
  
  // Receiving
  receptions: number;
  receivingYards: number;
  receivingTouchdowns: number;
  
  // Kicking
  // Back-compat generic fields
  fieldGoalMade: number;
  fieldGoalMissed: number;
  extraPointMade: number;
  extraPointMissed: number;

  // Distance-based field goals (new)
  fieldGoal_0_39: number;
  fieldGoal_40_49: number;
  fieldGoal_50_plus: number;
}

interface League {
  $id: string;
  name: string;
  maxTeams: number;
  isPublic: boolean;
  draftDate?: string;
  pickTimeSeconds?: number;
  scoringRules?: string;
  commissionerId: string;
  commissioner?: string;
  gameMode?: string;
  selectedConference?: string;
  seasonStartWeek?: number;
  playoffTeams?: number;
  playoffStartWeek?: number;
  waiverType?: string;
  waiverBudget?: number;
  primaryColor?: string;
  secondaryColor?: string;
  leagueTrophyName?: string;
}

interface Member {
  $id: string;
  name?: string;
  teamName?: string;
  owner?: string;
  email?: string;
  wins?: number;
  losses?: number;
}

export default function CommissionerSettings({ params }: { params: { leagueId: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [league, setLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [savedMessage, setSavedMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form states
  const [leagueName, setLeagueName] = useState('');
  const [maxTeams, setMaxTeams] = useState(12);
  const [isPublic, setIsPublic] = useState(true);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [pickTimeSeconds, setPickTimeSeconds] = useState(90);
  const [gameMode, setGameMode] = useState('power4');
  const [selectedConference, setSelectedConference] = useState('');
  const [seasonStartWeek, setSeasonStartWeek] = useState(1);
  const [playoffTeams, setPlayoffTeams] = useState(4);
  const [playoffStartWeek, setPlayoffStartWeek] = useState(13);
  const [waiverType, setWaiverType] = useState<'FAAB' | 'Rolling'>('FAAB');
  const [waiverBudget, setWaiverBudget] = useState<number>(100);
  const [primaryColor, setPrimaryColor] = useState('#8C1818');
  const [secondaryColor, setSecondaryColor] = useState('#DAA520');
  const [leagueTrophyName, setLeagueTrophyName] = useState('Championship Trophy');
  // Draft order management
  const [orderMode, setOrderMode] = useState<'custom'|'random'>('custom');
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  
  // Scoring rules
  const [scoringRules, setScoringRules] = useState<ScoringRules>({
    passingYards: 0.04,
    passingTouchdowns: 4,
    interceptions: -2,
    rushingYards: 0.1,
    rushingTouchdowns: 6,
    receptions: 1,
    receivingYards: 0.1,
    receivingTouchdowns: 6,
    fieldGoalMade: 3,
    fieldGoalMissed: -1,
    extraPointMade: 1,
    extraPointMissed: -1,
    fieldGoal_0_39: 3,
    fieldGoal_40_49: 4,
    fieldGoal_50_plus: 5,
  });

  useEffect(() => {
    // Wait for auth to finish resolving before deciding
    if (authLoading) return;
    if (!user) {
      const next = encodeURIComponent(`/league/${params.leagueId}/commissioner`);
      router.replace(`/login?next=${next}`);
      return;
    }
    loadSettings();
  }, [authLoading, user, params.leagueId, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/leagues/${params.leagueId}/commissioner`);
      if (!response.ok) {
        if (response.status === 403) {
          router.push(`/league/${params.leagueId}`);
          return;
        }
        if (response.status === 401) {
          console.log('Authentication failed, redirecting to login');
          const next = encodeURIComponent(`/league/${params.leagueId}/commissioner`);
          router.replace(`/login?next=${next}`);
          return;
        }
        try {
          const err = await response.json();
          console.error('Commissioner settings load failed:', err);
        } catch {}
        throw new Error('Failed to load settings');
      }
      
      const data = await response.json();
      const league = data.league;
      
      setLeague({
        ...league,
        commissionerId: league.commissioner || (league as any).commissioner_id || league.commissionerId
      });
      setMembers(data.members || []);
      
      // Initialize form with league data
      setLeagueName(league.name || '');
      setMaxTeams(league.maxTeams || 12);
      setIsPublic(league.isPublic ?? true);
      setPickTimeSeconds(league.pickTimeSeconds || 90);
      setGameMode(league.gameMode || 'power4');
      setSelectedConference(league.selectedConference || '');
      setSeasonStartWeek(league.seasonStartWeek || 1);
      setPlayoffTeams(league.playoffTeams || 4);
      setPlayoffStartWeek(league.playoffStartWeek || 13);
      setWaiverType((league.waiverType as any) || 'FAAB');
      setWaiverBudget(typeof league.waiverBudget === 'number' ? league.waiverBudget : 100);
      setPrimaryColor(league.primaryColor || '#8C1818');
      setSecondaryColor(league.secondaryColor || '#DAA520');
      setLeagueTrophyName(league.leagueTrophyName || 'Championship Trophy');
      // Draft order
      try {
        const rawOrder = (league as any).draftOrder;
        if (rawOrder) {
          const parsed = Array.isArray(rawOrder) ? rawOrder : JSON.parse(rawOrder);
          if (Array.isArray(parsed)) setDraftOrder(parsed);
        } else if (league.scoringRules) {
          try {
            const parsedRules = JSON.parse(league.scoringRules);
            if (Array.isArray(parsedRules?.draftOrderOverride)) {
              setDraftOrder(parsedRules.draftOrderOverride);
            }
          } catch {}
        } else if (Array.isArray((league as any).members)) {
          setDraftOrder((league as any).members);
        }
      } catch {}
      setOrderMode(((league as any).orderMode as any) || 'custom');
      
      // Parse draft date/time
      if (league.draftDate) {
        const date = new Date(league.draftDate);
        setDraftDate(date.toISOString().split('T')[0]);
        setDraftTime(date.toTimeString().slice(0, 5));
      }
      
      // Parse scoring rules
      if (league.scoringRules) {
        try {
          const parsed = JSON.parse(league.scoringRules);
          setScoringRules(prev => {
            const merged = { ...prev, ...parsed } as ScoringRules;
            // Backward compatibility: if old generic FG is set but no distance fields provided,
            // use generic value for 0-39 and keep sensible defaults for longer distances.
            if (
              parsed.fieldGoalMade !== undefined &&
              parsed.fieldGoal_0_39 === undefined &&
              parsed.fieldGoal_40_49 === undefined &&
              parsed.fieldGoal_50_plus === undefined
            ) {
              merged.fieldGoal_0_39 = Number(parsed.fieldGoalMade) || prev.fieldGoal_0_39;
            }
            return merged;
          });
        } catch (e) {
          console.error('Failed to parse scoring rules:', e);
        }
      }
      
      console.log('Loaded commissioner settings:', league);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraftSettings = async () => {
    if (!draftDate || !draftTime) {
      alert('Please set both draft date and time');
      return;
    }
    
    const draftDateTime = new Date(`${draftDate}T${draftTime}`).toISOString();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/leagues/${params.leagueId}/commissioner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ draftDate: draftDateTime, pickTimeSeconds })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update draft settings');
      }
      
      console.log('Draft settings saved:', result);
      setSavedMessage('Draft settings saved!');
      setTimeout(() => setSavedMessage(''), 3000);
      setTimeout(() => loadSettings(), 1000);
    } catch (error: any) {
      console.error('Error saving draft settings:', error);
      alert(`Failed to save draft settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveScoringRules = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/leagues/${params.leagueId}/commissioner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scoringRules: JSON.stringify(scoringRules) })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save scoring rules');
      }
      
      console.log('Scoring rules saved:', result);
      setSavedMessage('Scoring rules saved!');
      setTimeout(() => setSavedMessage(''), 3000);
      setTimeout(() => loadSettings(), 1000);
    } catch (error: any) {
      console.error('Error saving scoring rules:', error);
      alert(`Failed to save scoring rules: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveAllSettings = async () => {
    setSaving(true);
    
    try {
      const updates: any = {
        name: leagueName,
        maxTeams,
        isPublic,
        // gameMode and selectedConference are immutable after creation
        seasonStartWeek,
        playoffTeams,
        playoffStartWeek,
        waiverType,
        waiverBudget,
        // primaryColor, secondaryColor, leagueTrophyName not in DB yet
        scoringRules: JSON.stringify(scoringRules)
      };
      
      if (draftDate && draftTime) {
        updates.draftDate = new Date(`${draftDate}T${draftTime}`).toISOString();
      }
      updates.pickTimeSeconds = pickTimeSeconds;
      // Persist draft order inside scoringRules payload to avoid schema drift
      const mergedRules = { ...scoringRules, draftOrderOverride: draftOrder.filter(Boolean) } as any;
      updates.scoringRules = JSON.stringify(mergedRules);
      
      console.log('Saving settings with updates:', updates);
      
      const response = await fetch(`/api/leagues/${params.leagueId}/commissioner`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify(updates)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Save failed:', result);
        throw new Error(result.error || 'Failed to save settings');
      }
      
      console.log('Settings saved successfully:', result);
      setSavedMessage('All settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
      
      // Reload settings to confirm they were saved
      setTimeout(() => loadSettings(), 1000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading commissioner settings...</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Unable to load commissioner settings</div>
          <div className="text-sm text-gray-500">
            This could be due to authentication issues or insufficient permissions.
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push(`/league/${params.leagueId}`)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to League
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Commissioner page palette (provided)
  const palette = {
    brown: '#6b321c',
    steel: '#7399ad',
    gold: '#c5aa12',
    charcoal: '#332c1f'
  } as const;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${palette.brown} 0%, ${palette.steel} 38%, ${palette.gold} 72%, ${palette.charcoal} 100%)` }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/league/${params.leagueId}`}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 transition-colors backdrop-blur-sm"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to League
          </Link>
          
          <h1 className="text-4xl font-bold" style={{ color: leagueColors.text.primary }}>
            Commissioner Settings
          </h1>
          <p className="mt-2" style={{ color: leagueColors.text.secondary }}>
            Manage your league settings and rules
          </p>
        </div>

        {/* Saved Message */}
        {savedMessage && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: leagueColors.success.light, color: leagueColors.success.main }}>
            {savedMessage}
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* League Info */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: leagueColors.text.primary }}>League Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>League Name</label>
                <input
                  type="text"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                />
              </div>
              
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Max Teams</label>
                <select
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  {[8, 10, 12, 14, 16].map(n => (
                    <option key={n} value={n}>{n} Teams</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Visibility</label>
                <select
                  value={isPublic ? 'public' : 'private'}
                  onChange={(e) => setIsPublic(e.target.value === 'public')}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Game Mode - Read Only */}
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Game Mode</label>
                <div className="w-full px-3 py-2 rounded-lg bg-gray-100" style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.secondary }}>
                  {gameMode === 'power4' && 'Power 4 (All Power 4 Conferences)'}
                  {gameMode === 'sec' && 'SEC Conference Only'}
                  {gameMode === 'acc' && 'ACC Conference Only'}
                  {gameMode === 'big12' && 'Big 12 Conference Only'}
                  {gameMode === 'bigten' && 'Big Ten Conference Only'}
                  {!gameMode && 'Not Set'}
                </div>
              </div>
            </div>
          </div>

          {/* Draft Settings */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: leagueColors.text.primary }}>Draft Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Draft Date</label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                />
              </div>
              
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Draft Time</label>
                <input
                  type="time"
                  value={draftTime}
                  onChange={(e) => setDraftTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                />
              </div>
              
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Seconds Per Pick</label>
                <select
                  value={pickTimeSeconds}
                  onChange={(e) => setPickTimeSeconds(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="90">90 seconds</option>
                  <option value="120">2 minutes</option>
                  <option value="180">3 minutes</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={saveDraftSettings}
              disabled={saving}
              className="mt-4 px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
            >
              {saving ? 'Saving...' : 'Save Draft Settings'}
            </button>
          </div>

          {/* Draft Order */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: leagueColors.text.primary }}>Draft Order</h2>
            <div className="mb-3 flex items-center gap-3">
              <label className="text-sm" style={{ color: leagueColors.text.secondary }}>Mode</label>
              <select
                value={orderMode}
                onChange={(e)=> setOrderMode(e.target.value as any)}
                className="px-3 py-2 rounded-lg"
                style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
              >
                <option value="custom">Custom</option>
                <option value="random">Randomize</option>
              </select>
              <button
                onClick={() => {
                  if (members.length === 0) return;
                  const base = members.map(m => (m as any).userId || m.$id);
                  const shuffled = [...base].sort(() => Math.random() - 0.5);
                  setDraftOrder(shuffled);
                  setOrderMode('custom');
                }}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: leagueColors.accent.pink, color: leagueColors.text.inverse }}
              >
                Randomize Now
              </button>
              <button
                onClick={() => {
                  const target = maxTeams || 12;
                  const next = new Set(draftOrder);
                  let i = 1;
                  while (next.size < target) {
                    const id = `BOT-${i++}`;
                    next.add(id);
                  }
                  setDraftOrder(Array.from(next));
                }}
                className="px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: '#6b7280', color: leagueColors.text.inverse }}
              >
                Fill With Bots
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
              <div>
                <div className="text-base mb-2" style={{ color: leagueColors.text.secondary }}>Available Members</div>
                <div className="space-y-2 max-h-64 overflow-y-auto p-3 rounded bg-white text-gray-900" style={{ border: `1px solid ${leagueColors.border.light}` }}>
                  {members.map(m => (
                    <div key={m.$id} className="flex items-center justify-between px-3 py-2 rounded border" style={{ borderColor: leagueColors.border.light }}>
                      <div className="truncate" title={m.name || m.teamName || m.$id}>
                        {m.name || m.teamName || m.$id}
                      </div>
                      <button
                        onClick={() => {
                          const mid = (m as any).userId || m.$id;
                          const target = maxTeams || 12;
                          setDraftOrder(prev => {
                            const clean = prev.filter(id => id);
                            const next = clean.includes(mid) ? clean : [...clean, mid];
                            let i = 1;
                            while (next.length < target) {
                              const bot = `BOT-${i++}`;
                              if (!next.includes(bot)) next.push(bot);
                            }
                            return next;
                          });
                        }}
                        className="text-sm px-3 py-1 rounded"
                        style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
                      >Add</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-base mb-2" style={{ color: leagueColors.text.secondary }}>Order (1..N)</div>
                <div className="space-y-2 max-h-64 overflow-y-auto p-3 rounded bg-white text-gray-900" style={{ border: `1px solid ${leagueColors.border.light}` }}>
                  {draftOrder.map((id, idx) => {
                    const m = members.find(mm => mm.$id === id || (mm as any).userId === id);
                    return (
                      <div key={`${id}-${idx}`} className="flex items-center gap-3 px-3 py-2 rounded border" style={{ borderColor: leagueColors.border.light }}>
                        <div className="w-6 text-center font-medium">{idx+1}</div>
                        <div className="flex-1 truncate" title={m?.name || m?.teamName || id}>
                          {m?.name || m?.teamName || id}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDraftOrder(prev => {
                            if (idx === 0) return prev;
                            const clone = [...prev];
                            [clone[idx-1], clone[idx]] = [clone[idx], clone[idx-1]];
                            return clone;
                          })} className="text-sm px-3 py-1 rounded border">Up</button>
                          <button onClick={() => setDraftOrder(prev => {
                            if (idx === prev.length -1) return prev;
                            const clone = [...prev];
                            [clone[idx+1], clone[idx]] = [clone[idx], clone[idx+1]];
                            return clone;
                          })} className="text-sm px-3 py-1 rounded border">Down</button>
                          <button onClick={() => setDraftOrder(prev => prev.filter(x => x !== id))} className="text-sm px-3 py-1 rounded border">Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={saveAllSettings}
                disabled={saving}
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
              >
                {saving ? 'Saving...' : 'Save Draft Order'}
              </button>
            </div>
          </div>

          {/* Season Settings */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: leagueColors.text.primary }}>Season Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Season Start Week</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={seasonStartWeek}
                  onChange={(e) => setSeasonStartWeek(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                />
              </div>
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Playoff Teams</label>
                <select
                  value={playoffTeams}
                  onChange={(e) => setPlayoffTeams(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="0">No Playoffs</option>
                  <option value="4">4 Teams</option>
                  <option value="6">6 Teams</option>
                  <option value="8">8 Teams</option>
                </select>
              </div>
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Playoff Start Week</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={playoffStartWeek}
                  onChange={(e) => setPlayoffStartWeek(parseInt(e.target.value) || 13)}
                  className="w-full px-3 py-2 rounded-lg"
                  disabled={playoffTeams === 0}
                  style={{ 
                    backgroundColor: playoffTeams === 0 ? '#e5e5e5' : leagueColors.background.overlay, 
                    border: `1px solid ${leagueColors.border.light}`, 
                    color: playoffTeams === 0 ? '#999' : leagueColors.text.primary,
                    cursor: playoffTeams === 0 ? 'not-allowed' : 'auto'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Waivers */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: leagueColors.text.primary }}>Waiver Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>Waiver Type</label>
                <select
                  value={waiverType}
                  onChange={(e) => setWaiverType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                >
                  <option value="FAAB">FAAB (Free Agent Acquisition Budget)</option>
                  <option value="Rolling">Rolling Waivers</option>
                  <option value="None">No Waivers</option>
                </select>
              </div>
              <div>
                <label className="block mb-1" style={{ color: leagueColors.text.secondary }}>
                  {waiverType === 'FAAB' ? 'FAAB Budget ($)' : 'Waiver Priority Reset'}
                </label>
                {waiverType === 'FAAB' ? (
                  <input
                    type="number"
                    value={waiverBudget}
                    onChange={(e) => setWaiverBudget(parseInt(e.target.value) || 0)}
                    min={0}
                    max={1000}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                  />
                ) : (
                  <select
                    className="w-full px-3 py-2 rounded-lg"
                    disabled={waiverType === ('None' as any)}
                    style={{ 
                      backgroundColor: (waiverType as any) === 'None' ? '#e5e5e5' : leagueColors.background.overlay, 
                      border: `1px solid ${leagueColors.border.light}`, 
                      color: (waiverType as any) === 'None' ? '#999' : leagueColors.text.primary,
                      cursor: (waiverType as any) === 'None' ? 'not-allowed' : 'auto'
                    }}
                  >
                    <option>Weekly - Inverse Standings</option>
                    <option>Never Reset</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: leagueColors.text.primary }}>Scoring Rules</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Passing */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: leagueColors.text.primary }}>Passing</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Passing Yards (per yard)</label>
                    <input
                      type="number"
                      value={scoringRules.passingYards}
                      onChange={(e) => setScoringRules({...scoringRules, passingYards: parseFloat(e.target.value)})}
                      step="0.01"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Passing TDs</label>
                    <input
                      type="number"
                      value={scoringRules.passingTouchdowns}
                      onChange={(e) => setScoringRules({...scoringRules, passingTouchdowns: parseInt(e.target.value)})}
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Interceptions</label>
                    <input
                      type="number"
                      value={scoringRules.interceptions}
                      onChange={(e) => setScoringRules({...scoringRules, interceptions: parseInt(e.target.value)})}
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                </div>
              </div>

              {/* Rushing */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: leagueColors.text.primary }}>Rushing</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Rushing Yards (per yard)</label>
                    <input
                      type="number"
                      value={scoringRules.rushingYards}
                      onChange={(e) => setScoringRules({...scoringRules, rushingYards: parseFloat(e.target.value)})}
                      step="0.01"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Rushing TDs</label>
                    <input
                      type="number"
                      value={scoringRules.rushingTouchdowns}
                      onChange={(e) => setScoringRules({...scoringRules, rushingTouchdowns: parseInt(e.target.value)})}
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                </div>
              </div>

              {/* Receiving */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: leagueColors.text.primary }}>Receiving</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Receptions (PPR)</label>
                    <input
                      type="number"
                      value={scoringRules.receptions}
                      onChange={(e) => setScoringRules({...scoringRules, receptions: parseFloat(e.target.value)})}
                      step="0.5"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Receiving Yards (per yard)</label>
                    <input
                      type="number"
                      value={scoringRules.receivingYards}
                      onChange={(e) => setScoringRules({...scoringRules, receivingYards: parseFloat(e.target.value)})}
                      step="0.01"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>Receiving TDs</label>
                    <input
                      type="number"
                      value={scoringRules.receivingTouchdowns}
                      onChange={(e) => setScoringRules({...scoringRules, receivingTouchdowns: parseInt(e.target.value)})}
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                </div>
              </div>

              {/* Kicking */}
              <div>
                <h3 className="font-semibold mb-3" style={{ color: leagueColors.text.primary }}>Kicking</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>FG 0-39 yards</label>
                    <input
                      type="number"
                      value={scoringRules.fieldGoal_0_39}
                      onChange={(e) => setScoringRules({ ...scoringRules, fieldGoal_0_39: parseFloat(e.target.value) })}
                      step="0.5"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>FG 40-49 yards</label>
                    <input
                      type="number"
                      value={scoringRules.fieldGoal_40_49}
                      onChange={(e) => setScoringRules({ ...scoringRules, fieldGoal_40_49: parseFloat(e.target.value) })}
                      step="0.5"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>FG 50+ yards</label>
                    <input
                      type="number"
                      value={scoringRules.fieldGoal_50_plus}
                      onChange={(e) => setScoringRules({ ...scoringRules, fieldGoal_50_plus: parseFloat(e.target.value) })}
                      step="0.5"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>XP Made</label>
                      <input
                        type="number"
                        value={scoringRules.extraPointMade}
                        onChange={(e) => setScoringRules({ ...scoringRules, extraPointMade: parseFloat(e.target.value) })}
                        step="0.5"
                        className="w-full px-3 py-1.5 rounded text-sm"
                        style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>XP Missed</label>
                      <input
                        type="number"
                        value={scoringRules.extraPointMissed}
                        onChange={(e) => setScoringRules({ ...scoringRules, extraPointMissed: parseFloat(e.target.value) })}
                        step="0.5"
                        className="w-full px-3 py-1.5 rounded text-sm"
                        style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm" style={{ color: leagueColors.text.secondary }}>FG Missed (any distance)</label>
                    <input
                      type="number"
                      value={scoringRules.fieldGoalMissed}
                      onChange={(e) => setScoringRules({ ...scoringRules, fieldGoalMissed: parseFloat(e.target.value) })}
                      step="0.5"
                      className="w-full px-3 py-1.5 rounded text-sm"
                      style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={saveScoringRules}
              disabled={saving}
              className="mt-6 px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
            >
              {saving ? 'Saving...' : 'Save Scoring Rules'}
            </button>
          </div>

          {/* Save All Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={saveAllSettings}
              disabled={saving}
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: leagueColors.primary.crimson, color: leagueColors.text.inverse }}
            >
              {saving ? 'Saving All Settings...' : 'Save All Settings'}
            </button>
          </div>

          {/* Members */}
          <div className="rounded-xl p-6" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: leagueColors.text.primary }}>League Members</h2>
                <p className="text-sm" style={{ color: leagueColors.text.secondary }}>
                  {members.length} of {league?.maxTeams || 12} spots filled
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: leagueColors.accent.pink, 
                  color: leagueColors.text.inverse 
                }}
              >
                <ShareIcon className="w-4 h-4" />
                Invite Players
              </button>
            </div>
            
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.$id} className="flex items-center justify-between py-2 px-3 rounded" style={{ backgroundColor: leagueColors.background.overlay }}>
                  <div>
                    <div className="font-medium" style={{ color: leagueColors.text.primary }}>
                      {member.name || member.teamName || 'Unnamed Team'}
                    </div>
                    <div className="text-sm" style={{ color: leagueColors.text.secondary }}>
                      {member.owner || member.email || 'No owner'}
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: leagueColors.text.muted }}>
                    {member.wins || 0}-{member.losses || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Invite Modal */}
      {showInviteModal && league && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          leagueId={league.$id}
          leagueName={league.name}
        />
      )}
    </div>
  );
}
