import { z } from 'zod';

export const projectionsSchema = z.object({
  id: z.string(),
  player_id: z.string(),
  season: z.number().int(),
  week: z.number().int().optional(),
  period: z.enum(['season', 'weekly', 'adhoc', 'custom']),
  source: z.enum(['model', 'expert', 'custom', 'composite']),
  version: z.string(),
  client_id: z.string().optional(), // For custom projections
  
  // Projection values
  passing_yards: z.number().optional(),
  passing_tds: z.number().optional(),
  interceptions: z.number().optional(),
  rushing_yards: z.number().optional(),
  rushing_tds: z.number().optional(),
  receptions: z.number().optional(),
  receiving_yards: z.number().optional(),
  receiving_tds: z.number().optional(),
  fumbles: z.number().optional(),
  field_goals: z.number().optional(),
  extra_points: z.number().optional(),
  
  fantasy_points: z.number(),
  confidence: z.number().min(0).max(1).optional(),
  
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Projection = z.infer<typeof projectionsSchema>;
