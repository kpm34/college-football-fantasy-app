import { z } from 'zod'

export const CollegePlayerSchema = z.object({
  name: z.string(),
  position: z.enum(['QB','RB','WR','TE','K']),
  team: z.string(),
  conference: z.string(),
  fantasy_points: z.number().default(0),
  depth_chart_order: z.number().optional(),
  eligible: z.boolean().default(true),
  draftable: z.boolean().default(true),
  year: z.number().optional(),
  jerseyNumber: z.string().optional(),
})

export type CollegePlayer = z.infer<typeof CollegePlayerSchema>
