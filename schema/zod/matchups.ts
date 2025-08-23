import { z } from 'zod';

export const matchupsSchema = z.object({
  id: z.string(),
  league_id: z.string(),
  week: z.number().int().min(1).max(17),
  home_team_id: z.string(),
  away_team_id: z.string(),
  home_points: z.number().optional(),
  away_points: z.number().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Matchup = z.infer<typeof matchupsSchema>;
