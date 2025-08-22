import { z } from 'zod'

export const DraftPickSchema = z.object({
  leagueId: z.string(),
  userId: z.string(),
  playerId: z.string(),
  round: z.number(),
  pickNumber: z.number(),
  timestamp: z.string().datetime().optional(),
})

export type DraftPick = z.infer<typeof DraftPickSchema>
