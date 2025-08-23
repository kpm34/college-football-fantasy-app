import { z } from 'zod';

export const draftEventsSchema = z.object({
  id: z.string(),
  draft_id: z.string(),
  type: z.enum(['pick', 'pass', 'timeout', 'pause', 'resume']),
  round: z.number().int().optional(),
  overall: z.number().int().optional(),
  fantasy_team_id: z.string().optional(),
  player_id: z.string().optional(),
  ts: z.string().datetime(),
  payload_json: z.string().optional(), // Additional event data
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type DraftEvent = z.infer<typeof draftEventsSchema>;
