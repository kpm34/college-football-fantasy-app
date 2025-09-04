import type { League } from '../../types/league'
import { BaseRepository, QueryOptions } from './base.repository'
import { RosterRepository } from './roster.repository'

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

  /**
   * Create a new league document.
   * Accepts a partial League-like shape and passes through to BaseRepository.create
   * after schema transformation.
   */
  async createLeague(data: Partial<League>): Promise<League> {
    const league = await this.create(
      {
        leagueName: data.leagueName,
        season: data.season ?? new Date().getFullYear(),
        maxTeams: data.maxTeams,
        gameMode: (data as any).gameMode,
        draftType: (data as any).draftType,
        isPublic: (data as any).isPublic,
        password: (data as any).password,
        pickTimeSeconds: (data as any).pickTimeSeconds,
        commissionerAuthUserId: (data as any).commissionerAuthUserId,
        scoringRules: (data as any).scoringRules,
        draftDate: (data as any).draftDate,
        selectedConference: (data as any).selectedConference,
        engineVersion: (data as any).engineVersion ?? 'v2',
        phase: (data as any).phase ?? 'scheduled',
        currentTeams: (data as any).currentTeams ?? 0,
      } as any,
      { invalidateCache: [`${this.cachePrefix}:list:*`] }
    )
    return league
  }

  /**
   * Join a league by creating a fantasy team for the user.
   * Returns the created fantasyTeamId for convenience.
   */
  async joinLeague(
    leagueId: string,
    authUserId: string,
    teamName: string,
    teamAbbreviation?: string
  ): Promise<{ fantasyTeamId: string }> {
    const rosterRepo = new RosterRepository(this.isServer, this.client as any)
    const team = await rosterRepo.create(
      {
        leagueId,
        teamName,
        abbrev: teamAbbreviation,
        ownerAuthUserId: authUserId,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      } as any,
      { invalidateCache: [`roster:league:${leagueId}:*`] }
    )

    // Best-effort bump of currentTeams counter (ignore errors)
    try {
      const league = await this.findById(leagueId)
      if (league) {
        await this.update(
          leagueId,
          { currentTeams: Number((league as any).currentTeams || 0) + 1 } as any,
          {
            partial: true,
            invalidateCache: [`${this.cachePrefix}:${leagueId}`, `${this.cachePrefix}:list:*`],
          }
        )
      }
    } catch {}

    return { fantasyTeamId: (team as any).$id }
  }
}
