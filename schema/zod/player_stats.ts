import { z } from 'zod'

export const PlayerStatsSchema = z.object({
  playerId: z.string(),
  week: z.number(),
  season: z.number(),
  points: z.number().default(0),
})

export type PlayerStats = z.infer<typeof PlayerStatsSchema>
