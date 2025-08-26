'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDraftCoreLive } from '@lib/draft/core';
import { useAuth } from '@lib/hooks/useAuth';
import DraftCore from '@components/features/draft/DraftCore';
import { DraftPlayer } from '@lib/types/projections';
import { FiStar, FiClock } from 'react-icons/fi';
import DraftBoard from '@components/features/draft/DraftBoard';
import MobileDraftInterface from '@components/features/draft/MobileDraftInterface';
import MobileDraftErrorBoundary from '@components/features/draft/MobileDraftErrorBoundary';
import { databases, DATABASE_ID } from '@lib/appwrite';
import { Query } from 'appwrite';
import { leagueColors } from '@lib/theme/colors';

interface Props {
  params: Promise<{ leagueId: string }>;
}

export default function DraftRoom({ params }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leagueId, setLeagueId] = useState<string>('');
  
  // Realtime draft state
  const draft = useDraftCoreLive(leagueId);
  
  // User data
  const [users, setUsers] = useState<Record<string, any>>({});
  const [myPicks, setMyPicks] = useState<DraftPlayer[]>([]);
  const [interfaceMode, setInterfaceMode] = useState<'dashboard'|'board'>('dashboard');
  // Mock-like players and filters to mirror mock draft UI
  const [players, setPlayers] = useState<any[]>([]);
  const [teamView, setTeamView] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterConf, setFilterConf] = useState<string>('');
  const [filterPos, setFilterPos] = useState<string>('');
  const [viewMode, setViewMode] = useState<string>('players');

  // Mock-style timer state (server-anchored to last pick timestamp + timeLimit)
  const [deadlineTs, setDeadlineTs] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [draftHasStarted, setDraftHasStarted] = useState<boolean>(false);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Resolve params
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setLeagueId(resolvedParams.leagueId);
    };
    resolveParams();
  }, [params]);

  // Start the live draft state at or after the draft time (idempotent)
  useEffect(() => {
    if (!leagueId || !draftHasStarted) return;
    
    // Kick off server state when draft time arrives
    const startDraft = async () => {
      try {
        console.log('[Draft] Attempting to start draft for league:', leagueId);
        const response = await fetch(`/api/drafts/${leagueId}/start?reset=true`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('[Draft] Failed to start draft:', error);
          // Try again in 5 seconds if it fails
          setTimeout(startDraft, 5000);
        } else {
          const result = await response.json();
          console.log('[Draft] Draft started successfully:', result);
        }
      } catch (error) {
        console.error('[Draft] Error starting draft:', error);
        // Try again in 5 seconds
        setTimeout(startDraft, 5000);
      }
    };
    
    startDraft();
  }, [leagueId, draftHasStarted]);

  // Initialize
  useEffect(() => {
    if (leagueId && !authLoading && user) {
      loadInitialData();
    }
  }, [leagueId, authLoading, user]);

  // Load available players (mirror mock-draft fetch)
  useEffect(() => {
    if (!leagueId) return;
    fetch(`/api/draft/players?leagueId=${encodeURIComponent(leagueId)}`)
      .then(res => res.json())
      .then(data => setPlayers(data.players || data || []))
      .catch(() => setPlayers([]));
  }, [leagueId]);

  // Update my picks when draft picks change
  useEffect(() => {
    if (user && draft.picks.length > 0) {
      const myDraftPicks = draft.picks.filter(pick => pick.authUserId === user.$id || pick.userId === user.$id);
      setMyPicks(
        myDraftPicks.map(pick => ({
          $id: pick.playerId,
          playerName: pick.playerName,
          position: pick.playerPosition,
          team: pick.playerTeam,
          draftPosition: pick.pickNumber,
          isDrafted: true,
          draftedBy: pick.authUserId || pick.userId,
          // Add other required fields with defaults
          projections: { fantasyPoints: 0 },
          rankings: { overall: 0, position: 0, adp: 0 },
          prevYearStats: { gamesPlayed: 0, fantasyPoints: 0 },
        } as DraftPlayer))
      );
    }
  }, [user, draft.picks]);

  // Check if draft is complete
  const isDraftComplete = draft.league && draft.picks.length >= 
    (draft.league.draftRounds || 15) * (draft.league.draftOrder?.length || 12);

  // Check if draft has started based on status + time (isDraftLive)
  useEffect(() => {
    if (!draft.league) return;
    
    const draftDate = (draft.league as any)?.draftDate;
    if (!draftDate) {
      setDraftHasStarted(false);
      return;
    }
    
    const draftStartMs = new Date(draftDate).getTime();
    const now = Date.now();
    const hasStarted = String((draft.league as any)?.status) === 'drafting' && now >= draftStartMs;
    setDraftHasStarted(hasStarted);
    
    // Check every second if draft hasn't started yet
    if (!hasStarted) {
      const checkInterval = setInterval(() => {
        if (Date.now() >= draftStartMs) {
          setDraftHasStarted(true);
          clearInterval(checkInterval);
        }
      }, 1000);
      return () => clearInterval(checkInterval);
    }
  }, [draft.league]);

  // Derive and lock a deadline when the turn changes (use server draftState when present)
  useEffect(() => {
    // Only set timer if draft has started
    if (!draftHasStarted) {
      setDeadlineTs(null);
      setSecondsLeft(null);
      return;
    }
    
    const timeLimitSec = Number((draft.league as any)?.settings?.draftTimeLimit || (draft.league as any)?.pickTimeSeconds || 90);
    // Prefer server-provided deadline if available (late joiners)
    const serverDeadline = (draft as any)?.deadlineAt ? new Date((draft as any).deadlineAt).getTime() : null;
    if (serverDeadline && serverDeadline > Date.now() - 5000) {
      setDeadlineTs(serverDeadline);
    } else {
      // Fallback: use the last pick timestamp if available; otherwise anchor to now when onTheClock changes
      const lastPick = draft.picks.length > 0 ? draft.picks[draft.picks.length - 1] : null;
      const lastTs = lastPick?.timestamp ? new Date(lastPick.timestamp).getTime() : Date.now();
      setDeadlineTs(lastTs + timeLimitSec * 1000);
    }
  }, [draft.currentPick, draft.onTheClock, draftHasStarted, (draft.league as any)?.settings?.draftTimeLimit, (draft.league as any)?.pickTimeSeconds]);

  // Countdown from the locked deadline
  useEffect(() => {
    const id = setInterval(() => {
      if (!deadlineTs || !draftHasStarted) {
        setSecondsLeft(null);
        return;
      }
      const now = Date.now();
      const secs = Math.max(0, Math.floor((deadlineTs - now) / 1000));
      setSecondsLeft(secs);
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineTs, draftHasStarted]);

  // Derived helpers to match mock UI behavior
  const idToName = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players) {
      const id = p.id || p.$id;
      if (id) m.set(id, p.name || p.displayName || id);
    }
    return m;
  }, [players]);

  const idToPos = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players) {
      const id = p.id || p.$id;
      if (id) m.set(id, p.position || '');
    }
    return m;
  }, [players]);

  const idToTeam = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players) {
      const id = p.id || p.$id;
      if (id) m.set(id, String(p.team || ''));
    }
    return m;
  }, [players]);

  const pickedPlayerIds = useMemo(() => new Set((draft.picks || []).map((p: any) => p.playerId)), [draft.picks]);

  const availablePlayers = useMemo(() => (
    players
      .filter(p => !pickedPlayerIds.has(p.id || p.$id))
      .filter(p => (filterPos ? (String(p.position||'').toUpperCase() === filterPos) : true))
      .filter(p => (filterConf ? (String(p.conference||'') === filterConf) : true))
      .filter(p => (filterTeam ? (String(p.team||'') === filterTeam) : true))
  ), [players, pickedPlayerIds, filterPos, filterConf, filterTeam]);

  const allTeams = useMemo(() => Array.from(new Set(players.map((p:any)=>p.team).filter(Boolean))).sort(), [players]);
  const allConfs = useMemo(() => Array.from(new Set(players.map((p:any)=>p.conference).filter(Boolean))).sort(), [players]);

  const loadInitialData = async () => {
    try {
      // Load users
      if (draft.league?.members) {
        const userDocs = await databases.listDocuments(
          DATABASE_ID,
          'clients',
          [Query.equal('$id', draft.league.members)]
        );
        
        const userMap: Record<string, any> = {};
        userDocs.documents.forEach(doc => {
          userMap[doc.$id] = doc;
        });
        setUsers(userMap);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleDraftPlayer = async (player: DraftPlayer) => {
    if (!draft.isMyTurn) {
      alert("It's not your turn!");
      return;
    }

    try {
      await draft.makePick({ playerId: player.$id || player.playerId });
      // If next on-the-clock is a bot, trigger server autopick
      setTimeout(async () => {
        try {
          const nextIsBot = (draft.onTheClock || '').startsWith('BOT-');
          if (nextIsBot) {
            await fetch(`/api/drafts/${leagueId}/autopick`, { method: 'POST' });
          }
        } catch {}
      }, 300);
    } catch (error) {
      console.error('Error drafting player:', error);
      alert('Failed to draft player. Please try again.');
    }
  };

  if (draft.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Connecting to draft room...</p>
        </div>
      </div>
    );
  }

  const handleProcessRosters = async () => {
    try {
      const response = await fetch('/api/draft/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process rosters');
      }
      
      const result = await response.json();
      alert(`Rosters processed successfully! ${result.processed} teams updated.`);
    } catch (error) {
      console.error('Error processing rosters:', error);
      alert('Failed to process rosters. Please try again.');
    }
  };

  // Mobile interface for small screens
  if (isMobile) {
    // Ensure we have valid data before rendering mobile interface
    const safeAvailablePlayers = availablePlayers || [];
    const safeDraftOrder = draft?.league?.draftOrder || [];
    const safeMyPicks = myPicks || [];
    
    return (
      <MobileDraftErrorBoundary leagueId={leagueId}>
        <MobileDraftInterface
          players={safeAvailablePlayers}
          myPicks={safeMyPicks}
          draftOrder={safeDraftOrder}
          currentPick={draft?.currentPick || null}
          timeRemaining={secondsLeft}
          onPickPlayer={handlePick}
          isMyTurn={isMyTurn || false}
          draftStarted={draftHasStarted || false}
          leagueColors={leagueColors}
        />
      </MobileDraftErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
      {/* Pre-draft banner */}
      {!draftHasStarted && draft.league && (draft.league as any).draftDate && (
        <div className="bg-yellow-600 text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <FiClock className="text-lg" />
            <span className="font-semibold">
              Draft will begin at {new Date((draft.league as any).draftDate).toLocaleString()}
            </span>
          </div>
          <div className="text-sm mt-1 opacity-90">
            You can browse players and prepare your strategy while waiting for the draft to start.
          </div>
        </div>
      )}
      {/* Header - match mock styling */}
      <header className="flex items-center justify-between px-2 lg:px-4 py-2 border-b" style={{ backgroundColor: leagueColors.background.secondary, borderColor: leagueColors.border.medium }}>
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold" style={{ color: leagueColors.text.primary }}>Live Draft</h1>
          {isDraftComplete && (
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: '#F59E0B', color: '#111' }}>
              <FiStar className="text-xs" />
              Draft Complete
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded overflow-hidden border" style={{ borderColor: leagueColors.border.light }}>
            <button
              className={`px-3 py-1 text-xs ${interfaceMode==='dashboard' ? 'font-semibold' : ''}`}
              style={{ backgroundColor: interfaceMode==='dashboard' ? leagueColors.background.card : 'transparent', color: leagueColors.text.primary }}
              onClick={()=>setInterfaceMode('dashboard')}
            >
              Draft Dashboard
            </button>
            <button
              className={`px-3 py-1 text-xs ${interfaceMode==='board' ? 'font-semibold' : ''}`}
              style={{ backgroundColor: interfaceMode==='board' ? leagueColors.background.card : 'transparent', color: leagueColors.text.primary, borderLeft: `1px solid ${leagueColors.border.light}` }}
              onClick={()=>setInterfaceMode('board')}
            >
              Draft Board
            </button>
          </div>
          {!isDraftComplete && draftHasStarted && (
            <div className="px-3 py-1 rounded font-mono text-xs" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}`, color: (secondsLeft ?? 0) <= 10 ? '#B41F24' : leagueColors.text.primary }}>
              {Math.floor((secondsLeft ?? 0) / 60)}:{String((secondsLeft ?? 0) % 60).padStart(2, '0')}
            </div>
          )}
          {!isDraftComplete && !draftHasStarted && draft.league && (draft.league as any).draftDate && (
            <div className="px-3 py-1 rounded font-mono text-xs" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.secondary }}>
              Draft starts at {new Date((draft.league as any).draftDate).toLocaleString()}
            </div>
          )}
        </div>
      </header>
      {/* Recent picks ticker (match mock layout) */}
      {interfaceMode==='dashboard' && (
        <div className="mx-auto px-2 lg:px-4 mt-3 w-full overflow-x-auto whitespace-nowrap py-2 rounded-md" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
          {draft.picks.length === 0 ? (
            <div className="flex items-center gap-4">
              <span className="px-3 text-sm font-semibold" style={{ color: leagueColors.text.primary }}>Draft Order:</span>
              {(draft.league?.draftOrder || []).map((uid: string, idx: number) => (
                <span key={uid} className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: idx === 0 && draftHasStarted ? leagueColors.primary : leagueColors.background.overlay, 
                    border: `1px solid ${idx === 0 && draftHasStarted ? leagueColors.primary : leagueColors.border.light}`, 
                    color: idx === 0 && draftHasStarted ? '#fff' : leagueColors.text.primary 
                  }}>
                  <span className="font-bold">#{idx + 1}</span>
                  <span>{users[uid]?.name || (uid.startsWith('BOT-') ? uid : 'Team')}</span>
                </span>
              ))}
            </div>
          ) : (
            draft.picks.slice(-12).map((p, i) => {
              const pos = (p.playerPosition || '').toUpperCase();
              const bg = pos === 'QB' ? '#3B82F6' : pos === 'RB' ? '#10B981' : pos === 'WR' ? '#F59E0B' : pos === 'TE' ? '#8B5CF6' : pos === 'K' ? '#6B7280' : '#111827';
              const fg = pos === 'K' ? leagueColors.text.primary : '#fff';
              return (
                <span key={`${p.$id || p.playerId}-${i}`} className="inline-flex items-center gap-2 text-xs px-3 py-1 m-1 rounded-full" style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                  <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold" style={{ backgroundColor: bg, color: fg }}>{pos || '—'}</span>
                  <span>{p.playerName || p.playerId}</span>
                  <span className="text-[10px]" style={{ color: leagueColors.text.secondary }}>{users[p.authUserId || p.userId]?.name ? users[p.authUserId || p.userId].name : 'Team'}</span>
                </span>
              );
            })
          )}
        </div>
      )}
      {/* Under-ticker meta row: pick info + timer */}
      {interfaceMode==='dashboard' && (
        <div className="mx-auto px-4 mt-2 mb-2 flex items-center justify-between text-xs text-gray-700">
          <div>
            {draftHasStarted ? (
              <>Round {draft.currentRound} • Overall #{draft.currentPick} • On the clock: {draft.onTheClock ? (users[draft.onTheClock]?.name || 'Team') : '-'}</>
            ) : (
              <span style={{ color: leagueColors.text.secondary }}>Draft has not started yet</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {draftHasStarted ? (
              <div className="px-3 py-1 rounded font-mono border" style={{ borderColor: '#e5e7eb' }}>
                {Math.floor((secondsLeft ?? 0) / 60)}:{String((secondsLeft ?? 0) % 60).padStart(2, '0')}
              </div>
            ) : (
              draft.league && (draft.league as any).draftDate && (
                <div className="px-3 py-1 rounded text-xs" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.secondary }}>
                  Starts at {new Date((draft.league as any).draftDate).toLocaleTimeString()}
                </div>
              )
            )}
          </div>
        </div>
      )}
      {interfaceMode==='board' ? (
        <div className="p-4">
          <div className="rounded border" style={{ borderColor: leagueColors.border.light, backgroundColor: leagueColors.background.card }}>
            <DraftBoard
              picks={(draft.picks || []).map(p=>({
                overall: p.pickNumber,
                round: p.round,
                slot: undefined,
                userId: p.authUserId || p.userId,
                playerName: p.playerName,
                playerId: p.playerId,
                position: p.playerPosition,
                team: p.playerTeam,
              }))}
              numTeams={draft.league?.draftOrder?.length || 12}
              rounds={draft.league?.draftRounds || 15}
              currentOverall={draft.currentPick}
              slotLabels={(draft.league?.draftOrder||[]).map((uid: string)=> users[uid]?.name || 'Team')}
            />
          </div>
        </div>
      ) : (
        // Mirror mock three-panel dashboard
        (<section className="mx-auto px-0 py-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left: My Team */}
          <aside className="lg:col-span-3 rounded-none p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="font-medium text-sm mb-2" style={{ color: leagueColors.text.primary }}>My Team</h2>
            <div className="space-y-2">
              {draft.picks.filter(p=>(p.authUserId===user?.$id || p.userId===user?.$id)).length===0 ? (
                <div className="text-xs" style={{ color: leagueColors.text.muted }}>No players drafted yet</div>
              ) : (
                draft.picks.filter(p=>(p.authUserId===user?.$id || p.userId===user?.$id)).map((p,i)=> (
                  <div key={`${p.playerId}-${i}`} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${leagueColors.border.light}` }}>
                    <span className="font-medium">{p.playerName || idToName.get(p.playerId) || p.playerId}</span>
                    <span className="text-gray-500">{String(p.playerPosition||'').toUpperCase()}</span>
                  </div>
                ))
              )}
            </div>
          </aside>
          {/* Middle: Available Players */}
          <div className="lg:col-span-6 rounded-none p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="font-medium text-sm mb-2" style={{ color: leagueColors.text.primary }}>Available Players</h2>
            {/* Filters */}
            {viewMode === 'players' && (
            <div className="flex items-center gap-2 mb-3">
              <select className="rounded px-2 py-1 text-xs" value={filterPos} onChange={(e)=>setFilterPos(e.target.value)}
                style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                <option value="">All Positions</option>
                {['QB','RB','WR','TE','K'].map(p=> (<option key={p} value={p}>{p}</option>))}
              </select>
              <select className="rounded px-2 py-1 text-xs" value={filterConf} onChange={(e)=>setFilterConf(e.target.value)}
                style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                <option value="">All Conferences</option>
                {allConfs.map(c=> (<option key={c} value={String(c)}>{String(c)}</option>))}
              </select>
              <select className="rounded px-2 py-1 text-xs" value={filterTeam} onChange={(e)=>setFilterTeam(e.target.value)}
                style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                <option value="">All Teams</option>
                {allTeams.map(t=> (<option key={t} value={String(t)}>{String(t)}</option>))}
              </select>
              {(filterPos || filterConf || filterTeam) && (
                <button className="ml-auto text-xs px-2 py-1 rounded" onClick={()=>{setFilterPos(''); setFilterConf(''); setFilterTeam('');}}
                  style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                  Clear
                </button>
              )}
            </div>
            )}
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
              {viewMode === 'players' ? (
                availablePlayers.length > 0 ? (
                <table className="w-full text-sm" style={{ color: leagueColors.text.primary }}>
                  <thead>
                    <tr className="text-xs" style={{ color: leagueColors.text.secondary }}>
                      <th className="text-left py-2 px-2">Player</th>
                      <th className="text-center py-2 px-1 w-12">Pos</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-1 w-16">Full YR Proj</th>
                      <th className="text-center py-2 px-1 w-14">ADP</th>
                      <th className="text-center py-2 px-2 w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availablePlayers.slice(0, 200).map((pl: any, idx: number) => (
                      <tr key={pl.id || pl.$id} className="border-t" style={{ borderColor: leagueColors.border.light }}>
                        <td className="py-2 px-2 font-medium">{pl.name || pl.displayName || (pl.$id?.slice(0, 8))}</td>
                        <td className="py-2 px-1 text-center">
                          {(() => {
                            const pos = (pl.position || '').toUpperCase();
                            const bg = pos === 'QB' ? '#3B82F6'
                              : pos === 'RB' ? '#10B981'
                              : pos === 'WR' ? '#F59E0B'
                              : pos === 'TE' ? '#8B5CF6'
                              : pos === 'K' ? '#6B7280'
                              : '#111827';
                            const fg = pos === 'K' ? leagueColors.text.primary : '#fff';
                            return (
                              <span className="inline-flex items-center justify-center w-9 h-5 rounded text-xs font-bold"
                                    style={{ backgroundColor: bg, color: fg }}>{pos || '-'}</span>
                            );
                          })()}
                        </td>
                        <td className="py-2 px-2" style={{ color: leagueColors.text.secondary }}>{pl.team || '-'}</td>
                        <td className="py-2 px-1 text-center font-semibold">{pl.projectedPoints ?? pl.fantasyPoints ?? '-'}</td>
                        <td className="py-2 px-1 text-center" style={{ color: leagueColors.text.secondary }}>{pl.adp?.toFixed ? pl.adp.toFixed(1) : '-'}</td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => {
                              const playerId = pl.id || pl.$id || pl.playerId;
                              console.log('[Draft] Selecting player:', { 
                                playerId, 
                                playerName: pl.name,
                                playerData: pl 
                              });
                              handleDraftPlayer({ 
                                $id: playerId,
                                playerId: playerId,
                                playerName: pl.name,
                                position: pl.position,
                                team: pl.team
                              } as any);
                            }}
                            disabled={!draftHasStarted || (!draft.isMyTurn && draft.onTheClock !== user?.$id)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                              (!draftHasStarted || (!draft.isMyTurn && draft.onTheClock !== user?.$id)) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                            }`}
                            style={{ backgroundColor: '#B41F24', color: '#fff', border: '1px solid #8B0000' }}
                          >
                            {!draftHasStarted ? 'WAITING' : 'DRAFT'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : players.length === 0 ? (
                  <div className="text-sm" style={{ color: leagueColors.text.secondary }}>
                    Loading players...
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: leagueColors.text.secondary }}>
                    All players have been drafted!
                  </div>
                )
              ) : (
                <div className="overflow-auto">
                  <DraftBoard
                    picks={(draft.picks || []).map(p=>({
                      overall: p.pickNumber,
                      round: p.round,
                      slot: undefined,
                      userId: p.authUserId || p.userId,
                      playerName: p.playerName,
                      playerId: p.playerId,
                      position: p.playerPosition,
                      team: p.playerTeam,
                    }))}
                    numTeams={draft.league?.draftOrder?.length || 12}
                    rounds={draft.league?.draftRounds || 15}
                    currentOverall={draft.currentPick}
                    slotLabels={(draft.league?.draftOrder||[]).map((uid: string)=> users[uid]?.name || 'Team')}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Right: Teams viewer */}
          <aside className="lg:col-span-3 rounded-none p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
            <h2 className="font-medium text-sm mb-2" style={{ color: leagueColors.text.primary }}>Teams</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm" style={{ color: leagueColors.text.secondary }}>View:</span>
              <select className="rounded px-2 py-1 text-sm w-full" value={teamView} onChange={(e)=>setTeamView(e.target.value)} style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                <option value="">—</option>
                {(draft.league?.draftOrder || []).map((uid: string, idx: number)=> (
                  <option key={uid} value={String(idx+1)}>Team {idx+1} — {users[uid]?.name || 'Team'}</option>
                ))}
              </select>
            </div>
            {teamView && (
              <div className="space-y-2 max-h-[60vh] overflow-auto">
                {draft.picks.filter((p:any)=> String(((draft.league?.draftOrder || []).indexOf(p.authUserId || p.userId))+1)===teamView).map((p:any, i:number)=> (
                  <div key={`${p.playerId}-${i}`} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${leagueColors.border.light}` }}>
                    <span>#{p.pickNumber}</span>
                    <span className="font-medium">{p.playerName||idToName.get(p.playerId)||p.playerId}</span>
                    <span className="text-gray-500">R{p.round}</span>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>)
      )}
    </div>
  );
} 