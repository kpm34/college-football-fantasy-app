import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { 
  ESPNScoreboardResponse, 
  ESPNTeamRoster, 
  CFBDGame, 
  CFBDRanking,
  Team,
  Game,
  GameStatus,
  APPoll,
  APRanking
} from '../types/api.types';

dotenv.config();

export class FreeDataService {
  private espnBase = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';
  private cfbdBase = 'https://api.collegefootballdata.com';
  private cfbdKey = process.env.CFBD_API_KEY || '';
  
  // ESPN Conference IDs
  private conferenceIds = {
    'SEC': 8,
    'Big 12': 4,
    'Big Ten': 5,
    'ACC': 1
  };

  // Power 4 conference names for filtering
  private power4Conferences = ['SEC', 'ACC', 'Big 12', 'Big Ten'];

  constructor() {
    if (!this.cfbdKey || this.cfbdKey === 'your_key_here') {
      console.warn('CFBD API key not configured. Some features may be limited.');
    }
  }

  async getCurrentWeekGames(): Promise<Game[]> {
    try {
      // Try ESPN first (no auth needed)
      const response = await fetch(`${this.espnBase}/scoreboard?limit=150`);
      const data = await response.json() as ESPNScoreboardResponse;
      
      return this.transformESPNGames(data);
    } catch (error) {
      console.error('ESPN API failed:', error);
      
      // Fallback to CFBD if configured
      if (this.cfbdKey && this.cfbdKey !== 'your_key_here') {
        return this.getCFBDGames();
      }
      
      throw new Error('Unable to fetch games from any source');
    }
  }

  async getGamesForWeek(week: number, year: number = new Date().getFullYear()): Promise<Game[]> {
    try {
      // ESPN endpoint with week parameter
      const response = await fetch(`${this.espnBase}/scoreboard?week=${week}&year=${year}&limit=150`);
      const data = await response.json() as ESPNScoreboardResponse;
      
      return this.transformESPNGames(data);
    } catch (error) {
      console.error('ESPN API failed:', error);
      
      if (this.cfbdKey && this.cfbdKey !== 'your_key_here') {
        return this.getCFBDGames(week, year);
      }
      
      throw new Error('Unable to fetch games from any source');
    }
  }

  async getAPRankings(week?: number, year: number = new Date().getFullYear()): Promise<APPoll | null> {
    // Try CFBD first if we have a key
    if (this.cfbdKey && this.cfbdKey !== 'your_key_here') {
      try {
        let url = `${this.cfbdBase}/rankings?year=${year}&seasonType=regular`;
        if (week) {
          url += `&week=${week}`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${this.cfbdKey}` }
        });

        if (!response.ok) {
          throw new Error(`CFBD API error: ${response.status}`);
        }

        const data = await response.json() as CFBDRanking[];
        
        // Get the most recent poll
        const latestPoll = data[data.length - 1];
        if (!latestPoll) return null;

        // Transform to our format
        return {
          season: latestPoll.season,
          seasonType: latestPoll.seasonType,
          week: latestPoll.week,
          polls: latestPoll.polls.filter(p => p.poll === 'AP Top 25')
        };
      } catch (error) {
        console.error('CFBD failed, trying ESPN scraping:', error);
      }
    }

    // Fallback to ESPN scraping
    return this.scrapeESPNRankings();
  }

  private async scrapeESPNRankings(): Promise<APPoll | null> {
    try {
      // Use ESPN's API endpoint that powers their rankings page
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings');
      const data = await response.json();

      if (!data.rankings || data.rankings.length === 0) {
        console.error('No rankings data found');
        return null;
      }

      // Find AP Top 25 poll
      const apPoll = data.rankings.find((poll: any) => 
        poll.type === 'ap' || poll.name === 'AP Top 25'
      );

      if (!apPoll || !apPoll.ranks) {
        console.error('AP Poll not found in rankings data');
        return null;
      }

      const rankings: APRanking[] = apPoll.ranks.map((team: any) => ({
        rank: team.current,
        school: team.team.location || team.team.displayName,
        conference: team.team.conferenceId ? this.getConferenceByESPNId(team.team.conferenceId.toString()) : undefined,
        firstPlaceVotes: team.firstPlaceVotes || 0,
        points: team.points || 0
      }));

      console.log(`Found ${rankings.length} teams in ESPN AP Rankings`);

      return {
        season: data.season?.year || new Date().getFullYear(),
        seasonType: 'regular',
        week: data.week?.number || 1,
        polls: [{
          poll: 'AP Top 25',
          ranks: rankings.slice(0, 25) // Ensure we only get top 25
        }]
      };
    } catch (error) {
      console.error('Failed to fetch ESPN rankings:', error);
      return null;
    }
  }

  async getTeamRoster(teamId: string): Promise<ESPNTeamRoster | null> {
    try {
      const response = await fetch(`${this.espnBase}/teams/${teamId}/roster`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      return await response.json() as ESPNTeamRoster;
    } catch (error) {
      console.error('Failed to fetch team roster:', error);
      return null;
    }
  }

  async getLiveGameStats(gameId: string): Promise<any> {
    try {
      const response = await fetch(`${this.espnBase}/summary?event=${gameId}`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch game stats:', error);
      return null;
    }
  }

  async getTeams(): Promise<Team[]> {
    try {
      const response = await fetch(`${this.espnBase}/teams?limit=150`);
      const data = await response.json() as any;
      
      // Filter for Power 4 conferences
      const power4Teams = data.sports[0].leagues[0].teams
        .filter((teamData: any) => {
          const conference = teamData.team.groups?.find((g: any) => g.isConference);
          return conference && this.power4Conferences.includes(conference.name);
        })
        .map((teamData: any) => ({
          id: teamData.team.id,
          school: teamData.team.location,
          mascot: teamData.team.name,
          abbreviation: teamData.team.abbreviation,
          displayName: teamData.team.displayName,
          conference: teamData.team.groups?.find((g: any) => g.isConference)?.name,
          conferenceId: teamData.team.groups?.find((g: any) => g.isConference)?.id,
          color: teamData.team.color,
          altColor: teamData.team.alternateColor,
          logo: teamData.team.logo
        }));

      return power4Teams;
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      return [];
    }
  }

  private transformESPNGames(data: ESPNScoreboardResponse): Game[] {
    return data.events
      .filter(event => {
        // Check if both teams are from Power 4 conferences
        const competitors = event.competitions[0].competitors;
        return competitors.every(comp => {
          const conferenceId = comp.team.conferenceId;
          return Object.values(this.conferenceIds).includes(Number(conferenceId));
        });
      })
      .map(event => {
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find(c => c.homeAway === 'home')!;
        const awayTeam = competition.competitors.find(c => c.homeAway === 'away')!;
        
        return {
          id: event.id,
          season: data.season.year,
          week: data.week.number,
          seasonType: data.season.type === 2 ? 'regular' : 'postseason',
          startDate: event.date,
          homeTeam: homeTeam.team.displayName,
          homeConference: this.getConferenceByESPNId(homeTeam.team.conferenceId),
          homePoints: homeTeam.score ? parseInt(homeTeam.score) : undefined,
          awayTeam: awayTeam.team.displayName,
          awayConference: this.getConferenceByESPNId(awayTeam.team.conferenceId),
          awayPoints: awayTeam.score ? parseInt(awayTeam.score) : undefined,
          status: this.mapESPNStatus(event.status),
          period: event.status.period,
          clock: event.status.displayClock
        };
      });
  }

  private async getCFBDGames(week?: number, year: number = new Date().getFullYear()): Promise<Game[]> {
    try {
      let url = `${this.cfbdBase}/games?year=${year}&seasonType=regular`;
      if (week) {
        url += `&week=${week}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${this.cfbdKey}` }
      });

      if (!response.ok) {
        throw new Error(`CFBD API error: ${response.status}`);
      }

      const games = await response.json() as CFBDGame[];
      
      // Filter for Power 4 conferences
      return games
        .filter(game => 
          this.power4Conferences.includes(game.home_conference || '') &&
          this.power4Conferences.includes(game.away_conference || '')
        )
        .map(game => ({
          id: game.id.toString(),
          season: game.season,
          week: game.week,
          seasonType: game.season_type,
          startDate: game.start_date,
          homeTeam: game.home_team,
          homeConference: game.home_conference,
          homePoints: game.home_points,
          awayTeam: game.away_team,
          awayConference: game.away_conference,
          awayPoints: game.away_points,
          status: this.mapCFBDStatus(game),
          period: undefined,
          clock: undefined
        }));
    } catch (error) {
      console.error('CFBD API failed:', error);
      throw error;
    }
  }

  private getConferenceByESPNId(conferenceId?: string): string | undefined {
    if (!conferenceId) return undefined;
    
    const id = Number(conferenceId);
    for (const [name, espnId] of Object.entries(this.conferenceIds)) {
      if (espnId === id) return name;
    }
    return undefined;
  }

  private mapESPNStatus(status: any): GameStatus {
    const state = status.type.state;
    const completed = status.type.completed;
    
    if (state === 'pre') return GameStatus.SCHEDULED;
    if (state === 'in' || !completed) return GameStatus.IN_PROGRESS;
    if (completed) return GameStatus.FINAL;
    
    return GameStatus.SCHEDULED;
  }

  private mapCFBDStatus(game: CFBDGame): GameStatus {
    if (game.home_points !== null && game.away_points !== null) {
      return GameStatus.FINAL;
    }
    
    const gameDate = new Date(game.start_date);
    const now = new Date();
    
    if (gameDate > now) return GameStatus.SCHEDULED;
    
    // If game time has passed but no score, assume in progress
    return GameStatus.IN_PROGRESS;
  }
}