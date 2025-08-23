import { z } from 'zod';

export const schoolsSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  mascot: z.string(),
  conference: z.string(),
  division: z.string().optional(),
  color: z.string().optional(),
  alt_color: z.string().optional(),
  logo_url: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type School = z.infer<typeof schoolsSchema>;
