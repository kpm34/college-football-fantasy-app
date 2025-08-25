import { z } from 'zod';

export const FantasyTeams = z.object({
  league_id: z.string().min(1).max(64),
  owner_auth_user_id: z.string().min(1).max(64).optional(),
  name: z.string().min(1).max(128).optional(),
  abbrev: z.string().max(8).optional(),
  logo_url: z.string().max(512).optional(),
  wins: z.number().int().optional(),
  losses: z.number().int().optional(),
  ties: z.number().int().optional(),
  points_for: z.number().optional(),
  points_against: z.number().optional(),
  draft_position: z.number().int().optional(),
  auction_budget_total: z.number().optional(),
  auction_budget_remaining: z.number().optional(),
  display_name: z.string().max(255).optional()
});
