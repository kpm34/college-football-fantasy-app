'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDraftRealtime } from '@hooks/useDraftRealtime';
import { subscribeToDraft } from '@/lib/realtime/draft';

export type DraftCoreState = {
  league: any | null;
  picks: any[];
  currentPick: number;
  currentRound: number;
  onTheClock: string | null;
  isMyTurn: boolean;
  connected: boolean;
  loading: boolean;
  error: string | null;
  deadlineAt?: string | null;
};

export type DraftCoreActions = {
  refresh: () => Promise<void> | void;
  makePick: (
    args:
      | { playerId: string; playerName?: string; position?: string; team?: string }
      | { playerId: string; participantId: string; playerName?: string; position?: string; team?: string }
  ) => Promise<void>;
};

export type DraftCore = DraftCoreState & DraftCoreActions;

// Live draft core: thin wrapper around existing realtime hook to unify interface
export function useDraftCoreLive(leagueId: string): DraftCore {
  const live = useDraftRealtime(leagueId);

  const state: DraftCoreState = {
    league: live.league,
    picks: live.picks,
    currentPick: live.currentPick,
    currentRound: live.currentRound,
    onTheClock: live.onTheClock,
    isMyTurn: live.isMyTurn,
    connected: live.connected,
    loading: live.loading,
    error: live.error,
    deadlineAt: (live as any)?.deadlineAt ?? null,
  };

  const actions: DraftCoreActions = {
    refresh: async () => {
      // no-op; realtime hook self-refreshes. Expose for parity
    },
    makePick: async (args) => {
      const { playerId } = args as any;
      await live.makePick(playerId);
    },
  };

  return { ...state, ...actions };
}

// Mock draft core used by /mock-draft/* pages
export function useDraftCoreMock(draftId: string): DraftCore {
  const [state, setState] = useState<DraftCoreState>({
    league: null,
    picks: [],
    currentPick: 1,
    currentRound: 1,
    onTheClock: null,
    isMyTurn: false,
    connected: false,
    loading: true,
    error: null,
  });

  const unsubRef = useRef<() => void>();

  const computeFromResults = useCallback((results: any, turn?: any) => {
    const picks = Array.isArray(results?.picks) ? results.picks : [];
    const numTeams = results?.draft?.numTeams || 8;
    const rounds = results?.draft?.rounds || 15;
    const currentPick = picks.length + 1;
    const currentRound = Math.ceil(currentPick / numTeams);
    const onTheClock = turn?.participantId || null;
    setState((prev) => ({
      ...prev,
      league: results?.draft || null,
      picks,
      currentPick,
      currentRound,
      onTheClock,
      loading: false,
      connected: prev.connected,
      error: null,
    }));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/mock-draft/results/${draftId}`, { cache: 'no-store' });
      const resJson = await r.json();
      const t = await fetch(`/api/mock-draft/turn/${draftId}`, { cache: 'no-store' }).then((x) => x.json()).catch(() => null);
      computeFromResults(resJson, t?.turn);
    } catch (e: any) {
      setState((p) => ({ ...p, loading: false, error: e?.message || 'Failed to load draft' }));
    }
  }, [draftId, computeFromResults]);

  useEffect(() => {
    setState((p) => ({ ...p, loading: true }));
    refresh();
    unsubRef.current = subscribeToDraft(draftId, () => refresh());
    const poll = setInterval(() => {
      fetch(`/api/mock-draft/turn/${draftId}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((t) => setState((prev) => ({ ...prev, onTheClock: t?.turn?.participantId || prev.onTheClock, connected: true })))
        .catch(() => {});
    }, 3000);
    return () => {
      unsubRef.current?.();
      clearInterval(poll);
    };
  }, [draftId, refresh]);

  const makePick = useCallback(async (args: any) => {
    if (!args?.participantId) throw new Error('participantId required for mock draft pick');
    const { participantId, playerId } = args;
    await fetch('/api/mock-draft/pick', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ draftId, participantId, playerId }),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      await refresh();
    });
  }, [draftId, refresh]);

  return { ...state, refresh, makePick };
}


