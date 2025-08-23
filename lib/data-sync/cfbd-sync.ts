import { databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';
import { ID, Query } from 'appwrite';

const CFBD_API_KEY = process.env.CFBD_API_KEY || process.env.NEXT_PUBLIC_CFBD_API_KEY;
const CFBD_BASE_URL = 'https://api.collegefootballdata.com';
const POWER_4_CONFERENCES = ['SEC', 'ACC', 'Big 12', 'Big Ten'];

interface CFBDTeam {
  id: number;
  school: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  division: string;
  color: string;
  alt_color: string;
  logos: string[];
  venue_id?: number;
  location?: {
    city?: string;
    state?: string;
  };
}

interface CFBDPlayer {
  id: number;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  jersey?: number;
  height?: number;
  weight?: number;
  year?: number;
}

interface CFBDGame {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  home_team: string;
  home_conference?: string;
  home_points?: number;
  away_team: string;
  away_conference?: string;
  away_points?: number;
  venue?: string;
  completed: boolean;
  neutral_site: boolean;
}

export class CFBDSync {
  private apiKey: string;
  
  constructor() {
    this.apiKey = CFBD_API_KEY || '';
    if (!this.apiKey) {
      console.warn('CFBD API key not configured');
    }
  }
  
  async sync(options: any = {}) {
    const season = options.season || new Date().getFullYear();
    const week = options.week;
    
    console.log(`🏈 CFBD Sync: Season ${season}${week ? ` Week ${week}` : ''}`);
    
    const results = {
      teams: await this.syncTeams(season),
      players: await this.syncPlayers(season),
      games: await this.syncGames(season, week),
      rankings: await this.syncRankings(season, week)
    };
    
    return {
      created: Object.values(results).reduce((sum, r) => sum + r.created, 0),
      updated: Object.values(results).reduce((sum, r) => sum + r.updated, 0),
      errors: Object.values(results).reduce((sum, r) => sum + r.errors, 0),
      details: results
    };
  }
  
  private async fetchFromCFBD(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${CFBD_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async syncTeams(season: number) {
    console.log('  📍 Syncing teams...');
    let created = 0, updated = 0, errors = 0;
    
    try {
      const teams: CFBDTeam[] = await this.fetchFromCFBD('/teams', { year: season });
      const power4Teams = teams.filter(team => POWER_4_CONFERENCES.includes(team.conference));
      
      for (const team of power4Teams) {
        try {
          const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SCHOOLS,
            [Query.equal('school', team.school)]
          );
          
          const teamData = {
            school: team.school,
            mascot: team.mascot || '',
            abbreviation: team.abbreviation || '',
            conference: team.conference,
            division: team.division || '',
            color: team.color || '',
            alt_color: team.alt_color || '',
            logos: JSON.stringify(team.logos || []),
            venue_id: team.venue_id?.toString() || '',
            location_city: team.location?.city || '',
            location_state: team.location?.state || '',
            power_4: true,
            season: season
          };
          
          if (existing.documents.length > 0) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.SCHOOLS,
              existing.documents[0].$id,
              teamData
            );
            updated++;
          } else {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.SCHOOLS,
              ID.unique(),
              teamData
            );
            created++;
          }
        } catch (error) {
          console.error(`    ❌ Error syncing team ${team.school}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error('  ❌ Error fetching teams:', error);
      errors++;
    }
    
    console.log(`  ✅ Teams: ${created} created, ${updated} updated, ${errors} errors`);
    return { created, updated, errors };
  }
  
  private async syncPlayers(season: number) {
    console.log('  📍 Syncing players...');
    let created = 0, updated = 0, errors = 0;
    const fantasyPositions = ['QB', 'RB', 'WR', 'TE', 'K'];
    
    try {
      for (const conference of POWER_4_CONFERENCES) {
        const rosters = await this.fetchFromCFBD('/roster', { year: season, conference });
        const fantasyPlayers = rosters.filter((p: CFBDPlayer) => fantasyPositions.includes(p.position));
        
        for (const player of fantasyPlayers) {
          try {
            const existing = await databases.listDocuments(
              DATABASE_ID,
              'college_players', // Use correct collection name
              [Query.equal('cfbd_id', player.id.toString())]
            );
            
            const playerData = {
              cfbd_id: player.id.toString(),
              first_name: player.first_name || '',
              last_name: player.last_name || '',
              name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
              position: player.position,
              team: player.team,
              conference: conference,
              jersey: player.jersey?.toString() || '',
              height: player.height ? `${Math.floor(player.height / 12)}-${player.height % 12}` : '',
              weight: player.weight?.toString() || '',
              year: player.year ? this.getYearString(player.year) : 'FR',
              season: season,
              draftable: true,
              power_4: true
            };
            
            if (existing.documents.length > 0) {
              await databases.updateDocument(
                DATABASE_ID,
                'college_players', // Use correct collection name
                existing.documents[0].$id,
                playerData
              );
              updated++;
            } else {
              await databases.createDocument(
                DATABASE_ID,
                'college_players', // Use correct collection name
                ID.unique(),
                playerData
              );
              created++;
            }
          } catch (error) {
            errors++;
          }
        }
      }
    } catch (error) {
      console.error('  ❌ Error fetching players:', error);
      errors++;
    }
    
    console.log(`  ✅ Players: ${created} created, ${updated} updated, ${errors} errors`);
    return { created, updated, errors };
  }
  
  private async syncGames(season: number, week?: number) {
    console.log('  📍 Syncing games...');
    let created = 0, updated = 0, errors = 0;
    
    try {
      const params: any = { year: season, seasonType: 'regular' };
      if (week) params.week = week;
      
      const games: CFBDGame[] = await this.fetchFromCFBD('/games', params);
      const power4Games = games.filter(game => 
        POWER_4_CONFERENCES.includes(game.home_conference || '') || 
        POWER_4_CONFERENCES.includes(game.away_conference || '')
      );
      
      for (const game of power4Games) {
        try {
          const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.GAMES,
            [Query.equal('cfbd_id', game.id.toString())]
          );
          
          const gameData = {
            cfbd_id: game.id.toString(),
            season: game.season,
            week: game.week,
            season_type: game.season_type,
            start_date: game.start_date,
            home_team: game.home_team,
            home_conference: game.home_conference || '',
            home_points: game.home_points || 0,
            away_team: game.away_team,
            away_conference: game.away_conference || '',
            away_points: game.away_points || 0,
            venue: game.venue || '',
            completed: game.completed || false,
            neutral_site: game.neutral_site || false
          };
          
          if (existing.documents.length > 0) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.GAMES,
              existing.documents[0].$id,
              gameData
            );
            updated++;
          } else {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.GAMES,
              ID.unique(),
              gameData
            );
            created++;
          }
        } catch (error) {
          errors++;
        }
      }
    } catch (error) {
      console.error('  ❌ Error fetching games:', error);
      errors++;
    }
    
    console.log(`  ✅ Games: ${created} created, ${updated} updated, ${errors} errors`);
    return { created, updated, errors };
  }
  
  private async syncRankings(season: number, week?: number) {
    console.log('  📍 Syncing rankings...');
    let created = 0, updated = 0, errors = 0;
    
    try {
      const params: any = { year: season, seasonType: 'regular' };
      if (week) params.week = week;
      
      const rankings = await this.fetchFromCFBD('/rankings', params);
      
      // Find AP poll
      const apPoll = rankings.find((poll: any) => 
        poll.polls?.find((p: any) => p.poll === 'AP Top 25')
      );
      
      if (apPoll) {
        const apRankings = apPoll.polls.find((p: any) => p.poll === 'AP Top 25').ranks;
        
        for (const ranking of apRankings) {
          try {
            const existing = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.RANKINGS,
              [
                Query.equal('school', ranking.school),
                Query.equal('week', apPoll.week),
                Query.equal('season', apPoll.season)
              ]
            );
            
            const rankingData = {
              school: ranking.school,
              conference: ranking.conference || '',
              rank: ranking.rank,
              points: ranking.points || 0,
              first_place_votes: ranking.firstPlaceVotes || 0,
              season: apPoll.season,
              week: apPoll.week,
              poll: 'AP Top 25'
            };
            
            if (existing.documents.length > 0) {
              await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.RANKINGS,
                existing.documents[0].$id,
                rankingData
              );
              updated++;
            } else {
              await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.RANKINGS,
                ID.unique(),
                rankingData
              );
              created++;
            }
          } catch (error) {
            errors++;
          }
        }
      }
    } catch (error) {
      console.error('  ❌ Error fetching rankings:', error);
      errors++;
    }
    
    console.log(`  ✅ Rankings: ${created} created, ${updated} updated, ${errors} errors`);
    return { created, updated, errors };
  }
  
  private getYearString(year: number): string {
    switch(year) {
      case 1: return 'FR';
      case 2: return 'SO';
      case 3: return 'JR';
      case 4: return 'SR';
      default: return 'FR';
    }
  }
}
