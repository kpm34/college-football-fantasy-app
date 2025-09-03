import type { League } from '../../types/league'
import { BaseRepository, QueryOptions } from './base.repository'

// Keep types minimal to satisfy external imports
export type CreateLeagueData = Partial<League>
export type UpdateLeagueData = Partial<League>

/**
 * League Repository
 * Minimal implementation to support existing imports and operations.
 * Uses BaseRepository for CRUD; collectionId aligns with Appwrite schema: `leagues`.
 */
export class LeagueRepository extends BaseRepository<League> {
  protected collectionId = 'leagues'
  protected cachePrefix = 'league'

  constructor(isServer: boolean = true, client?: any) {
    super(isServer, client)
  }

  /**
   * Convenience: find leagues by name
   */
  async findByName(name: string, options?: QueryOptions): Promise<League[]> {
    const result = await this.find({ ...options, filters: { name } })
    return result.documents
  }
}
