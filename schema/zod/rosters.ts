import { z } from 'zod'

export const RosterSchema = z.object({
  leagueId: z.string(),
  userId: z.string(),
  players: z.array(z.string()).default([]),
})

export type Roster = z.infer<typeof RosterSchema>
