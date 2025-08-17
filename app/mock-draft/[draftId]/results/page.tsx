// app/draft/[draftId]/results/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Client, Realtime } from 'appwrite';

type ResultsPayload = {
  draft: any;
  participants: any[];
  picks: any[];
};

function useRealtime(draftId: string, onEvent: () => void) {
  const unsubRef = useRef<() => void>();
  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
    
    if (!endpoint || !projectId) return;
    
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);
    const rt = new Realtime(client);
    const subs = [
      rt.subscribe([`databases.*.collections.mock_draft_picks.documents`], (e) => {
        if (e.payload?.draftId === draftId) onEvent();
      }),
      rt.subscribe([`databases.*.collections.mock_drafts.documents`], (e) => {
        if (e.payload?.$id === draftId) onEvent();
      }),
    ];
    unsubRef.current = () => subs.forEach((s) => s());
    return () => unsubRef.current?.();
  }, [draftId, onEvent]);
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) => headers.map((h) => esc(r[h])).join(',')).join('\n');
  return headers.join(',') + '\n' + body;
}

function download(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DraftResultsPage({ params }: { params: { draftId: string } }) {
  const draftId = params.draftId;
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setError(null);
      const res = await fetchJSON<ResultsPayload>(`/api/mock-draft/results/${draftId}`);
      setData(res);
    } catch (e: any) {
      setError(e.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  useRealtime(draftId, refresh);

  useEffect(() => {
    refresh();
  }, [draftId]);

  const participantsById = useMemo(() => {
    const map = new Map<string, any>();
    data?.participants?.forEach((p) => map.set(p.$id, p));
    return map;
  }, [data?.participants]);

  const picksWithNames = useMemo(() => {
    return (data?.picks || []).map((p) => ({
      ...p,
      participantName: participantsById.get(p.participantId)?.displayName || `Team ${p.slot}`,
      playerLabel: p.playerName || p.playerDisplayName || p.player?.name || p.playerId || 'Unknown',
    }));
  }, [data?.picks, participantsById]);

  const totals = useMemo(() => {
    const total = data?.picks?.length || 0;
    const rounds = data?.draft?.rounds || 15;
    const teams = data?.draft?.numTeams || 8;
    const expected = rounds * teams;
    const status = data?.draft?.status ?? 'unknown';
    const cfg = typeof data?.draft?.config === 'string' ? JSON.parse(data.draft.config) : (data?.draft?.config || {});
    const autopicks = cfg?.metrics?.autopicksCount ?? 0;
    const seed = cfg?.seed;
    return { total, expected, rounds, teams, status, autopicks, seed };
  }, [data]);

  const perTeam = useMemo(() => {
    const bySlot: Record<number, { picks: any[] }> = {};
    picksWithNames.forEach((p) => {
      bySlot[p.slot] = bySlot[p.slot] || { picks: [] };
      bySlot[p.slot].picks.push(p);
    });
    return bySlot;
  }, [picksWithNames]);

  const csvRows = useMemo(() => {
    return picksWithNames.map((p) => ({
      draftId,
      overall: p.overall,
      round: p.round,
      slot: p.slot,
      participant: p.participantName,
      player: p.playerLabel,
      playerId: p.playerId,
      autopick: p.autopick ? 'YES' : 'NO',
      pickedAt: p.pickedAt,
    }));
  }, [picksWithNames, draftId]);

  if (loading) return <div className="p-8">Loading results…</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8">No data.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draft Results</h1>
          <p className="text-gray-500 text-sm">
            Draft ID: <span className="font-mono">{draftId}</span> • Status: <span className="font-semibold">{totals.status}</span>
          </p>
          <p className="text-gray-500 text-xs">
            Rounds: {totals.rounds} • Teams: {totals.teams} • Picks: {totals.total}/{totals.expected} 
            {totals.seed ? <> • Seed: <span className="font-mono">{totals.seed}</span></> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/mock-draft/${draftId}`} className="px-3 py-2 rounded bg-black text-white">
            Back to Live
          </Link>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => download(
              `${draftId}-results.json`, 
              JSON.stringify({ draft: data?.draft, participants: data?.participants, picks: data?.picks }, null, 2), 
              'application/json'
            )}
          >
            Download JSON
          </button>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => download(`${draftId}-results.csv`, toCSV(csvRows), 'text/csv')}
          >
            Download CSV
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Total Picks</div>
          <div className="text-2xl font-semibold">{totals.total}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Expected Picks</div>
          <div className="text-2xl font-semibold">{totals.expected}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Autopicks</div>
          <div className="text-2xl font-semibold">{totals.autopicks}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-gray-500">Rounds × Teams</div>
          <div className="text-2xl font-semibold">{totals.rounds} × {totals.teams}</div>
        </div>
      </section>

      {/* Per-team summaries */}
      <section className="space-y-4">
        <h2 className="font-semibold">Team Summaries</h2>
        <div className={`grid gap-4 ${totals.teams <= 8 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : totals.teams <= 12 ? 'grid-cols-1 md:grid-cols-3 xl:grid-cols-6' : 'grid-cols-1 md:grid-cols-4 xl:grid-cols-8'}`}>
          {Array.from({ length: totals.teams }).map((_, idx) => {
            const slot = idx + 1;
            const team = perTeam[slot] || { picks: [] };
            const name = data.participants.find((p) => p.slot === slot)?.displayName || `Team ${slot}`;
            const userId = data.participants.find((p) => p.slot === slot)?.userId;
            const userType = data.participants.find((p) => p.slot === slot)?.userType;
            return (
              <div key={slot} className="rounded-xl border p-4">
                <div className="font-semibold mb-1">
                  Team {slot}: {name}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {team.picks.length} picks • {userType === 'human' ? `Human${userId ? ` (${userId})` : ''}` : 'Bot'}
                </div>
                <div className="flex flex-col gap-1 max-h-[220px] overflow-auto text-sm">
                  {team.picks
                    .sort((a: any, b: any) => a.overall - b.overall)
                    .map((p: any) => (
                      <div key={p.overall} className="flex items-center justify-between">
                        <span className="truncate">
                          #{p.overall} • {p.playerLabel}
                        </span>
                        <span className="text-gray-500 text-xs">
                          R{p.round}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full picks table */}
      <section className="space-y-2">
        <h2 className="font-semibold">All Picks</h2>
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Overall</th>
                <th className="px-3 py-2 text-left font-medium">Round</th>
                <th className="px-3 py-2 text-left font-medium">Slot</th>
                <th className="px-3 py-2 text-left font-medium">Team</th>
                <th className="px-3 py-2 text-left font-medium">Player</th>
                <th className="px-3 py-2 text-left font-medium">Auto</th>
                <th className="px-3 py-2 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {picksWithNames
                .sort((a: any, b: any) => a.overall - b.overall)
                .map((p: any) => (
                  <tr key={p.overall} className="border-t">
                    <td className="px-3 py-2 font-mono">{p.overall}</td>
                    <td className="px-3 py-2">R{p.round}</td>
                    <td className="px-3 py-2">#{p.slot}</td>
                    <td className="px-3 py-2">{p.participantName}</td>
                    <td className="px-3 py-2">{p.playerLabel}</td>
                    <td className="px-3 py-2">{p.autopick ? 'YES' : ''}</td>
                    <td className="px-3 py-2 text-gray-500">
                      {p.pickedAt ? new Date(p.pickedAt).toLocaleString() : ''}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
