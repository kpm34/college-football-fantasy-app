import { LeagueRepository } from '../../../lib/repos/repositories/league.repository'
import { RosterRepository } from '../../../lib/repos/repositories/roster.repository'
import { PlayerRepository } from '../../../lib/repos/repositories/player.repository'

export { LeagueRepository, RosterRepository, PlayerRepository }

export const serverRepositories = {
  leagues: new LeagueRepository(true),
  rosters: new RosterRepository(true),
  players: new PlayerRepository(true),
}
