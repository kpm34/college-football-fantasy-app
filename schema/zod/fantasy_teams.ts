import { z } from 'zod';

export const fantasyTeamsSchema = z.object({
  id: z.string(),
  league_id: z.string(),
  owner_client_id: z.string(),
  name: z.string(),
  logo_url: z.string().optional(),
  
  // Stats
  wins: z.number().int().default(0),
  losses: z.number().int().default(0),
  ties: z.number().int().default(0),
  points_for: z.number().default(0),
  points_against: z.number().default(0),
  
  // Auction/budget (consolidated from team_budgets)
  auction_budget_total: z.number().default(200),
  auction_budget_remaining: z.number().default(200),
  waiver_priority: z.number().int().optional(),
  faab_remaining: z.number().optional(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type FantasyTeam = z.infer<typeof fantasyTeamsSchema>;
