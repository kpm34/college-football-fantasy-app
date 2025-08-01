import { Game, Player, APRanking } from '../types/api.types';

export class EligibilityChecker {
  private apRankings: Map<string, number> = new Map();
  private power4Conferences = ['SEC', 'ACC', 'Big 12', 'Big Ten'];

  updateAPRankings(rankings: APRanking[]): void {
    this.apRankings.clear();
    rankings.forEach(team => {
      this.apRankings.set(team.school.toLowerCase(), team.rank);
      // Also store common variations
      this.apRankings.set(team.school.replace(/\s+/g, '').toLowerCase(), team.rank);
    });
  }

  isTeamRanked(teamName: string): boolean {
    const normalizedName = teamName.toLowerCase();
    const noSpaceName = teamName.replace(/\s+/g, '').toLowerCase();
    
    return this.apRankings.has(normalizedName) || 
           this.apRankings.has(noSpaceName);
  }

  getTeamRank(teamName: string): number | null {
    const normalizedName = teamName.toLowerCase();
    const noSpaceName = teamName.replace(/\s+/g, '').toLowerCase();
    
    return this.apRankings.get(normalizedName) || 
           this.apRankings.get(noSpaceName) || 
           null;
  }

  isConferenceGame(conference1: string, conference2: string): boolean {
    // Both teams must be in same conference and it must be a Power 4 conference
    return conference1 === conference2 && 
           this.power4Conferences.includes(conference1);
  }

  isGameEligible(game: Game, playerTeam: string): boolean {
    // Determine which team is the opponent
    let opponentTeam: string;
    let playerConference: string | undefined;
    let opponentConference: string | undefined;

    if (game.homeTeam === playerTeam) {
      opponentTeam = game.awayTeam;
      playerConference = game.homeConference;
      opponentConference = game.awayConference;
    } else if (game.awayTeam === playerTeam) {
      opponentTeam = game.homeTeam;
      playerConference = game.awayConference;
      opponentConference = game.homeConference;
    } else {
      // Player's team is not in this game
      return false;
    }

    // Check if opponent is AP Top 25
    if (this.isTeamRanked(opponentTeam)) {
      return true;
    }

    // Check if it's a conference game
    if (playerConference && opponentConference && 
        this.isConferenceGame(playerConference, opponentConference)) {
      return true;
    }

    return false;
  }

  isPlayerEligible(
    player: Player,
    game: Game
  ): boolean {
    return this.isGameEligible(game, player.team);
  }

  getEligibleGamesForTeam(team: string, games: Game[]): Game[] {
    return games.filter(game => {
      // Only include games where the team is playing
      const isTeamPlaying = game.homeTeam === team || game.awayTeam === team;
      if (!isTeamPlaying) return false;

      return this.isGameEligible(game, team);
    });
  }

  getEligibilityReason(game: Game, playerTeam: string): string | null {
    let opponentTeam: string;
    let playerConference: string | undefined;
    let opponentConference: string | undefined;

    if (game.homeTeam === playerTeam) {
      opponentTeam = game.awayTeam;
      playerConference = game.homeConference;
      opponentConference = game.awayConference;
    } else if (game.awayTeam === playerTeam) {
      opponentTeam = game.homeTeam;
      playerConference = game.awayConference;
      opponentConference = game.homeConference;
    } else {
      return null;
    }

    const rank = this.getTeamRank(opponentTeam);
    if (rank !== null) {
      return `vs #${rank} ${opponentTeam}`;
    }

    if (playerConference && opponentConference && 
        this.isConferenceGame(playerConference, opponentConference)) {
      return `${playerConference} Conference Game`;
    }

    return null;
  }

  getWeeklyEligiblePlayers(
    players: Player[],
    weekGames: Game[]
  ): Player[] {
    return players.filter(player => {
      // Find games for player's team this week
      const playerGames = weekGames.filter(game => 
        game.homeTeam === player.team || game.awayTeam === player.team
      );

      // Check if any of the player's games are eligible
      return playerGames.some(game => this.isGameEligible(game, player.team));
    });
  }

  generateEligibilityReport(games: Game[]): {
    totalGames: number;
    eligibleGames: number;
    apTop25Games: number;
    conferenceGames: number;
    byConference: Record<string, { total: number; eligible: number }>;
  } {
    let apTop25Games = 0;
    let conferenceGames = 0;
    const byConference: Record<string, { total: number; eligible: number }> = {};

    // Initialize conference counters
    this.power4Conferences.forEach(conf => {
      byConference[conf] = { total: 0, eligible: 0 };
    });

    games.forEach(game => {
      // Count games by conference
      if (game.homeConference && this.power4Conferences.includes(game.homeConference)) {
        byConference[game.homeConference].total++;
      }

      // Check if game has AP Top 25 team
      if (this.isTeamRanked(game.homeTeam) || this.isTeamRanked(game.awayTeam)) {
        apTop25Games++;
        
        // Mark as eligible for both conferences involved
        if (game.homeConference) byConference[game.homeConference].eligible++;
        if (game.awayConference && game.awayConference !== game.homeConference) {
          byConference[game.awayConference].eligible++;
        }
      }

      // Check if it's a conference game
      if (game.homeConference && game.awayConference && 
          this.isConferenceGame(game.homeConference, game.awayConference)) {
        conferenceGames++;
        
        // Conference games are eligible for that conference
        byConference[game.homeConference].eligible++;
      }
    });

    const eligibleGames = games.filter(game => {
      // A game is eligible if either team can use players from it
      const homeEligible = this.isGameEligible(game, game.homeTeam);
      const awayEligible = this.isGameEligible(game, game.awayTeam);
      return homeEligible || awayEligible;
    }).length;

    return {
      totalGames: games.length,
      eligibleGames,
      apTop25Games,
      conferenceGames,
      byConference
    };
  }
}