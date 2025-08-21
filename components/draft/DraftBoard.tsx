'use client';

import React, { useMemo } from 'react';

type BoardPick = {
  overall: number;
  round: number;
  slot?: number; // 1-based team slot in the snake ordering for that round
  userId?: string;
  playerName?: string;
  playerId: string;
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

  const renderCell = (roundIndex: number, slotIndex: number) => {
    const roundNumber = roundIndex + 1;
    const slotNumber = slotIndex + 1; // 1-based
    const isOddRound = roundNumber % 2 === 1;
    const pickSlotInRound = isOddRound ? slotNumber : (numTeams - slotIndex); // 1..numTeams order within round
    const overall = (roundNumber - 1) * numTeams + pickSlotInRound;
    const pick = overallToPick.get(overall);
    const isCurrent = currentOverall != null && overall === currentOverall;

    return (
      <div
        key={`r${roundNumber}-s${slotNumber}`}
        className={`rounded border p-2 min-h-[56px] text-xs ${pick ? 'bg-white' : 'bg-gray-50'} ${isCurrent ? 'ring-2 ring-red-600' : ''}`}
        style={{ borderColor: '#e5e7eb' }}
      >
        {pick ? (
          <div>
            <div className="font-medium truncate">{pick.playerName || pick.playerId}</div>
            <div className="text-[11px] text-gray-500">#{overall} • R{roundNumber}</div>
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


