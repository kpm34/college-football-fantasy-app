import { z } from 'zod';

export const bidsSchema = z.object({
  id: z.string(),
  auction_id: z.string(),
  fantasy_team_id: z.string(),
  player_id: z.string(),
  amount: z.number(),
  is_winning: z.boolean().default(false),
  timestamp: z.string().datetime(),
  created_at: z.string().datetime()
});

export type Bid = z.infer<typeof bidsSchema>;
