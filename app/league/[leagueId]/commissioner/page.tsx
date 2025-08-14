'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { isUserCommissioner, debugCommissionerMatch } from '@/lib/utils/commissioner';
import { 
  CogIcon, 
  UserGroupIcon, 
  ClockIcon, 
  TrophyIcon,
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
  const [activeTab, setActiveTab] = useState<'settings' | 'scoring' | 'members' | 'draft' | 'schedule' | 'playoffs' | 'theme'>('settings');
  
  // League data
  const [leagueName, setLeagueName] = useState('');
  const [maxTeams, setMaxTeams] = useState(12);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [pickTimeSeconds, setPickTimeSeconds] = useState(90);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(DEFAULT_SCORING_RULES);
  const [isPublic, setIsPublic] = useState(true);
  
  // Schedule settings
  const [scheduleType, setScheduleType] = useState<'round-robin' | 'balanced' | 'manual' | 'rivalry'>('round-robin');
  const [doubleHeaders, setDoubleHeaders] = useState(false);
  const [rivalryWeeks, setRivalryWeeks] = useState<number[]>([]);
  
  // Playoff settings
  const [playoffTeams, setPlayoffTeams] = useState(6);
  const [playoffStartWeek, setPlayoffStartWeek] = useState(11);
  const [reseeding, setReseeding] = useState(true);
  const [playoffByes, setPlayoffByes] = useState(2);
  const [thirdPlaceGame, setThirdPlaceGame] = useState(true);
  
  // Theme settings
  const [primaryColor, setPrimaryColor] = useState('#5E2B8A');
  const [secondaryColor, setSecondaryColor] = useState('#E73C7E');
  const [leagueLogo, setLeagueLogo] = useState('');
  const [trophyName, setTrophyName] = useState('Championship Trophy');
  
  // Import/Export
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedSettings, setImportedSettings] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Members data
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

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
    setIsPublic(league.isPublic !== false);
    
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
    
    // Load schedule settings
    if (league.scheduleSettings) {
      setScheduleType(league.scheduleSettings.type || 'round-robin');
      setDoubleHeaders(league.scheduleSettings.doubleHeaders || false);
      setRivalryWeeks(league.scheduleSettings.rivalryWeeks || []);
    }
    
    // Load playoff settings
    if (league.playoffSettings) {
      setPlayoffTeams(league.playoffSettings.teams || 6);
      setPlayoffStartWeek(league.playoffSettings.startWeek || 11);
      setReseeding(league.playoffSettings.reseeding !== false);
      setPlayoffByes(league.playoffSettings.byes || 2);
      setThirdPlaceGame(league.playoffSettings.thirdPlaceGame !== false);
    }
    
    // Load theme settings
    if (league.theme) {
      setPrimaryColor(league.theme.primaryColor || '#5E2B8A');
      setSecondaryColor(league.theme.secondaryColor || '#E73C7E');
      setLeagueLogo(league.theme.logo || '');
      setTrophyName(league.theme.trophyName || 'Championship Trophy');
    }
    
    setLoading(false);
  }

  async function loadMembers() {
    try {
      const rosters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('leagueId', params.leagueId)]
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
    setSendingInvite(true);
    
    try {
      const response = await fetch('/api/leagues/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId: params.leagueId,
          email: inviteEmail,
          sendEmail: true
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInviteEmail('');
        setInviteLink(data.invite.inviteLink);
        setShowInviteLink(true);
        alert(`Invitation created for ${inviteEmail}!`);
      } else {
        alert(data.error || 'Failed to create invitation');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  }

  function generateDirectInviteLink() {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/league/join?code=${inviteCode}&league=${params.leagueId}`;
    setInviteLink(link);
    setShowInviteLink(true);
  }

  function updateScoringRule(index: number, points: number) {
    const updated = [...scoringRules];
    updated[index].points = points;
    setScoringRules(updated);
  }

  // New functions for additional features
  async function updateLeagueSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId,
        {
          name: leagueName,
          isPublic: isPublic,
        }
      );
      alert('League settings updated!');
    } catch (error) {
      console.error('Error updating league settings:', error);
      alert('Failed to update league settings');
    } finally {
      setSaving(false);
    }
  }

  async function updateScheduleSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId,
        {
          scheduleSettings: JSON.stringify({
            type: scheduleType,
            doubleHeaders,
            rivalryWeeks
          })
        }
      );
      alert('Schedule settings updated!');
    } catch (error) {
      console.error('Error updating schedule settings:', error);
      alert('Failed to update schedule settings');
    } finally {
      setSaving(false);
    }
  }

  async function updatePlayoffSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId,
        {
          playoffSettings: JSON.stringify({
            teams: playoffTeams,
            startWeek: playoffStartWeek,
            reseeding,
            byes: playoffByes,
            thirdPlaceGame
          })
        }
      );
      alert('Playoff settings updated!');
    } catch (error) {
      console.error('Error updating playoff settings:', error);
      alert('Failed to update playoff settings');
    } finally {
      setSaving(false);
    }
  }

  async function updateThemeSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        params.leagueId,
        {
          theme: JSON.stringify({
            primaryColor,
            secondaryColor,
            logo: leagueLogo,
            trophyName
          })
        }
      );
      alert('Theme settings updated!');
    } catch (error) {
      console.error('Error updating theme settings:', error);
      alert('Failed to update theme settings');
    } finally {
      setSaving(false);
    }
  }



  async function exportLeagueSettings() {
    const settings = {
      name: leagueName,
      maxTeams,
      isPublic,
      scoringRules,
      scheduleSettings: {
        type: scheduleType,
        doubleHeaders,
        rivalryWeeks
      },
      playoffSettings: {
        teams: playoffTeams,
        startWeek: playoffStartWeek,
        reseeding,
        byes: playoffByes,
        thirdPlaceGame
      },
      theme: {
        primaryColor,
        secondaryColor,
        logo: leagueLogo,
        trophyName
      }
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${leagueName.replace(/\s+/g, '-')}-settings.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importLeagueSettings(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const settings = JSON.parse(importedSettings);
      
      // Apply imported settings
      if (settings.name) setLeagueName(settings.name);
      if (settings.maxTeams) setMaxTeams(settings.maxTeams);
      if (settings.isPublic !== undefined) setIsPublic(settings.isPublic);
      if (settings.scoringRules) setScoringRules(settings.scoringRules);
      
      if (settings.scheduleSettings) {
        setScheduleType(settings.scheduleSettings.type || 'round-robin');
        setDoubleHeaders(settings.scheduleSettings.doubleHeaders || false);
        setRivalryWeeks(settings.scheduleSettings.rivalryWeeks || []);
      }
      
      if (settings.playoffSettings) {
        setPlayoffTeams(settings.playoffSettings.teams || 6);
        setPlayoffStartWeek(settings.playoffSettings.startWeek || 11);
        setReseeding(settings.playoffSettings.reseeding !== false);
        setPlayoffByes(settings.playoffSettings.byes || 2);
        setThirdPlaceGame(settings.playoffSettings.thirdPlaceGame !== false);
      }
      
      if (settings.theme) {
        setPrimaryColor(settings.theme.primaryColor || '#5E2B8A');
        setSecondaryColor(settings.theme.secondaryColor || '#E73C7E');
        setLeagueLogo(settings.theme.logo || '');
        setTrophyName(settings.theme.trophyName || 'Championship Trophy');
      }
      
      setShowImportModal(false);
      setImportedSettings('');
      alert('Settings imported successfully!');
    } catch (error) {
      console.error('Error importing settings:', error);
      alert('Invalid settings format');
    }
  }

  async function replaceMember(oldUserId: string, newEmail: string) {
    try {
      // This would handle mid-season manager replacement
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        oldUserId,
        {
          userEmail: newEmail,
          replacedAt: new Date().toISOString()
        }
      );
      
      alert('Manager replaced successfully!');
      loadMembers();
    } catch (error) {
      console.error('Error replacing manager:', error);
      alert('Failed to replace manager');
    }
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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/league/${params.leagueId}`}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Commissioner Settings</h1>
              <p className="text-[#F7EAE1]">{leagueName}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
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
            className={`px-4 py-2 rounded-md font-medium transition-all ${
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
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'draft' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            <ClockIcon className="h-5 w-5 inline mr-2" />
            Draft
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'schedule' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('playoffs')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'playoffs' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            Playoffs
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === 'theme' 
                ? 'bg-[#E73C7E] text-white' 
                : 'text-[#F7EAE1] hover:bg-white/10'
            }`}
          >
            Theme
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
              
              {/* Invite Section */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-[#F7EAE1] mb-3">Invite New Members</h3>
                
                {/* Quick Share for Text/iMessage */}
                <div className="bg-[#E73C7E]/10 border border-[#E73C7E]/20 rounded-lg p-4 mb-4">
                  <p className="text-white font-medium mb-2">📱 Share via Text/iMessage</p>
                  <button
                    type="button"
                    onClick={() => {
                      const baseUrl = window.location.origin;
                      const link = `${baseUrl}/league/join?code=${inviteCode}&league=${params.leagueId}`;
                      const message = `Join my fantasy football league "${leagueName}"!\n\n🏈 Click here: ${link}\n\n🔑 League Password: ${inviteCode}\n\nSpots available: ${maxTeams - members.length}`;
                      
                      // Copy the message to clipboard
                      navigator.clipboard.writeText(message);
                      alert('Invite message copied! Paste it in Messages, WhatsApp, or any texting app.');
                      setInviteLink(link);
                      setShowInviteLink(true);
                    }}
                    className="w-full px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Copy Text Message Invite
                  </button>
                  <p className="text-[#F7EAE1]/60 text-xs mt-2">
                    Includes league link and password - perfect for iMessage or WhatsApp
                  </p>
                </div>

                {/* Direct Link Section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[#F7EAE1]/60 text-xs mb-1">League Code</p>
                    <p className="font-mono text-white font-semibold">{inviteCode}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[#F7EAE1]/60 text-xs mb-1">Open Spots</p>
                    <p className="text-white font-semibold">{maxTeams - members.length} of {maxTeams}</p>
                  </div>
                </div>

                {/* Optional Email Invite */}
                <details className="group">
                  <summary className="cursor-pointer text-[#F7EAE1]/60 text-sm hover:text-[#F7EAE1] transition-colors">
                    <span className="group-open:hidden">▶</span>
                    <span className="hidden group-open:inline">▼</span>
                    {' '}Track invite by email (optional)
                  </summary>
                  <form onSubmit={inviteMember} className="mt-3 space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/90 text-black"
                        disabled={sendingInvite}
                      />
                      <button
                        type="submit"
                        disabled={sendingInvite}
                        className="px-6 py-2 bg-[#8A5EAA] hover:bg-[#7a4e9a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
                      >
                        {sendingInvite ? 'Creating...' : 'Track'}
                      </button>
                    </div>
                  </form>
                </details>
                
                {showInviteLink && inviteLink && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400 mb-2 font-semibold">✅ Invite Link Ready!</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="flex-1 px-3 py-1 bg-white/5 text-white/80 rounded text-sm font-mono"
                      />
                      <button
                        type="button"
                        onClick={copyInviteLink}
                        className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                    <p className="text-xs text-[#F7EAE1]/70 mt-2">
                      Users will enter the league password when they visit this link
                    </p>
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.$id} className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.userName || 'Unknown User'}</p>
                      <p className="text-[#F7EAE1]/60 text-sm">{member.teamName}</p>
                      <p className="text-[#F7EAE1]/40 text-xs">{member.userEmail || 'No email'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-white/60 text-sm">
                        {member.wins}-{member.losses}-{member.ties}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newEmail = prompt('Enter new manager email:');
                          if (newEmail) {
                            replaceMember(member.$id, newEmail);
                          }
                        }}
                        className="px-3 py-1 text-xs bg-[#8A5EAA] hover:bg-[#7a4e9a] text-white rounded transition-colors"
                      >
                        Replace
                      </button>
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

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <form onSubmit={updateLeagueSettings}>
              <h2 className="text-2xl font-bold text-white mb-4">League Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">League Name</label>
                  <input
                    type="text"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                    required
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="isPublic" className="text-white">
                    Public League (visible in search)
                  </label>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={exportLeagueSettings}
                    className="px-6 py-3 bg-[#5E2B8A] hover:bg-[#4e2470] text-white font-semibold rounded-lg transition-colors"
                  >
                    Export Settings
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="px-6 py-3 bg-[#8A5EAA] hover:bg-[#7a4e9a] text-white font-semibold rounded-lg transition-colors"
                  >
                    Import Settings
                  </button>
                  

                </div>
              </div>
            </form>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <form onSubmit={updateScheduleSettings}>
              <h2 className="text-2xl font-bold text-white mb-4">Schedule Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">Schedule Type</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  >
                    <option value="round-robin">Round Robin</option>
                    <option value="balanced">Balanced</option>
                    <option value="manual">Manual</option>
                    <option value="rivalry">Rivalry-Based</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="doubleHeaders"
                    checked={doubleHeaders}
                    onChange={(e) => setDoubleHeaders(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="doubleHeaders" className="text-white">
                    Enable Double Headers
                  </label>
                </div>

                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">
                    Rivalry Weeks (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={rivalryWeeks.join(', ')}
                    onChange={(e) => setRivalryWeeks(
                      e.target.value.split(',').map(w => parseInt(w.trim())).filter(w => !isNaN(w))
                    )}
                    placeholder="e.g., 3, 7, 11"
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Schedule Settings'}
              </button>
            </form>
          )}

          {/* Playoffs Tab */}
          {activeTab === 'playoffs' && (
            <form onSubmit={updatePlayoffSettings}>
              <h2 className="text-2xl font-bold text-white mb-4">Playoff Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#F7EAE1] text-sm mb-2">Playoff Teams</label>
                    <select
                      value={playoffTeams}
                      onChange={(e) => setPlayoffTeams(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                    >
                      <option value="4">4 Teams</option>
                      <option value="6">6 Teams</option>
                      <option value="8">8 Teams</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[#F7EAE1] text-sm mb-2">Start Week</label>
                    <input
                      type="number"
                      min="10"
                      max="12"
                      value={playoffStartWeek}
                      onChange={(e) => setPlayoffStartWeek(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">First Round Byes</label>
                  <select
                    value={playoffByes}
                    onChange={(e) => setPlayoffByes(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  >
                    <option value="0">No Byes</option>
                    <option value="2">2 Teams (Top 2)</option>
                    <option value="4">4 Teams (Top 4)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="reseeding"
                    checked={reseeding}
                    onChange={(e) => setReseeding(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="reseeding" className="text-white">
                    Enable Reseeding Each Round
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="thirdPlaceGame"
                    checked={thirdPlaceGame}
                    onChange={(e) => setThirdPlaceGame(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <label htmlFor="thirdPlaceGame" className="text-white">
                    Include Third Place Game
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Playoff Settings'}
              </button>
            </form>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <form onSubmit={updateThemeSettings}>
              <h2 className="text-2xl font-bold text-white mb-4">League Theme</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#F7EAE1] text-sm mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#F7EAE1] text-sm mb-2">Secondary Color</label>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">League Logo URL</label>
                  <input
                    type="url"
                    value={leagueLogo}
                    onChange={(e) => setLeagueLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  />
                </div>

                <div>
                  <label className="block text-[#F7EAE1] text-sm mb-2">Trophy Name</label>
                  <input
                    type="text"
                    value={trophyName}
                    onChange={(e) => setTrophyName(e.target.value)}
                    placeholder="e.g., The Lombardi Trophy"
                    className="w-full px-4 py-2 rounded-lg bg-white/90 text-black"
                  />
                </div>

                {/* Color Preview */}
                <div className="mt-6 p-4 rounded-lg" style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                }}>
                  <p className="text-white font-semibold">Theme Preview</p>
                  <p className="text-white/80 text-sm">This is how your league colors will look</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 px-6 py-3 bg-[#E73C7E] hover:bg-[#d6356f] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </form>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4">Import League Settings</h3>
              <form onSubmit={importLeagueSettings}>
                <textarea
                  value={importedSettings}
                  onChange={(e) => setImportedSettings(e.target.value)}
                  placeholder="Paste your exported settings JSON here..."
                  className="w-full h-64 p-3 border rounded-lg"
                  required
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportedSettings('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E73C7E] text-white rounded-lg"
                  >
                    Import
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
