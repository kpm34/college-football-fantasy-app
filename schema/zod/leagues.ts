import { z } from 'zod'

export const LeagueSchema = z.object({
  name: z.string(),
  commissioner: z.string(),
  season: z.number(),
  maxTeams: z.number().min(2).max(24),
  draftType: z.enum(['snake','auction']).default('snake'),
  gameMode: z.enum(['power4','sec','acc','big12','bigten','conference']),
  selectedConference: z.string().optional(),
  draftDate: z.string().datetime().optional(),
  status: z.enum(['open','active','complete','drafting','full']).default('open'),
})

export type League = z.infer<typeof LeagueSchema>
