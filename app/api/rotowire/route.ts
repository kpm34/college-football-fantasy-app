import { NextRequest, NextResponse } from 'next/server';

// Mock Rotowire Service for now (will be replaced with real service when API key is available)
class MockRotowireService {
  async getPlayerNews(playerId: string) {
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

  async getInjuryUpdates() {
    return {
      sport: 'college-football',
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

  async getDepthChart(teamId: string) {
    return {
      fantasy_team_id,
      positions: {
        QB: ['Bryce Young', 'Jalen Milroe'],
        RB: ['Bijan Robinson', 'Keilan Robinson'],
        WR: ['Marvin Harrison Jr.', 'Emeka Egbuka']
      }
    };
  }

  async getPlayerStats(playerId: string) {
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

  async getPlayerUpdates(playerId: string) {
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
  }

  async getTeamUpdates(teamId: string) {
    const [depthChart, injuries] = await Promise.all([
      this.getDepthChart(fantasy_team_id),
      this.getInjuryUpdates()
    ]);

    const teamInjuries = injuries.injuries?.filter(
      (injury: any) => injury.fantasy_team_id === fantasy_team_id
    ) || [];

    return {
      fantasy_team_id,
      depthChart: depthChart.positions || {},
      injuries: teamInjuries,
      lastUpdated: new Date().toISOString()
    };
  }

  isRealAPI(): boolean {
    return false; // Mock service
  }
}

const rotowireService = new MockRotowireService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const playerId = searchParams.get('playerId');
    const fantasy_team_id = searchParams.get('fantasy_team_id');

    let data: any = {};

    switch (action) {
      case 'player-news':
        if (!playerId) {
          return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
        }
        data = await rotowireService.getPlayerNews(playerId);
        break;

      case 'player-stats':
        if (!playerId) {
          return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
        }
        data = await rotowireService.getPlayerStats(playerId);
        break;

      case 'player-updates':
        if (!playerId) {
          return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
        }
        data = await rotowireService.getPlayerUpdates(playerId);
        break;

      case 'team-updates':
        if (!fantasy_team_id) {
          return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
        }
        data = await rotowireService.getTeamUpdates(fantasy_team_id);
        break;

      case 'depth-chart':
        if (!fantasy_team_id) {
          return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
        }
        data = await rotowireService.getDepthChart(fantasy_team_id);
        break;

      case 'injuries':
        data = await rotowireService.getInjuryUpdates();
        break;

      case 'status':
        data = {
          isRealAPI: rotowireService.isRealAPI(),
          message: rotowireService.isRealAPI() 
            ? 'Connected to Rotowire API' 
            : 'Using mock data (no API key configured)'
        };
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: player-news, player-stats, player-updates, team-updates, depth-chart, injuries, or status' 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      isRealAPI: rotowireService.isRealAPI()
    });

  } catch (error) {
    console.error('Rotowire API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Rotowire data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 