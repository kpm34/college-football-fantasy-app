# Roster Data Collection & Drafting Infrastructure Plan

## Overview
This document outlines the complete data collection strategy for Power 4 college football players, including rosters, stats, projections, and depth chart information needed for the fantasy drafting process.

## 1. Data Sources Strategy

### Primary Sources (Free APIs)
- **ESPN API**: Team rosters, live stats, game data
- **CollegeFootballData API**: Player stats, rankings, depth charts
- **ESPN Scraping**: Fallback for detailed player information

### Secondary Sources (Manual/Scraping)
- **Team Websites**: Depth charts, injury reports
- **ESPN Player Pages**: Detailed stats, projections
- **College Football News**: Injury updates, depth chart changes

## 2. Data Collection Architecture

### 2.1 Player Data Structure
```typescript
interface CollegePlayer {
  id: string;
  espnId?: string;
  cfbdId?: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  displayName: string;
  jersey?: string;
  position: PlayerPosition;
  team: string;
  teamId: string;
  conference: string;
  
  // Physical Attributes
  height?: string;
  weight?: number;
  class?: string; // Freshman, Sophomore, etc.
  
  // Depth Chart
  depthChartPosition?: number;
  isStarter?: boolean;
  
  // Eligibility
  eligibleForWeek?: boolean;
  injuryStatus?: 'healthy' | 'questionable' | 'doubtful' | 'out';
  injuryNotes?: string;
  
  // Stats & Projections
  seasonStats?: PlayerSeasonStats;
  weeklyProjections?: WeeklyProjection[];
  fantasyPoints?: number;
  
  // Metadata
  lastUpdated: Date;
  dataSource: string;
}

interface PlayerPosition {
  id: string;
  name: string;
  abbreviation: string;
  fantasyCategory: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
}

interface PlayerSeasonStats {
  games: number;
  passing?: {
    attempts: number;
    completions: number;
    yards: number;
    touchdowns: number;
    interceptions: number;
    rating: number;
  };
  rushing?: {
    attempts: number;
    yards: number;
    touchdowns: number;
    yardsPerCarry: number;
  };
  receiving?: {
    targets: number;
    receptions: number;
    yards: number;
    touchdowns: number;
    yardsPerReception: number;
  };
  defense?: {
    tackles: number;
    sacks: number;
    interceptions: number;
    passesDefended: number;
  };
  kicking?: {
    fieldGoals: number;
    fieldGoalAttempts: number;
    extraPoints: number;
    extraPointAttempts: number;
  };
}

interface WeeklyProjection {
  week: number;
  opponent: string;
  projectedPoints: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}
```

### 2.2 Appwrite Collections Schema

#### College Players Collection
```json
{
  "name": "college_players",
  "id": "college_players",
  "permissions": ["read(\"any\")"],
  "attributes": [
    {"key": "espnId", "type": "string", "size": 20, "required": false},
    {"key": "cfbdId", "type": "string", "size": 20, "required": false},
    {"key": "firstName", "type": "string", "size": 50, "required": true},
    {"key": "lastName", "type": "string", "size": 50, "required": true},
    {"key": "displayName", "type": "string", "size": 100, "required": true},
    {"key": "jersey", "type": "string", "size": 10, "required": false},
    {"key": "position", "type": "string", "size": 20, "required": true},
    {"key": "fantasyPosition", "type": "string", "size": 10, "required": true},
    {"key": "team", "type": "string", "size": 100, "required": true},
    {"key": "teamId", "type": "string", "size": 20, "required": true},
    {"key": "conference", "type": "string", "size": 20, "required": true},
    {"key": "height", "type": "string", "size": 10, "required": false},
    {"key": "weight", "type": "integer", "required": false},
    {"key": "class", "type": "string", "size": 20, "required": false},
    {"key": "depthChartPosition", "type": "integer", "required": false},
    {"key": "isStarter", "type": "boolean", "required": false},
    {"key": "eligibleForWeek", "type": "boolean", "required": false, "default": true},
    {"key": "injuryStatus", "type": "string", "size": 20, "required": false},
    {"key": "injuryNotes", "type": "string", "size": 500, "required": false},
    {"key": "seasonStats", "type": "string", "size": 5000, "required": false},
    {"key": "weeklyProjections", "type": "string", "size": 10000, "required": false},
    {"key": "fantasyPoints", "type": "float", "required": false, "default": 0},
    {"key": "lastUpdated", "type": "datetime", "required": false},
    {"key": "dataSource", "type": "string", "size": 50, "required": false}
  ],
  "indexes": [
    {"key": "team_index", "attributes": ["team"], "type": "key"},
    {"key": "position_index", "attributes": ["fantasyPosition"], "type": "key"},
    {"key": "conference_index", "attributes": ["conference"], "type": "key"},
    {"key": "fantasy_points_index", "attributes": ["fantasyPoints"], "type": "key"},
    {"key": "eligible_index", "attributes": ["eligibleForWeek"], "type": "key"}
  ]
}
```

#### Player Stats Collection
```json
{
  "name": "player_stats",
  "id": "player_stats",
  "permissions": ["read(\"any\")"],
  "attributes": [
    {"key": "playerId", "type": "string", "size": 36, "required": true},
    {"key": "season", "type": "integer", "required": true},
    {"key": "week", "type": "integer", "required": true},
    {"key": "opponent", "type": "string", "size": 100, "required": true},
    {"key": "stats", "type": "string", "size": 5000, "required": true},
    {"key": "fantasyPoints", "type": "float", "required": true},
    {"key": "lastUpdated", "type": "datetime", "required": false}
  ],
  "indexes": [
    {"key": "player_season_week", "attributes": ["playerId", "season", "week"], "type": "key"},
    {"key": "fantasy_points_index", "attributes": ["fantasyPoints"], "type": "key"}
  ]
}
```

## 3. Data Collection Implementation

### 3.1 Player Data Service
```typescript
// src/services/player-data-service.ts
export class PlayerDataService {
  private dataService: FreeDataService;
  private appwriteService: AppwriteDataService;

  constructor() {
    this.dataService = new FreeDataService();
    this.appwriteService = new AppwriteDataService();
  }

  // Collect all Power 4 team rosters
  async collectAllRosters(): Promise<void> {
    const teams = await this.dataService.getTeams();
    const power4Teams = teams.filter(team => 
      ['SEC', 'ACC', 'Big 12', 'Big Ten'].includes(team.conference || '')
    );

    for (const team of power4Teams) {
      await this.collectTeamRoster(team.id);
    }
  }

  // Collect roster for specific team
  async collectTeamRoster(teamId: string): Promise<CollegePlayer[]> {
    try {
      // Get ESPN roster
      const espnRoster = await this.dataService.getTeamRoster(teamId);
      
      // Get CFBD stats for players
      const cfbdStats = await this.getCFBDPlayerStats(teamId);
      
      // Merge and transform data
      const players = this.mergePlayerData(espnRoster, cfbdStats);
      
      // Save to Appwrite
      await this.savePlayersToAppwrite(players);
      
      return players;
    } catch (error) {
      console.error(`Failed to collect roster for team ${teamId}:`, error);
      return [];
    }
  }

  // Get player stats from CFBD
  async getCFBDPlayerStats(teamId: string): Promise<any[]> {
    const cfbdKey = process.env.CFBD_API_KEY;
    if (!cfbdKey) return [];

    try {
      const response = await fetch(
        `https://api.collegefootballdata.com/stats/player/season?year=2024&team=${teamId}`,
        {
          headers: { 'Authorization': `Bearer ${cfbdKey}` }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('CFBD stats fetch failed:', error);
      return [];
    }
  }

  // Merge ESPN roster with CFBD stats
  private mergePlayerData(espnRoster: any, cfbdStats: any[]): CollegePlayer[] {
    const players: CollegePlayer[] = [];
    
    for (const athlete of espnRoster.athletes || []) {
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
        lastUpdated: new Date(),
        dataSource: 'ESPN+CFBD'
      };

      players.push(player);
    }

    return players;
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
    
    // Passing points
    if (stats.category === 'passing') {
      points += (stats.stat * 0.04); // 4 points per passing yard
      // Add TD and INT bonuses based on stat type
    }
    
    // Rushing points
    if (stats.category === 'rushing') {
      points += (stats.stat * 0.1); // 10 points per rushing yard
    }
    
    // Receiving points
    if (stats.category === 'receiving') {
      points += (stats.stat * 0.1); // 10 points per receiving yard
    }

    return Math.round(points * 100) / 100;
  }

  // Save players to Appwrite
  private async savePlayersToAppwrite(players: CollegePlayer[]): Promise<void> {
    for (const player of players) {
      try {
        await this.appwriteService.createDocument('college_players', {
          ...player,
          seasonStats: JSON.stringify(player.seasonStats),
          weeklyProjections: JSON.stringify(player.weeklyProjections)
        });
      } catch (error) {
        console.error(`Failed to save player ${player.displayName}:`, error);
      }
    }
  }
}
```

### 3.2 Depth Chart Service
```typescript
// src/services/depth-chart-service.ts
export class DepthChartService {
  // Scrape depth charts from team websites or ESPN
  async collectDepthCharts(): Promise<void> {
    const teams = await this.getPower4Teams();
    
    for (const team of teams) {
      await this.collectTeamDepthChart(team);
    }
  }

  private async collectTeamDepthChart(team: Team): Promise<void> {
    try {
      // Try ESPN depth chart first
      const depthChart = await this.scrapeESPNDepthChart(team.id);
      
      // Update players in Appwrite with depth chart info
      await this.updatePlayerDepthChart(team.id, depthChart);
    } catch (error) {
      console.error(`Failed to collect depth chart for ${team.school}:`, error);
    }
  }

  private async scrapeESPNDepthChart(teamId: string): Promise<any[]> {
    // Implementation for scraping ESPN depth charts
    // This would use cheerio or similar to parse HTML
    return [];
  }
}
```

### 3.3 Projection Service
```typescript
// src/services/projection-service.ts
export class ProjectionService {
  // Generate weekly projections based on historical data
  async generateWeeklyProjections(week: number): Promise<void> {
    const players = await this.getDraftablePlayers();
    
    for (const player of players) {
      const projection = await this.calculatePlayerProjection(player, week);
      await this.updatePlayerProjection(player.id, projection);
    }
  }

  private async calculatePlayerProjection(player: CollegePlayer, week: number): Promise<WeeklyProjection> {
    // Get historical stats
    const historicalStats = await this.getPlayerHistoricalStats(player.id);
    
    // Get opponent data
    const opponent = await this.getPlayerOpponent(player.teamId, week);
    
    // Calculate projection based on:
    // - Historical performance
    // - Opponent strength
    // - Home/away
    // - Injury status
    // - Depth chart position
    
    const projectedPoints = this.calculateProjectedPoints(historicalStats, opponent);
    
    return {
      week,
      opponent: opponent.name,
      projectedPoints,
      confidence: this.calculateConfidence(historicalStats),
      notes: this.generateProjectionNotes(player, opponent)
    };
  }
}
```

## 4. Data Collection Schedule

### 4.1 Initial Setup (One-time)
- Collect all Power 4 team rosters
- Import historical stats from previous seasons
- Set up depth charts
- Generate initial projections

### 4.2 Weekly Updates
- **Monday**: Update injury reports and depth charts
- **Tuesday**: Generate weekly projections
- **Wednesday**: Update AP rankings and eligibility
- **Thursday**: Final projection updates
- **Friday-Sunday**: Live game updates

### 4.3 Real-time Updates
- Live game stats during games
- Injury updates as they occur
- Depth chart changes

## 5. Drafting Interface Data

### 5.1 Draftable Players Query
```typescript
// Get all draftable players for a specific week
async getDraftablePlayers(week: number): Promise<CollegePlayer[]> {
  const players = await this.appwriteService.listDocuments('college_players', [
    Query.equal('eligibleForWeek', true),
    Query.equal('injuryStatus', 'healthy'),
    Query.orderDesc('fantasyPoints')
  ]);

  return players.map(player => ({
    ...player,
    seasonStats: JSON.parse(player.seasonStats || '{}'),
    weeklyProjections: JSON.parse(player.weeklyProjections || '[]')
  }));
}
```

### 5.2 Player Search & Filtering
```typescript
// Search players by name, team, position
async searchPlayers(query: string, filters: PlayerFilters): Promise<CollegePlayer[]> {
  const queries = [
    Query.search('displayName', query),
    Query.equal('fantasyPosition', filters.position),
    Query.equal('conference', filters.conference),
    Query.greaterThan('fantasyPoints', filters.minPoints)
  ];

  return await this.appwriteService.listDocuments('college_players', queries);
}
```

## 6. Implementation Priority

### Phase 1: Core Data Collection
1. Set up Appwrite collections for players and stats
2. Implement basic roster collection from ESPN
3. Create player data service
4. Test data flow with sample teams

### Phase 2: Stats & Projections
1. Integrate CFBD API for player stats
2. Implement fantasy points calculation
3. Create projection service
4. Add depth chart collection

### Phase 3: Drafting Interface
1. Create draftable players API endpoint
2. Implement player search and filtering
3. Add player comparison features
4. Create draft board with real-time updates

### Phase 4: Advanced Features
1. Injury tracking and updates
2. Advanced projections with machine learning
3. Player news and updates
4. Historical performance analysis

## 7. Testing Strategy

### 7.1 Data Quality Tests
- Verify all Power 4 teams have rosters
- Check for duplicate players
- Validate fantasy point calculations
- Test projection accuracy

### 7.2 Performance Tests
- Load testing with large player datasets
- API rate limit compliance
- Real-time update performance

### 7.3 Integration Tests
- End-to-end data flow testing
- Draft interface with real data
- Live scoring integration

This comprehensive plan provides the foundation for collecting and managing all the data needed for the fantasy football drafting process, ensuring users have access to accurate, up-to-date information about Power 4 college football players. 