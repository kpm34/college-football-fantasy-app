import { z } from 'zod';

export const rosterSlotsSchema = z.object({
  id: z.string(),
  fantasy_team_id: z.string(),
  player_id: z.string(),
  position: z.enum(['QB', 'RB', 'WR', 'TE', 'K', 'FLEX', 'BENCH']),
  acquisition_type: z.enum(['draft', 'waiver', 'trade', 'free_agent']),
  acquisition_date: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type RosterSlot = z.infer<typeof rosterSlotsSchema>;
