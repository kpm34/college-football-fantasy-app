/**
 * Repository Pattern Exports
 * Central export for all repository classes
 */

// Import classes first to avoid circular dependencies
import { BaseRepository } from './base.repository';
import { LeagueRepository } from './league.repository';
import { RosterRepository } from './roster.repository';
import { PlayerRepository } from './player.repository';

// Re-export everything
export { BaseRepository };
export type { QueryOptions, CreateOptions, UpdateOptions } from './base.repository';

export { LeagueRepository };
export type { CreateLeagueData, UpdateLeagueData } from './league.repository';

export { RosterRepository };
export type { CreateRosterData, UpdateRosterData, AddPlayerData } from './roster.repository';

export { PlayerRepository };
export type { PlayerSearchOptions, PlayerStats } from './player.repository';

// Factory functions for easy instantiation
export function createLeagueRepository(isServer: boolean = true): LeagueRepository {
  return new LeagueRepository(isServer);
}

export function createRosterRepository(isServer: boolean = true): RosterRepository {
  return new RosterRepository(isServer);
}

export function createPlayerRepository(isServer: boolean = true): PlayerRepository {
  return new PlayerRepository(isServer);
}

// Server-side repositories (with API key)
export const serverRepositories = {
  leagues: new LeagueRepository(true),
  rosters: new RosterRepository(true),
  players: new PlayerRepository(true),
};

// Client-side repository factory (for React components)
export function useRepository<T extends BaseRepository<any>>(
  RepositoryClass: new (isServer: boolean) => T
): T {
  return new RepositoryClass(false);
}
