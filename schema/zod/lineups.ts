import { z } from 'zod'

export const LineupSchema = z.object({
  rosterId: z.string(),
  season: z.number(),
  week: z.number(),
  lineup: z.array(z.string()).default([]).optional(),
  bench: z.array(z.string()).default([]).optional(),
  points: z.number().default(0),
  locked: z.boolean().default(false)
})

export type Lineup = z.infer<typeof LineupSchema>
