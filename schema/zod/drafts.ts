import { z } from 'zod'

export const DraftSchema = z.object({
  leagueId: z.string(),
  rounds: z.number().min(1).max(30).default(15),
  order: z.array(z.string()).default([]),
  status: z.enum(['scheduled','live','complete']).default('scheduled'),
})

export type Draft = z.infer<typeof DraftSchema>
