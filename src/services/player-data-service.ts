import { FreeDataService } from './data-service';
import { AppwriteDataService } from './appwrite-data-service';
import { 
  CollegePlayer, 
  PlayerPosition, 
  PlayerSeasonStats, 
  WeeklyProjection 
} from '../types/player.types';

export class PlayerDataService {
  private dataService: FreeDataService;
  private appwriteService: AppwriteDataService;

  constructor() {
    this.dataService = new FreeDataService();
    this.appwriteService = new AppwriteDataService();
  }

  // Collect all Power 4 team rosters
  async collectAllRosters(): Promise<void> {
    console.log('Starting collection of all Power 4 team rosters...');
    
    try {
      const teams = await this.dataService.getTeams();
      const power4Teams = teams.filter(team => 
        ['SEC', 'ACC', 'Big 12', 'Big Ten'].includes(team.conference || '')
      );

      console.log(`Found ${power4Teams.length} Power 4 teams`);

      for (const team of power4Teams) {
        console.log(`Collecting roster for ${team.school}...`);
        await this.collectTeamRoster(team.id);
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Completed collection of all Power 4 team rosters');
    } catch (error) {
      console.error('Failed to collect all rosters:', error);
      throw error;
    }
  }

  // Collect roster for specific team
  async collectTeamRoster(teamId: string): Promise<CollegePlayer[]> {
    try {
      console.log(`Collecting roster for team ${teamId}...`);
      
      // Get ESPN roster
      const espnRoster = await this.dataService.getTeamRoster(teamId);
      
      // Get CFBD stats for players
      const cfbdStats = await this.getCFBDPlayerStats(teamId);
      
      // Merge and transform data
      const players = this.mergePlayerData(espnRoster, cfbdStats);
      
      // Save to Appwrite
      await this.savePlayersToAppwrite(players);
      
      console.log(`Successfully collected ${players.length} players for team ${teamId}`);
      return players;
    } catch (error) {
      console.error(`Failed to collect roster for team ${teamId}:`, error);
      return [];
    }
  }

  // Get player stats from CFBD
  async getCFBDPlayerStats(teamId: string): Promise<any[]> {
    const cfbdKey = process.env.CFBD_API_KEY;
    if (!cfbdKey || cfbdKey === 'your_key_here') {
      console.warn('CFBD API key not configured, skipping stats collection');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.collegefootballdata.com/stats/player/season?year=2024&team=${teamId}`,
        {
          headers: { 'Authorization': `Bearer ${cfbdKey}` }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CFBD API error: ${response.status}`);
      }
      
      const stats = await response.json();
      console.log(`Retrieved ${stats.length} player stats from CFBD for team ${teamId}`);
      return stats;
    } catch (error) {
      console.error('CFBD stats fetch failed:', error);
      return [];
    }
  }

  // Merge ESPN roster with CFBD stats
  private mergePlayerData(espnRoster: any, cfbdStats: any[]): CollegePlayer[] {
    const players: CollegePlayer[] = [];
    
    if (!espnRoster || !espnRoster.athletes) {
      console.warn('No athletes found in ESPN roster');
      return players;
    }
    
    for (const athlete of espnRoster.athletes) {
      // Find matching CFBD player by name
      const cfbdPlayer = cfbdStats.find(p => 
        p.player.toLowerCase().includes(athlete.firstName.toLowerCase()) &&
        p.player.toLowerCase().includes(athlete.lastName.toLowerCase())
      );

      const player: CollegePlayer = {
        id: athlete.id,
        espnId: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        displayName: athlete.displayName,
        jersey: athlete.jersey,
        position: this.mapPosition(athlete.position),
        team: athlete.team || '',
        teamId: athlete.teamId || '',
        conference: athlete.conference || '',
        seasonStats: cfbdPlayer ? this.transformCFBDStats(cfbdPlayer) : undefined,
        fantasyPoints: cfbdPlayer ? this.calculateFantasyPoints(cfbdPlayer) : 0,
        eligibleForWeek: true, // Default to eligible
        injuryStatus: 'healthy', // Default to healthy
        lastUpdated: new Date(),
        dataSource: 'ESPN+CFBD'
      };

      players.push(player);
    }

    return players;
  }

  // Transform CFBD stats to our format
  private transformCFBDStats(cfbdPlayer: any): PlayerSeasonStats {
    const stats: PlayerSeasonStats = {
      games: cfbdPlayer.games || 0
    };

    // Transform based on category
    switch (cfbdPlayer.category) {
      case 'passing':
        stats.passing = {
          attempts: cfbdPlayer.statType === 'attempts' ? cfbdPlayer.stat : 0,
          completions: cfbdPlayer.statType === 'completions' ? cfbdPlayer.stat : 0,
          yards: cfbdPlayer.statType === 'yards' ? cfbdPlayer.stat : 0,
          touchdowns: cfbdPlayer.statType === 'touchdowns' ? cfbdPlayer.stat : 0,
          interceptions: cfbdPlayer.statType === 'interceptions' ? cfbdPlayer.stat : 0,
          rating: cfbdPlayer.statType === 'rating' ? cfbdPlayer.stat : 0
        };
        break;
      case 'rushing':
        stats.rushing = {
          attempts: cfbdPlayer.statType === 'attempts' ? cfbdPlayer.stat : 0,
          yards: cfbdPlayer.statType === 'yards' ? cfbdPlayer.stat : 0,
          touchdowns: cfbdPlayer.statType === 'touchdowns' ? cfbdPlayer.stat : 0,
          yardsPerCarry: cfbdPlayer.statType === 'yardsPerCarry' ? cfbdPlayer.stat : 0
        };
        break;
      case 'receiving':
        stats.receiving = {
          targets: cfbdPlayer.statType === 'targets' ? cfbdPlayer.stat : 0,
          receptions: cfbdPlayer.statType === 'receptions' ? cfbdPlayer.stat : 0,
          yards: cfbdPlayer.statType === 'yards' ? cfbdPlayer.stat : 0,
          touchdowns: cfbdPlayer.statType === 'touchdowns' ? cfbdPlayer.stat : 0,
          yardsPerReception: cfbdPlayer.statType === 'yardsPerReception' ? cfbdPlayer.stat : 0
        };
        break;
    }

    return stats;
  }

  // Map ESPN position to fantasy position
  private mapPosition(espnPosition: any): PlayerPosition {
    const positionMap: { [key: string]: string } = {
      'QB': 'QB',
      'RB': 'RB',
      'WR': 'WR',
      'TE': 'TE',
      'K': 'K',
      'P': 'K', // Include punters as kickers for fantasy
      'DL': 'DEF',
      'LB': 'DEF',
      'DB': 'DEF'
    };

    const fantasyPos = positionMap[espnPosition.abbreviation] || 'DEF';
    
    return {
      id: espnPosition.id,
      name: espnPosition.name,
      abbreviation: espnPosition.abbreviation,
      fantasyCategory: fantasyPos as any
    };
  }

  // Calculate fantasy points from stats
  private calculateFantasyPoints(stats: any): number {
    let points = 0;
    
    // Basic fantasy scoring (can be customized)
    switch (stats.category) {
      case 'passing':
        if (stats.statType === 'yards') {
          points += (stats.stat * 0.04); // 4 points per 100 passing yards
        } else if (stats.statType === 'touchdowns') {
          points += (stats.stat * 4); // 4 points per passing TD
        } else if (stats.statType === 'interceptions') {
          points -= (stats.stat * 2); // -2 points per interception
        }
        break;
      case 'rushing':
        if (stats.statType === 'yards') {
          points += (stats.stat * 0.1); // 10 points per 100 rushing yards
        } else if (stats.statType === 'touchdowns') {
          points += (stats.stat * 6); // 6 points per rushing TD
        }
        break;
      case 'receiving':
        if (stats.statType === 'yards') {
          points += (stats.stat * 0.1); // 10 points per 100 receiving yards
        } else if (stats.statType === 'touchdowns') {
          points += (stats.stat * 6); // 6 points per receiving TD
        } else if (stats.statType === 'receptions') {
          points += (stats.stat * 1); // 1 point per reception (PPR)
        }
        break;
    }

    return Math.round(points * 100) / 100;
  }

  // Save players to Appwrite
  private async savePlayersToAppwrite(players: CollegePlayer[]): Promise<void> {
    console.log(`Saving ${players.length} players to Appwrite...`);
    
    for (const player of players) {
      try {
        await this.appwriteService.createDocument('college_players', {
          ...player,
          seasonStats: JSON.stringify(player.seasonStats || {}),
          weeklyProjections: JSON.stringify(player.weeklyProjections || [])
        });
      } catch (error) {
        console.error(`Failed to save player ${player.displayName}:`, error);
      }
    }
    
    console.log('Completed saving players to Appwrite');
  }

  // Get draftable players for a specific week
  async getDraftablePlayers(week: number): Promise<CollegePlayer[]> {
    try {
      const players = await this.appwriteService.listDocuments('college_players', [
        { key: 'eligibleForWeek', operator: 'equal', value: true },
        { key: 'injuryStatus', operator: 'equal', value: 'healthy' }
      ]);

      return players.map(player => ({
        ...player,
        seasonStats: JSON.parse(player.seasonStats || '{}'),
        weeklyProjections: JSON.parse(player.weeklyProjections || '[]')
      }));
    } catch (error) {
      console.error('Failed to get draftable players:', error);
      return [];
    }
  }

  // Search players by name, team, position
  async searchPlayers(query: string, filters: any = {}): Promise<CollegePlayer[]> {
    try {
      const queries = [
        { key: 'displayName', operator: 'search', value: query }
      ];

      if (filters.position) {
        queries.push({ key: 'fantasyPosition', operator: 'equal', value: filters.position });
      }

      if (filters.conference) {
        queries.push({ key: 'conference', operator: 'equal', value: filters.conference });
      }

      if (filters.minPoints) {
        queries.push({ key: 'fantasyPoints', operator: 'greaterThan', value: filters.minPoints });
      }

      const players = await this.appwriteService.listDocuments('college_players', queries);

      return players.map(player => ({
        ...player,
        seasonStats: JSON.parse(player.seasonStats || '{}'),
        weeklyProjections: JSON.parse(player.weeklyProjections || '[]')
      }));
    } catch (error) {
      console.error('Failed to search players:', error);
      return [];
    }
  }

  // Update player eligibility for a specific week
  async updatePlayerEligibility(playerId: string, eligible: boolean): Promise<void> {
    try {
      await this.appwriteService.updateDocument('college_players', playerId, {
        eligibleForWeek: eligible,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error(`Failed to update eligibility for player ${playerId}:`, error);
    }
  }

  // Update player injury status
  async updatePlayerInjuryStatus(playerId: string, status: string, notes?: string): Promise<void> {
    try {
      await this.appwriteService.updateDocument('college_players', playerId, {
        injuryStatus: status,
        injuryNotes: notes,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error(`Failed to update injury status for player ${playerId}:`, error);
    }
  }
} 