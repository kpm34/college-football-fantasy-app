import { z } from 'zod'

export const LineupSchema = z.object({
  rosterId: z.string(),
  week: z.number(),
  season: z.number(),
  starters: z.array(z.string()).default([]),
  bench: z.array(z.string()).default([]),
})

export type Lineup = z.infer<typeof LineupSchema>
