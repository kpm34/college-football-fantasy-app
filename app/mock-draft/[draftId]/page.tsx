// app/draft/[draftId]/page.tsx
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDraftCoreMock } from '@/lib/draft/core';
import Link from 'next/link';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
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
        body: JSON.stringify({ draftId, userId, displayName })
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
    
    // Load available players from your existing endpoint
    fetch('/api/draft/players')
      .then(res => res.json())
      .then(data => setPlayers(data.players || data || []))
      .catch(() => setPlayers([]));
    
    // Subscribe to realtime updates
    // Realtime handled in draft core mock
    
    // Poll for turn updates
    const poll = setInterval(() => {
      draftCore.refresh()
        .catch(() => {});
      refreshAll(); // Also refresh turn and results
    }, 3000);
    
    return () => {
      unsubRef.current?.();
      clearInterval(poll);
    };
  }, [draftId]);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Recompute seconds left every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (turn) {
        const now = Date.now();
        const deadline = new Date(turn.deadlineAt).getTime();
        const secs = Math.max(0, Math.floor((deadline - now) / 1000));
        setSecondsLeft(secs);
      } else {
        setSecondsLeft(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [turn]);

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
  const availablePlayers = players.filter(p => !pickedPlayerIds.has(p.id || p.$id));

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Draft</h1>
          {turn && (
            <p className="text-sm text-gray-500">
              Round {turn.round} • Overall #{turn.overall} • On the clock: Team #{turn.slot}
            </p>
          )}
          {me.participantId && (
            <p className="text-xs text-gray-400">You are Team #{me.slot}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!me.participantId && (
            <button
              className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
              onClick={() => {
                const userId = prompt('User ID?') || `user-${Date.now()}`;
                const displayName = prompt('Display name?') || 'Guest';
                joinAs(userId, displayName);
              }}
              disabled={loading}
            >
              Join / Claim Seat
            </button>
          )}
          <Link href={`/mock-draft/${draftId}/results`} className="px-3 py-2 rounded border">
            View Results
          </Link>
          <div className="px-3 py-2 rounded border">
            {secondsLeft !== null ? `${secondsLeft}s left` : '—'}
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border rounded-xl p-4">
          <h2 className="font-semibold mb-2">Draft Board</h2>
          <div className="overflow-auto max-h-[70vh]">
            {(() => {
              const numTeams = results?.draft?.numTeams || 8;
              const rounds = results?.draft?.rounds || 15;
              return (
                <div className="space-y-3">
                  {[...Array(rounds)].map((_, rIdx) => (
                    <div key={rIdx} className="border rounded p-2">
                      <div className="text-xs text-gray-500 mb-2">Round {rIdx + 1}</div>
                      <div 
                        className="grid gap-2" 
                        style={{ 
                          gridTemplateColumns: `repeat(${Math.min(numTeams, 12)}, minmax(0,1fr))`,
                          ...(numTeams > 12 ? { gridAutoRows: 'min-content' } : {})
                        }}
                      >
                        {[...Array(numTeams)].map((_, sIdx) => {
                          const overall = rIdx * numTeams + (rIdx % 2 === 0 ? (sIdx + 1) : (numTeams - sIdx));
                          const pick = results?.picks?.find(p => p.overall === overall);
                          const isCurrentPick = turn?.overall === overall;
                          return (
                            <div
                              key={sIdx}
                              className={`border rounded p-2 min-h-[48px] text-xs ${
                                isCurrentPick ? 'bg-yellow-50 border-yellow-400' : ''
                              } ${pick ? 'bg-gray-50' : ''}`}
                            >
                              {pick ? (
                                <div>
                                  <div className="font-medium truncate">
                                    {pick.playerName || pick.playerId?.slice(0, 8)}
                                  </div>
                                  <div className="text-gray-500">T{pick.slot}</div>
                                </div>
                              ) : (
                                <div className="text-gray-400">
                                  {isCurrentPick ? '⏱️' : `T${rIdx % 2 === 0 ? sIdx + 1 : numTeams - sIdx}`}
                                </div>
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
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <h2 className="font-semibold mb-2">Available Players</h2>
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
            {availablePlayers.length > 0 ? (
              availablePlayers.slice(0, 200).map((pl: any) => (
                <button
                  key={pl.id || pl.$id}
                  onClick={() => draftPlayer(pl.id || pl.$id)}
                  disabled={loading || !turn || me.participantId !== turn.participantId}
                  className={`text-left border rounded p-2 hover:bg-gray-50 ${
                    turn && me.participantId === turn.participantId
                      ? 'cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="font-medium">
                    {pl.name || pl.displayName || (pl.$id?.slice(0, 8))}
                  </div>
                  {pl.position && pl.team && (
                    <div className="text-xs text-gray-500">
                      {pl.position} • {pl.team}
                    </div>
                  )}
                </button>
              ))
            ) : players.length === 0 ? (
              <div className="text-sm text-gray-500">
                Loading players... You can still test seat claiming & turns.
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                All players have been drafted!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
