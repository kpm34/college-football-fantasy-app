import { z } from 'zod'

export const FantasyTeamSchema = z.object({
  leagueId: z.string(),
  userId: z.string(),
  teamName: z.string(),
  createdAt: z.string().datetime().optional(),
})

export type FantasyTeam = z.infer<typeof FantasyTeamSchema>
