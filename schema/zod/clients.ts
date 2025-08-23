import { z } from 'zod';

export const clientsSchema = z.object({
  id: z.string(),
  auth_user_id: z.string(),
  display_name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  last_login: z.string().datetime().optional()
});

export type Client = z.infer<typeof clientsSchema>;
