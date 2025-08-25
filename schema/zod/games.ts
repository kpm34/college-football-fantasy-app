import { z } from 'zod'

export const GameSchema = z.object({
  week: z.number(),
  season: z.number(),
  season_type: z.enum(['regular','postseason']).default('regular'),
  home_team: z.string(),
  away_team: z.string(),
  kickoff_at: z.string().datetime(),
  status: z.string().optional(),
  completed: z.boolean().optional(),
  home_school_id: z.string().optional(),
  away_school_id: z.string().optional(),
  home_score: z.number().optional(),
  away_score: z.number().optional(),
  eligible_game: z.boolean().optional(),
})

export type Game = z.infer<typeof GameSchema>
