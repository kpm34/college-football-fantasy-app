import { z } from 'zod';

export const transactionsSchema = z.object({
  id: z.string(),
  league_id: z.string(),
  type: z.enum(['add', 'drop', 'trade', 'waiver_claim']),
  fantasy_team_id: z.string(),
  player_id: z.string(),
  related_player_id: z.string().optional(), // For trades/add-drops
  related_team_id: z.string().optional(), // For trades
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  waiver_priority: z.number().int().optional(),
  faab_amount: z.number().optional(),
  processed_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Transaction = z.infer<typeof transactionsSchema>;
