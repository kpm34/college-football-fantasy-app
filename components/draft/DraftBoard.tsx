'use client';

import React, { useMemo } from 'react';

type BoardPick = {
  overall: number;
  round: number;
  slot?: number; // 1-based team slot in the snake ordering for that round
  userId?: string;
  playerName?: string;
  playerId: string;
  position?: string;
  team?: string; // school/team name
};

export interface DraftBoardProps {
  picks: BoardPick[]; // Should include overall pick numbers
  numTeams: number;
  rounds: number;
  currentOverall?: number | null;
  slotLabels?: string[]; // Optional labels for columns (length === numTeams)
}

/**
 * DraftBoard: Full-screen snake draft board grid.
 * - Columns: Teams (slot 1..numTeams)
 * - Rows: Rounds 1..rounds
 * - Snake order visualized by overall pick mapping
 */
export function DraftBoard({ picks, numTeams, rounds, currentOverall, slotLabels = [] }: DraftBoardProps) {
  const overallToPick = useMemo(() => {
    const map = new Map<number, BoardPick>();
    for (const p of picks) {
      if (typeof p.overall === 'number') map.set(p.overall, p);
    }
    return map;
  }, [picks]);

  const getPositionBg = (pos?: string) => {
    const P = String(pos || '').toUpperCase();
    switch (P) {
      case 'QB':
        return '#3B82F6'; // blue
      case 'RB':
        return '#10B981'; // green
      case 'WR':
        return '#F59E0B'; // amber
      case 'TE':
        return '#8B5CF6'; // purple
      case 'K':
        return '#6B7280'; // gray
      case 'DEF':
        return '#374151';
      default:
        return '#111827';
    }
  };

  const renderCell = (roundIndex: number, slotIndex: number) => {
    const roundNumber = roundIndex + 1;
    const slotNumber = slotIndex + 1; // 1-based
    const isOddRound = roundNumber % 2 === 1;
    const pickSlotInRound = isOddRound ? slotNumber : (numTeams - slotIndex); // 1..numTeams order within round
    const overall = (roundNumber - 1) * numTeams + pickSlotInRound;
    const pick = overallToPick.get(overall);
    const isCurrent = currentOverall != null && overall === currentOverall;

    const bgColor = pick ? getPositionBg(pick.position) : undefined;
    return (
      <div
        key={`r${roundNumber}-s${slotNumber}`}
        className={`rounded border p-2 min-h-[56px] text-xs ${pick ? '' : 'bg-gray-50'} ${isCurrent ? 'ring-2 ring-red-600' : ''}`}
        style={{ borderColor: '#e5e7eb', backgroundColor: bgColor, color: pick ? '#fff' : undefined }}
      >
        {pick ? (
          <div>
            <div className="truncate font-semibold leading-tight text-[12px]">{pick.playerName || '—'}</div>
            <div className="text-[11px] opacity-90 flex items-center gap-1">
              {pick.position && (
                <span className="inline-flex items-center justify-center w-6 h-4 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(0,0,0,.25)' }}>{pick.position.toUpperCase()}</span>
              )}
              <span className="truncate">{pick.team || ''}</span>
              <span className="ml-auto">#{overall} • R{roundNumber}</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-gray-400">#{overall}</div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="text-sm font-medium text-gray-700">Draft Board</div>
          {slotLabels.length === numTeams && (
            <div className="hidden lg:grid grid-flow-col auto-cols-fr gap-3 flex-1">
              {slotLabels.map((label, i) => (
                <div key={i} className="text-[11px] text-gray-500 truncate">{label}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {Array.from({ length: rounds }).map((_, rIdx) => (
          <div key={rIdx} className="rounded border p-2 bg-white/60">
            <div className="text-xs mb-2 text-gray-600">Round {rIdx + 1}</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${numTeams}, minmax(0,1fr))` }}>
              {Array.from({ length: numTeams }).map((_, sIdx) => renderCell(rIdx, sIdx))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DraftBoard;


