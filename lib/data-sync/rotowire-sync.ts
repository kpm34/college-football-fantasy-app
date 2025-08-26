import { databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite';
import { ID, Query } from 'appwrite';
import { RotowireScraper } from '@lib/rotowire/scraper';
import { kv } from '@vercel/kv';

export interface InjuryReport {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  injury: string;
  status: 'Out' | 'Doubtful' | 'Questionable' | 'Probable' | 'Day-to-Day';
  lastUpdate: string;
  details?: string;
  returnDate?: string;
}

export interface DepthChartEntry {
  team: string;
  position: string;
  depth: number;
  playerId: string;
  playerName: string;
  notes?: string;
}

export class RotowireSync {
  private scraper: RotowireScraper;
  
  constructor() {
    this.scraper = new RotowireScraper();
  }
  
  async sync(options: any = {}) {
    console.log('🏈 Rotowire Sync: Starting...');
    
    let created = 0, updated = 0, errors = 0;
    
    try {
      await this.scraper.initialize();
      await this.scraper.login();
      
      // Sync different data types
      const results = await Promise.allSettled([
        this.syncNews(),
        this.syncInjuries(),
        this.syncDepthCharts(),
        this.syncProjections(options.week)
      ]);
      
      // Aggregate results
      results.forEach((result, index) => {
        const dataType = ['news', 'injuries', 'depth charts', 'projections'][index];
        if (result.status === 'fulfilled') {
          created += result.value.created;
          updated += result.value.updated;
          console.log(`  ✅ ${dataType}: synced successfully`);
        } else {
          errors++;
          console.error(`  ❌ ${dataType}: ${result.reason}`);
        }
      });
      
    } catch (error) {
      console.error('Rotowire sync error:', error);
      errors++;
    } finally {
      await this.scraper.close();
    }
    
    return { created, updated, errors };
  }
  
  private async syncNews() {
    const news = await this.scraper.getCollegeFootballNews();
    
    // Cache in KV store
    await kv.setex('rotowire:news:latest', 3600, JSON.stringify(news));
    
    // Store significant news in Appwrite
    let created = 0, updated = 0;
    
    for (const item of news.filter(n => n.impact === 'high')) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ACTIVITY_LOG,
          ID.unique(),
          {
            type: 'news',
            action: 'rotowire_news',
            userId: 'system',
            details: item,
            createdAt: new Date().toISOString()
          }
        );
        created++;
      } catch (error) {
        // Ignore duplicates
      }
    }
    
    return { created, updated };
  }
  
  private async syncInjuries() {
    console.log('  📍 Syncing injury reports...');
    
    try {
      // Navigate to injury page
      const injuries = await this.scraper.getInjuryReports();
      
      // Cache all injuries
      await kv.setex('rotowire:injuries:latest', 1800, JSON.stringify(injuries));
      
      // Update player statuses in database
      let created = 0, updated = 0;
      
      for (const injury of injuries) {
        try {
          // Find player in database
          const players = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            [
              Query.equal('name', injury.playerName),
              Query.equal('team', injury.team)
            ]
          );
          
          if (players.documents.length > 0) {
            const player = players.documents[0];
            
            // Update player with injury status
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYERS,
              player.$id,
              {
                injuryStatus: injury.status,
                injury_details: injury.injury,
                injury_updated: injury.lastUpdate
              }
            );
            updated++;
            
            // Log significant injuries
            if (['Out', 'Doubtful'].includes(injury.status)) {
              await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.ACTIVITY_LOG,
                ID.unique(),
                {
                  type: 'injury_update',
                  action: 'player_injury',
                  userId: 'system',
                  details: {
                    playerId: player.$id,
                    playerName: injury.playerName,
                    team: injury.team,
                    status: injury.status,
                    injury: injury.injury
                  },
                  createdAt: new Date().toISOString()
                }
              );
            }
          }
        } catch (error) {
          // Continue with next injury
        }
      }
      
      return { created, updated };
      
    } catch (error) {
      console.error('Error syncing injuries:', error);
      return { created: 0, updated: 0 };
    }
  }
  
  private async syncDepthCharts() {
    console.log('  📍 Syncing depth charts...');
    
    try {
      const depthCharts = await this.scraper.getDepthCharts();
      
      // Cache depth charts
      await kv.setex('rotowire:depthcharts:latest', 3600, JSON.stringify(depthCharts));
      
      // Update player depth in database
      let created = 0, updated = 0;
      
      for (const entry of depthCharts) {
        try {
          const players = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            [
              Query.equal('name', entry.playerName),
              Query.equal('team', entry.team)
            ]
          );
          
          if (players.documents.length > 0) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYERS,
              players.documents[0].$id,
              {
                depth_chart_position: entry.position,
                depth: entry.depth,
                is_starter: entry.depth === 1
              }
            );
            updated++;
          }
        } catch (error) {
          // Continue with next entry
        }
      }
      
      return { created, updated };
      
    } catch (error) {
      console.error('Error syncing depth charts:', error);
      return { created: 0, updated: 0 };
    }
  }
  
  private async syncProjections(week?: number) {
    if (!week) {
      // Get current week from games
      const currentGames = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [
          Query.equal('completed', false),
          Query.orderAsc('week'),
          Query.limit(1)
        ]
      );
      
      week = currentGames.documents[0]?.week || 1;
    }
    
    console.log(`  📍 Syncing projections for week ${week}...`);
    
    try {
      const projections = await this.scraper.getPlayerProjections(week);
      
      // Cache projections
      await kv.setex(`rotowire:projections:week${week}`, 21600, JSON.stringify(projections));
      
      // Store in database
      let created = 0, updated = 0;
      
      for (const projection of projections) {
        try {
          // Find player
          const players = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            [
              Query.equal('name', projection.playerName),
              Query.equal('team', projection.team)
            ]
          );
          
          if (players.documents.length > 0) {
            const playerId = players.documents[0].$id;
            
            // Check if projection exists
            const existing = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.PROJECTIONS,
              [
                Query.equal('playerId', playerId),
                Query.equal('week', week)
              ]
            );
            
            const projectionData = {
              playerId,
              playerName: projection.playerName,
              team: projection.team,
              position: projection.position,
              opponent: projection.opponent,
              week: week,
              projectedPoints: projection.projectedPoints,
              passingYards: projection.passingYards || 0,
              passingTDs: projection.passingTDs || 0,
              rushingYards: projection.rushingYards || 0,
              rushingTDs: projection.rushingTDs || 0,
              receptions: projection.receptions || 0,
              receivingYards: projection.receivingYards || 0,
              receivingTDs: projection.receivingTDs || 0,
              source: 'rotowire'
            };
            
            if (existing.documents.length > 0) {
              await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PROJECTIONS,
                existing.documents[0].$id,
                projectionData
              );
              updated++;
            } else {
              await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PROJECTIONS,
                ID.unique(),
                projectionData
              );
              created++;
            }
          }
        } catch (error) {
          // Continue with next projection
        }
      }
      
      return { created, updated };
      
    } catch (error) {
      console.error('Error syncing projections:', error);
      return { created: 0, updated: 0 };
    }
  }
}
