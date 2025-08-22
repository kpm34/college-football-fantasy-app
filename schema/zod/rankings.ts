import { z } from 'zod'

export const RankingSchema = z.object({
  week: z.number(),
  season: z.number(),
  poll: z.enum(['AP','Coaches']).default('AP'),
  top25: z.array(z.object({ team: z.string(), rank: z.number() }))
})

export type Ranking = z.infer<typeof RankingSchema>
