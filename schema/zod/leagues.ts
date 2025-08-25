import { z } from 'zod'

// Canonical leagues schema (subset for SSOT import)
export const Leagues = z.object({
  name: z.string().min(1).max(100),
  commissioner_auth_user_id: z.string().min(1).max(64).optional(),
  season: z.number().int().min(2020).max(2035),
  maxTeams: z.number().int().min(2).max(32).optional(),
  currentTeams: z.number().int().min(0).max(32).optional(),
  status: z.string().max(20).optional(),
  isPublic: z.boolean().optional(),
  scoringRules: z.string().max(8192).optional(),
  draftDate: z.string().optional(),
  selectedConference: z.string().max(50).optional(),
  draftType: z.string().max(20).optional(),
  gameMode: z.string().max(20).optional(),
  pickTimeSeconds: z.number().int().optional(),
  playoffStartWeek: z.number().int().optional(),
  playoffTeams: z.number().int().optional(),
  waiverType: z.string().max(20).optional(),
  waiverBudget: z.number().int().optional(),
});

export type League = z.infer<typeof Leagues>
