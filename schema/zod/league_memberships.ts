import { z } from 'zod';

export const leagueMembershipsSchema = z.object({
  id: z.string(),
  league_id: z.string(),
  client_id: z.string(),
  role: z.enum(['commissioner', 'member']),
  status: z.enum(['active', 'inactive', 'pending']),
  joined_at: z.string().datetime()
});

export type LeagueMembership = z.infer<typeof leagueMembershipsSchema>;
