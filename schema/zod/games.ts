import { z } from 'zod'

export const GameSchema = z.object({
  week: z.number(),
  season: z.number(),
  season_type: z.enum(['regular','postseason']).default('regular'),
  home_team: z.string(),
  away_team: z.string(),
  start_date: z.string().datetime(),
  status: z.string().optional(),
})

export type Game = z.infer<typeof GameSchema>
