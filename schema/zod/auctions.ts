import { z } from 'zod';

export const auctionsSchema = z.object({
  id: z.string(),
  league_id: z.string(),
  player_id: z.string(),
  status: z.enum(['open', 'closed', 'won']),
  current_bid: z.number(),
  current_bidder_id: z.string().optional(),
  min_increment: z.number().default(1),
  ends_at: z.string().datetime(),
  winner_id: z.string().optional(),
  final_price: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Auction = z.infer<typeof auctionsSchema>;
