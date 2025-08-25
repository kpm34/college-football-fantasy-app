import { z } from 'zod';

export const leagueMembershipsSchema = z.object({
  id: z.string().optional(),
  league_id: z.string(),
  auth_user_id: z.string(),
  role: z.enum(['COMMISSIONER', 'MEMBER']).default('MEMBER'),
  status: z.enum(['ACTIVE', 'INVITED', 'LEFT', 'KICKED']).default('ACTIVE'),
  joined_at: z.string().optional(),
  display_name: z.string().optional()
});

export type LeagueMembership = z.infer<typeof leagueMembershipsSchema>;
