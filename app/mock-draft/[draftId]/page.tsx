// app/draft/[draftId]/page.tsx
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDraftCoreMock } from '@lib/draft/core';
import Link from 'next/link';
import { leagueColors } from '@lib/theme/colors';
import DraftBoard from '@components/features/draft/DraftBoard';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

// Position color mapping for backgrounds
function getPositionBgColor(position: string): string {
  switch (position?.toUpperCase()) {
    case 'QB':
      return '#3B82F6'; // Blue
    case 'RB':
      return '#10B981'; // Green  
    case 'WR':
      return '#EF4444'; // Red
    case 'TE':
      return '#8B5CF6'; // Purple
    case 'K':
      return '#6B7280'; // Gray
    default:
      return '#9CA3AF'; // Default gray
  }
}

type TurnResp = { 
  ok: boolean; 
  turn?: { 
    draftId: string; 
    overall: number; 
    round: number; 
    slot: number; 
    participantId: string; 
    deadlineAt: string;
  }; 
  serverNow?: string;
};
type ResultsResp = { draft: any; participants: any[]; picks: any[] };

export default function DraftPage({ params }: { params: { draftId: string } }) {
  const draftId = params.draftId;
  const [me, setMe] = useState<{ participantId?: string; slot?: number }>({});
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState<TurnResp['turn'] | null>(null);
  const [results, setResults] = useState<ResultsResp | null>(null);
  const unsubRef = useRef<() => void>();

  // Refresh all data
  async function refreshAll() {
    try {
      // Fetch current turn
      const turnResp = await api<TurnResp>(`/api/mock-draft/turn/${draftId}`);
      setTurn(turnResp.turn || null);
      
      // Fetch results
      const resultsResp = await api<ResultsResp>(`/api/mock-draft/results/${draftId}`);
      setResults(resultsResp);
    } catch (e: any) {
      console.error('Failed to refresh:', e);
    }
  }

  // Join draft as a user
  async function joinAs(userId: string, displayName: string) {
    try {
      setLoading(true);
      const r = await api<{ ok: boolean; participantId: string; slot: number }>('/api/mock-draft/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ draftId, clientId: userId, displayName })
      });
      setMe({ participantId: r.participantId, slot: r.slot });
      await refreshAll();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const draftCore = useDraftCoreMock(draftId);

  useEffect(() => {
    draftCore.refresh();
    refreshAll(); // Load initial turn and results
    // Auto-claim seat based on setup page selection, if present
    try {
      const storedId = localStorage.getItem('mockDraftUserId');
      const storedName = localStorage.getItem('mockDraftUserName');
      if (storedId && storedName) {
        joinAs(storedId, storedName);
      }
    } catch {}
    
    // Load available players from your existing endpoint
    fetch('/api/draft/players')
      .then(res => res.json())
      .then(data => setPlayers(data.players || data || []))
      .catch(() => setPlayers([]));
    
    // Subscribe to realtime updates
    // Realtime handled in draft core mock
    
    // Poll for turn updates
    const poll = setInterval(() => {
      Promise.resolve(draftCore.refresh()).catch(() => {});
      refreshAll(); // Also refresh turn and results
    }, 3000);
    
    return () => {
      unsubRef.current?.();
      clearInterval(poll);
    };
  }, [draftId]);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [deadlineTs, setDeadlineTs] = useState<number | null>(null);
  const [teamView, setTeamView] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterConf, setFilterConf] = useState<string>('');
  const [filterPos, setFilterPos] = useState<string>('');
  // Top-level interface: 'dashboard' (three-panel) vs 'board' (full-screen draft board)
  const [interfaceMode, setInterfaceMode] = useState<'dashboard'|'board'>('dashboard');
  const [viewMode, setViewMode] = useState<string>('players');

  // Lock in the server deadline when the pick changes; do not bump on background refreshes
  useEffect(() => {
    if (turn?.deadlineAt) {
      setDeadlineTs(new Date(turn.deadlineAt).getTime());
    } else {
      setDeadlineTs(null);
    }
  }, [turn?.overall, turn?.deadlineAt]);

  // Local countdown from the locked deadline
  useEffect(() => {
    const timer = setInterval(() => {
      if (deadlineTs) {
        const now = Date.now();
        const secs = Math.max(0, Math.floor((deadlineTs - now) / 1000));
        setSecondsLeft(secs);
      } else {
        setSecondsLeft(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadlineTs]);

  // Fixed time limit for current pick (prevents jitter)
  const timeLimitForPick = useMemo(() => {
    if (!turn) return 0;
    const msLeft = new Date(turn.deadlineAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(msLeft / 1000));
  }, [turn?.overall, turn?.deadlineAt]);

  async function draftPlayer(playerId: string) {
    if (!me.participantId) return alert('Join first');
    
    try {
      setLoading(true);
      await draftCore.makePick({ playerId, participantId: me.participantId });
    } catch (e: any) {
      alert('Failed to draft player: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Filter out already drafted players
  const pickedPlayerIds = new Set(draftCore.picks?.map((p: any) => p.playerId) || []);
  const availablePlayers = players
    .filter(p => !pickedPlayerIds.has(p.id || p.$id))
    .filter(p => (filterPos ? (String(p.position||'').toUpperCase() === filterPos) : true))
    .filter(p => (filterConf ? (String(p.conference||'') === filterConf) : true))
    .filter(p => (filterTeam ? (String(p.team||'') === filterTeam) : true));

  const allTeams = useMemo(() => Array.from(new Set(players.map(p => p.team).filter(Boolean))).sort(), [players]);
  const allConfs = useMemo(() => Array.from(new Set(players.map(p => p.conference).filter(Boolean))).sort(), [players]);

  // Map playerId to name
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

  // Recent picks ticker (last 12)
  const recentPicks = (draftCore.picks || [])
    .slice(-12)
    .map((p: any) => ({
      overall: p.overall,
      playerId: p.playerId,
      slot: p.slot,
      name: idToName.get(p.playerId),
      pos: idToPos.get(p.playerId)
    }));

  // My team picks
  const myPicks = me.participantId
    ? (draftCore.picks || []).filter((p: any) => p.participantId === me.participantId)
    : [];

  // Prepare board props
  const boardPicks = useMemo(() => {
    const list = (results?.picks || []).map((p: any) => ({
      overall: p.overall,
      round: p.round,
      slot: p.slot,
      userId: p.participantId,
      playerName: p.playerName || idToName.get(p.playerId),
      playerId: p.playerId,
      position: p.position || idToPos.get(p.playerId) || '',
      team: idToTeam.get(p.playerId) || '',
    }));
    return list;
  }, [results?.picks, idToName, idToPos, idToTeam]);

  const boardNumTeams = results?.draft?.numTeams || 8;
  const boardRounds = results?.draft?.rounds || 15;
  const currentOverall = turn?.overall ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: leagueColors.background.main, color: leagueColors.text.primary }}>
      <header className="flex items-center justify-between px-2 lg:px-4 py-2 border-b" style={{ backgroundColor: leagueColors.background.secondary, borderColor: leagueColors.border.medium }}>
        <div>
          <h1 className="text-sm font-semibold flex items-center gap-3" style={{ color: leagueColors.text.primary }}>
            Live Draft
            {turn && (
              <span className="flex items-center gap-1 text-xs" style={{ color: leagueColors.text.secondary }}>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                On the clock: Team #{turn.slot}
              </span>
            )}
          </h1>
          {me.participantId && (
            <p className="text-xs" style={{ color: leagueColors.text.muted }}>You are Team #{me.slot}</p>
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
          {results?.draft?.status === 'complete' && (
            <Link href={`/mock-draft/${draftId}/results`} className="px-3 py-2 rounded border" style={{ borderColor: leagueColors.border.light, color: leagueColors.text.primary }}>
              View Results
            </Link>
          )}
        </div>
      </header>
      {/* Recent picks ticker (only in DraftDashboard mode) */}
      {interfaceMode==='dashboard' && (
      <div className="mx-auto px-2 lg:px-4 mt-3 w-full overflow-x-auto whitespace-nowrap py-2 rounded-md" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
        {recentPicks.length === 0 ? (
          <span className="px-3 text-sm" style={{ color: leagueColors.text.secondary }}>No picks yet</span>
        ) : (
          recentPicks.map((p, i) => {
            const pos = (p.pos || '').toUpperCase();
            const bg = pos === 'QB' ? '#3B82F6' : pos === 'RB' ? '#10B981' : pos === 'WR' ? '#F59E0B' : pos === 'TE' ? '#8B5CF6' : pos === 'K' ? '#6B7280' : '#111827';
            const fg = pos === 'K' ? leagueColors.text.primary : '#fff';
            return (
              <span key={`${p.overall}-${i}`} className="inline-flex items-center gap-2 text-xs px-3 py-1 m-1 rounded-full" style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
                <span className="inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold" style={{ backgroundColor: bg, color: fg }}>{pos || '—'}</span>
                <span>{p.name || p.playerId}</span>
                <span className="text-[10px]" style={{ color: leagueColors.text.secondary }}>T{p.slot}</span>
              </span>
            );
          })
        )}
      </div>
      )}
      {/* Under-ticker meta row: pick info + timer */}
      <div className="mx-auto px-2 lg:px-4 mt-2 mb-2 flex items-center justify-between text-xs">
        {turn ? (
          <div style={{ color: leagueColors.text.secondary }}>
            Round {turn.round} • Overall #{turn.overall} • On the clock: Team #{turn.slot}
          </div>
        ) : <div />}
        <div className="flex items-center gap-3">
          {/* Removed redundant Available/Draft Board toggle inside dashboard */}
          {turn && (
            <div className="px-3 py-1 rounded font-mono" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}`, color: (secondsLeft ?? 0) <= 10 ? '#B41F24' : leagueColors.text.primary }}>
              {Math.floor((secondsLeft ?? 0) / 60)}:{String((secondsLeft ?? 0) % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      {/* Interface rendering: DraftBoard full-screen vs DraftDashboard (three panels) */}
      {interfaceMode==='board' ? (
        <section className="mx-auto px-2 lg:px-4 py-4">
          <div className="rounded border" style={{ borderColor: leagueColors.border.light, backgroundColor: leagueColors.background.card }}>
            <DraftBoard
              picks={boardPicks}
              numTeams={boardNumTeams}
              rounds={boardRounds}
              currentOverall={currentOverall}
              slotLabels={(results?.participants || []).sort((a:any,b:any)=>a.slot-b.slot).map((p:any)=>`Team ${p.slot} — ${p.displayName}`)}
            />
          </div>
        </section>
      ) : (
      <section className="mx-auto px-0 py-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: My Team */}
        <aside className="lg:col-span-3 rounded-none p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
          <h2 className="font-medium text-sm mb-2" style={{ color: leagueColors.text.primary }}>My Team</h2>
          {(() => {
            // Build slot layout: QB(2), RB(4), WR(4), TE(2), K(1) as a simple example
            const slotOrder = [
              { key: 'QB', count: 2 },
              { key: 'RB', count: 4 },
              { key: 'WR', count: 4 },
              { key: 'TE', count: 2 },
              { key: 'K', count: 1 },
            ];
            const picks = (draftCore.picks || []).filter((p:any)=> p.participantId === me.participantId);
            const takenByPos: Record<string, any[]> = {};
            for (const pos of ['QB','RB','WR','TE','K']) takenByPos[pos] = [];
            for (const p of picks) {
              const pl = players.find(pp => (pp.id||pp.$id) === p.playerId);
              const pos = pl?.position || 'FLEX';
              (takenByPos[pos] = takenByPos[pos] || []).push({ ...p, name: pl?.name, team: pl?.team });
            }
            return (
              <div className="space-y-3">
                {slotOrder.map(({ key, count }) => (
                  <div key={key}>
                    <div className="text-xs font-semibold mb-1" style={{ color: leagueColors.text.secondary }}>{key}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: count }, (_, i) => {
                        const pick = takenByPos[key][i];
                        return (
                          <div key={i} className="px-2 py-2 rounded border text-xs" 
                               style={{ 
                                 borderColor: pick ? 'transparent' : leagueColors.border.light,
                                 backgroundColor: pick ? getPositionBgColor(key) : 'transparent',
                                 color: pick ? '#FFFFFF' : leagueColors.text.muted
                               }}>
                            {pick ? (
                              <div>
                                <div className="font-bold text-white truncate">
                                  {pick.playerName || pick.name || idToName.get(pick.playerId) || 'Unknown'}
                                </div>
                                <div className="text-white/80 text-xs truncate">
                                  {pick.team || 'Team'}
                                </div>
                              </div>
                            ) : (
                              <span>Empty</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
                          onClick={() => draftPlayer(pl.id || pl.$id)}
                          disabled={loading || !turn || !(me.participantId && me.participantId === turn.participantId)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            loading || !turn || !(me.participantId && me.participantId === turn.participantId)
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:shadow-md'
                          }`}
                          style={{ backgroundColor: '#B41F24', color: '#fff', border: '1px solid #8B0000' }}
                        >
                          DRAFT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : players.length === 0 ? (
                <div className="text-sm" style={{ color: leagueColors.text.secondary }}>
                  Loading players... You can still test seat claiming & turns.
                </div>
              ) : (
                <div className="text-sm" style={{ color: leagueColors.text.secondary }}>
                  All players have been drafted!
                </div>
              )
            ) : (
              // Inline board retained for dashboard mode
              (<div className="overflow-auto">
                <DraftBoard
                  picks={boardPicks}
                  numTeams={boardNumTeams}
                  rounds={boardRounds}
                  currentOverall={currentOverall}
                  slotLabels={(results?.participants || []).sort((a:any,b:any)=>a.slot-b.slot).map((p:any)=>`Team ${p.slot} — ${p.displayName}`)}
                />
              </div>)
            )}
          </div>
        </div>

        {/* Right: Team Viewer */}
        <aside className="lg:col-span-3 rounded-none p-4" style={{ backgroundColor: leagueColors.background.card, border: `1px solid ${leagueColors.border.light}` }}>
          <h2 className="font-medium text-sm mb-2" style={{ color: leagueColors.text.primary }}>Teams</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm" style={{ color: leagueColors.text.secondary }}>View:</span>
            <select className="rounded px-2 py-1 text-sm w-full" value={teamView} onChange={(e)=>setTeamView(e.target.value)} style={{ backgroundColor: leagueColors.background.overlay, border: `1px solid ${leagueColors.border.light}`, color: leagueColors.text.primary }}>
              <option value="">—</option>
              {results?.participants?.map((p:any)=> (
                <option key={p.$id||p.id} value={String(p.slot)}>Team {p.slot} — {p.displayName}</option>
              ))}
            </select>
          </div>
          {teamView && (
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {results?.picks?.filter((p:any)=> String(p.slot)===teamView).map((p:any)=> (
                <div key={p.$id||p.id} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${leagueColors.border.light}` }}>
                  <span>#{p.overall}</span>
                  <span className="font-medium">{p.playerName||idToName.get(p.playerId)||p.playerId}</span>
                  <span className="text-gray-500">R{p.round}</span>
                </div>
              ))}
              {results?.picks?.filter((p:any)=> String(p.slot)===teamView).length===0 && (
                <div className="text-xs" style={{ color: leagueColors.text.muted }}>No picks yet.</div>
              )}
            </div>
          )}
        </aside>
      </section>
      )}
      {/* Draft Board moved into center panel when toggled */}
    </div>
  );
}
