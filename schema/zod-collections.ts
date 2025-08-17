/**
 * SIMPLIFIED ZOD-FIRST COLLECTIONS
 * 
 * This provides a simpler alternative to the comprehensive schema system,
 * following your preferred pattern while maintaining compatibility.
 */

import { z } from "zod";

// Core collections with simplified definitions
export const Leagues = z.object({
  name: z.string().min(1),
  commissioner: z.string(),  // User ID
  season: z.number().int().gte(2024),
  maxTeams: z.number().int().min(2).max(32).default(12),
  draftType: z.enum(["snake", "auction"]),
  gameMode: z.enum(["power4", "sec", "acc", "big12", "bigten"]),
  status: z.enum(["open", "drafting", "active", "complete"]).default("open"),
  isPublic: z.boolean().default(true),
});

export const Teams = z.object({
  name: z.string().min(2),
  abbreviation: z.string().min(2).max(10),
  conference: z.enum(["SEC", "ACC", "Big 12", "Big Ten"]),
  color: z.string().max(7).optional(),
  logo: z.string().url().optional(),
});

export const CollegePlayers = z.object({
  name: z.string().min(2),
  position: z.enum(["QB", "RB", "WR", "TE", "K", "DEF"]),
  team: z.string().min(2),
  conference: z.enum(["SEC", "ACC", "Big 12", "Big Ten"]),
  eligible: z.boolean().default(true),
  fantasy_points: z.number().default(0),
  depth_chart_order: z.number().int().optional(),
});

export const Rosters = z.object({
  leagueId: z.string(),
  userId: z.string(),
  teamName: z.string().min(1),
  draftPosition: z.number().int().min(1).optional(),
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  pointsFor: z.number().min(0).default(0),
  pointsAgainst: z.number().min(0).default(0),
  players: z.array(z.string()).default([]), // Player IDs
});

export const Games = z.object({
  week: z.number().int().min(1).max(20),
  season: z.number().int().gte(2024),
  home_team: z.string(),
  away_team: z.string(),
  start_date: z.date(),
  completed: z.boolean().default(false),
  eligible_game: z.boolean().default(false),
});

// Inferred TypeScript types
export type League = z.infer<typeof Leagues>;
export type Team = z.infer<typeof Teams>;
export type CollegePlayer = z.infer<typeof CollegePlayers>;
export type Roster = z.infer<typeof Rosters>;
export type Game = z.infer<typeof Games>;

// Collection registry for validation
export const COLLECTIONS = {
  leagues: Leagues,
  teams: Teams,
  college_players: CollegePlayers,
  rosters: Rosters,
  games: Games,
} as const;

// Validation helper
export function validateCollection<T extends keyof typeof COLLECTIONS>(
  collection: T,
  data: unknown
): { success: boolean; data?: z.infer<typeof COLLECTIONS[T]>; errors?: string[] } {
  try {
    const schema = COLLECTIONS[collection];
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: [error.message] };
  }
}