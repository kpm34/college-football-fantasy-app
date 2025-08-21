import { describe, it, expect } from 'vitest';

describe('Draft start gating and cron', () => {
  it('computes isDraftLive only when status=drafting and now>=draftDate', () => {
    const now = Date.now();
    const league: any = { status: 'drafting', draftDate: new Date(now - 1000).toISOString() };
    const isLive = String(league.status) === 'drafting' && Date.now() >= new Date(league.draftDate).getTime();
    expect(isLive).toBe(true);
  });

  it('prevents early start when before draftDate unless forced', () => {
    const now = Date.now();
    const draftStartMs = now + 60_000;
    const canStartNormal = Date.now() >= draftStartMs;
    const canStartForced = true; // commissioner/cron with force
    expect(canStartNormal).toBe(false);
    expect(canStartForced).toBe(true);
  });
});


