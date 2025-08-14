'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { isUserCommissioner, debugCommissionerMatch } from '@/lib/utils/commissioner';
import { 
  CogIcon, 
  UserGroupIcon, 
  ClockIcon, 
  TrophyIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ScoringRule {
  category: string;
  name: string;
  points: number;
}

const DEFAULT_SCORING_RULES: ScoringRule[] = [
  { category: 'Passing', name: 'Passing Yards', points: 0.04 },
  { category: 'Passing', name: 'Passing TD', points: 4 },
  { category: 'Passing', name: 'Interception', points: -2 },
  { category: 'Rushing', name: 'Rushing Yards', points: 0.1 },
  { category: 'Rushing', name: 'Rushing TD', points: 6 },
  { category: 'Rushing', name: 'Fumble', points: -2 },
  { category: 'Receiving', name: 'Reception', points: 1 },
  { category: 'Receiving', name: 'Receiving Yards', points: 0.1 },
  { category: 'Receiving', name: 'Receiving TD', points: 6 },
  { category: 'Kicking', name: 'FG 0-39 yards', points: 3 },
  { category: 'Kicking', name: 'FG 40-49 yards', points: 4 },
  { category: 'Kicking', name: 'FG 50+ yards', points: 5 },
  { category: 'Kicking', name: 'Extra Point', points: 1 },
];

export default function CommissionerSettingsPage({ params }: { params: { leagueId: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [activeTab, setActiveTab] = useState<'scoring' | 'members' | 'draft'>('scoring');
  
  // League data
  const [leagueName, setLeagueName] = useState('');
  const [maxTeams, setMaxTeams] = useState(12);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [pickTimeSeconds, setPickTimeSeconds] = useState(90);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(DEFAULT_SCORING_RULES);
  
  // Members data
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      checkCommissionerStatus();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [params.leagueId, user, authLoading, router]);

  async function checkCommissionerStatus() {
    if (!user) return;
    
    try {
      const league = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId
      );
      debugCommissionerMatch(league, user);
      const isComm = isUserCommissioner(league, user);

      if (isComm) {
        setIsCommissioner(true);
        loadLeagueData(league);
        loadMembers();
        setLoading(false);
      } else {
        router.push(`/league/${params.leagueId}`);
      }
    } catch (error) {
      console.error('Error checking commissioner status:', error);
      router.push('/');
    }
  }

  function loadLeagueData(league: any) {
    setLeagueName(league.name || '');
    setMaxTeams(league.maxTeams || 12);
    setInviteCode(league.inviteCode || '');
    setPickTimeSeconds(league.pickTimeSeconds || 90);
    
    if (league.draftDate) {
      const date = new Date(league.draftDate);
      setDraftDate(date.toISOString().split('T')[0]);
      setDraftTime(date.toTimeString().slice(0, 5));
    }
    
    if (league.scoringRules) {
      try {
        setScoringRules(JSON.parse(league.scoringRules));
      } catch (e) {
        setScoringRules(DEFAULT_SCORING_RULES);
      }
    }
    
    setLoading(false);
  }

  async function loadMembers() {
    try {
      const rosters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [`equal("leagueId", "${params.leagueId}")`]
      );
      setMembers(rosters.documents);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  }

  async function updateScoringRules(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId,
        {
          scoringRules: JSON.stringify(scoringRules)
        }
      );
      alert('Scoring rules updated successfully!');
    } catch (error) {
      console.error('Error updating scoring rules:', error);
      alert('Failed to update scoring rules');
    } finally {
      setSaving(false);
    }
  }

  async function updateDraftSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updates: any = {
        maxTeams,
        pickTimeSeconds
      };
      
      if (draftDate && draftTime) {
        updates.draftDate = new Date(`${draftDate}T${draftTime}`).toISOString();
      }
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId,
        updates
      );
      alert('Draft settings updated successfully!');
    } catch (error) {
      console.error('Error updating draft settings:', error);
      alert('Failed to update draft settings');
    } finally {
      setSaving(false);
    }
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ACTIVITY_LOG,
        ID.unique(),
        {
          leagueId: params.leagueId,
          email: inviteEmail,
          inviteCode: inviteCode,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      );
      
      setInviteEmail('');
      alert(`Invitation sent to ${inviteEmail}!`);
      // In a real app, this would send an email
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invitation');
    }
  }

  function updateScoringRule(index: number, points: number) {
    const updated = [...scoringRules];
    updated[index].points = points;
    setScoringRules(updated);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B3AA0] via-[#A374B5] to-[#E73C7E] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isCommissioner) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6B3AA0] via-[#A374B5] to-[#E73C7E]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Commissioner Settings</h1>
          <p className="text-[#F7EAE1]">{leagueName}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/10 p-1 rounded-lg backdrop-blur-sm max-w-fit">
          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'scoring' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            <TrophyIcon className="h-5 w-5 inline mr-2" />
            Scoring
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'members' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 inline mr-2" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'draft' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            <ClockIcon className="h-5 w-5 inline mr-2" />
            Draft
          </button>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          {activeTab === 'scoring' && (
            <form onSubmit={updateScoringRules}>
              <h2 className="text-2xl font-bold text-white mb-4">Scoring Rules</h2>
              <div className="space-y-6">
                {['Passing', 'Rushing', 'Receiving', 'Kicking'].map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-[#F7EAE1] mb-3">{category}</h3>
                    <div className="grid gap-3">
                      {scoringRules
                        .filter(rule => rule.category === category)
                        .map((rule, index) => {
                          const ruleIndex = scoringRules.indexOf(rule);
                          return (
                            <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                              <span className="text-white">{rule.name}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={rule.points}
                                onChange={(e) => updateScoringRule(ruleIndex, parseFloat(e.target.value))}
                                className="w-24 px-3 py-1 rounded bg-white/90 text-black text-center"
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-6 px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Scoring Rules'}
              </button>
            </form>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">League Members</h2>
              
              {/* Invite Form */}
              <form onSubmit={inviteMember} className="mb-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-[#F7EAE1] mb-3">Invite New Member</h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/90 text-black"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors"
                  >
                    <PlusIcon className="h-5 w-5 inline mr-1" />
                    Invite
                  </button>
                </div>
                <p className="text-[#F7EAE1]/60 text-sm mt-2">
                  Share invite code: <span className="font-mono bg-white/10 px-2 py-1 rounded">{inviteCode}</span>
                </p>
              </form>

              {/* Members List */}
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.$id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{member.userName || 'Unknown User'}</p>
                      <p className="text-[#F7EAE1]/60 text-sm">{member.teamName}</p>
                    </div>
                    <div className="text-white/60 text-sm">
                      {member.wins}-{member.losses}-{member.ties}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'draft' && (
            <form onSubmit={updateDraftSettings}>
              <h2 className="text-2xl font-bold text-white mb-4">Draft Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">Max Teams</label>
                  <input
                    type="number"
                    min="4"
                    max="20"
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#F7EAE1] text-sm mb-2">Draft Date</label>
                    <input
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[#F7EAE1] text-sm mb-2">Draft Time</label>
                    <input
                      type="time"
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">
                    Pick Timer (seconds)
                  </label>
                  <select
                    value={pickTimeSeconds}
                    onChange={(e) => setPickTimeSeconds(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  >
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="90">1.5 minutes</option>
                    <option value="120">2 minutes</option>
                    <option value="180">3 minutes</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Draft Settings'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
