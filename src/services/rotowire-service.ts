import { API_KEYS } from '../config/api-keys';

// Rotowire API Client Interface
interface RotowireClient {
  getPlayerNews: (playerId: string) => Promise<any>;
  getInjuryUpdates: (sport: string) => Promise<any>;
  getDepthCharts: (teamId: string) => Promise<any>;
  getPlayerStats: (playerId: string) => Promise<any>;
}

// Mock Rotowire Client (since we need API key first)
class MockRotowireClient implements RotowireClient {
  async getPlayerNews(playerId: string) {
    console.log('Mock: Getting player news for', playerId);
    return {
      playerId,
      news: [
        {
          id: '1',
          title: 'Player practicing fully',
          content: 'Player was a full participant in practice today.',
          date: new Date().toISOString(),
          source: 'Rotowire'
        }
      ]
    };
  }

  async getInjuryUpdates(sport: string) {
    console.log('Mock: Getting injury updates for', sport);
    return {
      sport,
      injuries: [
        {
          playerId: '12345',
          playerName: 'Bryce Young',
          team: 'Alabama',
          status: 'Questionable',
          injury: 'Ankle',
          date: new Date().toISOString()
        }
      ]
    };
  }

  async getDepthCharts(teamId: string) {
    console.log('Mock: Getting depth chart for team', teamId);
    return {
      teamId,
      positions: {
        QB: ['Bryce Young', 'Jalen Milroe'],
        RB: ['Bijan Robinson', 'Keilan Robinson'],
        WR: ['Marvin Harrison Jr.', 'Emeka Egbuka']
      }
    };
  }

  async getPlayerStats(playerId: string) {
    console.log('Mock: Getting stats for player', playerId);
    return {
      playerId,
      stats: {
        passing: {
          yards: 3200,
          touchdowns: 28,
          interceptions: 5
        },
        rushing: {
          yards: 150,
          touchdowns: 2
        }
      }
    };
  }
}

// Real Rotowire Client (when API key is available)
class RealRotowireClient implements RotowireClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.rotowire.com/v1'; // Example endpoint
  }

  async getPlayerNews(playerId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}/news`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Rotowire API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching player news:', error);
      throw error;
    }
  }

  async getInjuryUpdates(sport: string) {
    try {
      const response = await fetch(`${this.baseUrl}/injuries?sport=${sport}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Rotowire API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching injury updates:', error);
      throw error;
    }
  }

  async getDepthCharts(teamId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/depth-chart`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Rotowire API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching depth chart:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Rotowire API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }
}

// Rotowire Service Class
export class RotowireService {
  private client: RotowireClient;

  constructor() {
    // Use real client if API key is available, otherwise use mock
    if (API_KEYS.ROTOWIRE_API_KEY) {
      this.client = new RealRotowireClient(API_KEYS.ROTOWIRE_API_KEY);
      console.log('✅ Rotowire API: Using real client');
    } else {
      this.client = new MockRotowireClient();
      console.log('⚠️  Rotowire API: Using mock client (no API key)');
    }
  }

  // Get player news and updates
  async getPlayerNews(playerId: string) {
    return await this.client.getPlayerNews(playerId);
  }

  // Get injury updates for college football
  async getInjuryUpdates() {
    return await this.client.getInjuryUpdates('college-football');
  }

  // Get team depth chart
  async getDepthChart(teamId: string) {
    return await this.client.getDepthCharts(teamId);
  }

  // Get player statistics
  async getPlayerStats(playerId: string) {
    return await this.client.getPlayerStats(playerId);
  }

  // Get all updates for a specific player
  async getPlayerUpdates(playerId: string) {
    try {
      const [news, stats] = await Promise.all([
        this.getPlayerNews(playerId),
        this.getPlayerStats(playerId)
      ]);

      return {
        playerId,
        news: news.news || [],
        stats: stats.stats || {},
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting player updates:', error);
      throw error;
    }
  }

  // Get team updates (depth chart + injuries)
  async getTeamUpdates(teamId: string) {
    try {
      const [depthChart, injuries] = await Promise.all([
        this.getDepthChart(teamId),
        this.getInjuryUpdates()
      ]);

      // Filter injuries for this team
      const teamInjuries = injuries.injuries?.filter(
        (injury: any) => injury.teamId === teamId
      ) || [];

      return {
        teamId,
        depthChart: depthChart.positions || {},
        injuries: teamInjuries,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting team updates:', error);
      throw error;
    }
  }

  // Check if service is using real API
  isRealAPI(): boolean {
    return this.client instanceof RealRotowireClient;
  }
}

// Export singleton instance
export const rotowireService = new RotowireService(); 