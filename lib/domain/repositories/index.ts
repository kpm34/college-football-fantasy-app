export { LeagueRepository } from '../../../lib/repos/repositories/league.repository'
export { RosterRepository } from '../../../lib/repos/repositories/roster.repository'
export { PlayerRepository } from '../../../lib/repos/repositories/player.repository'

export const serverRepositories = {
  leagues: new (require('../../../lib/repos/repositories/league.repository').LeagueRepository)(true),
  rosters: new (require('../../../lib/repos/repositories/roster.repository').RosterRepository)(true),
  players: new (require('../../../lib/repos/repositories/player.repository').PlayerRepository)(true),
}
