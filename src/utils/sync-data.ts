import * as cron from 'node-cron';
import { FreeDataService } from '../services/data-service';
import { AppwriteService } from '../services/appwrite-service';
import { RateLimiter } from './rate-limiter';
import { DataCache } from './cache';

export class DataSyncService {
  private dataService: FreeDataService;
  private appwriteService: AppwriteService;
  private rateLimiter: RateLimiter;
  private cache: DataCache;

  constructor() {
    this.dataService = new FreeDataService();
    this.appwriteService = new AppwriteService();
    this.rateLimiter = new RateLimiter();
    this.cache = new DataCache();
  }

  // Sync games data for all Power 4 conferences
  async syncGamesData(week?: number, year: number = new Date().getFullYear()): Promise<void> {
    console.log(`🔄 Starting games sync for ${week ? `week ${week}` : 'current week'}`);
    
    try {
      // Fetch games
      const games = week 
        ? await this.dataService.getGamesForWeek(week, year)
        : await this.dataService.getCurrentWeekGames();

      // Store in Appwrite
      await this.appwriteService.storeGames(games);
      
      console.log(`✅ Synced ${games.length} games to Appwrite`);
    } catch (error) {
      console.error('❌ Error syncing games:', error);
    }
  }

  // Sync AP rankings
  async syncRankings(): Promise<void> {
    console.log('🔄 Starting AP rankings sync');
    
    try {
      const rankings = await this.dataService.getAPRankings();
      
      if (rankings && rankings.polls.length > 0) {
        const apPoll = rankings.polls[0];
        await this.appwriteService.storeRankings(
          apPoll.ranks,
          rankings.week,
          rankings.season
        );
        
        console.log(`✅ Synced ${apPoll.ranks.length} teams in AP rankings`);
      }
    } catch (error) {
      console.error('❌ Error syncing rankings:', error);
    }
  }

  // Sync teams data
  async syncTeams(): Promise<void> {
    console.log('🔄 Starting teams sync');
    
    try {
      const teams = await this.dataService.getTeams();
      
      if (teams.length > 0) {
        await this.appwriteService.storeTeams(teams);
        console.log(`✅ Synced ${teams.length} teams to Appwrite`);
      }
    } catch (error) {
      console.error('❌ Error syncing teams:', error);
    }
  }

  // Sync all data
  async syncAll(): Promise<void> {
    console.log('🚀 Starting full data sync');
    
    await this.syncTeams();
    await this.syncRankings();
    await this.syncGamesData();
    
    console.log('✅ Full sync completed');
  }

  // Set up scheduled syncs
  setupScheduledSyncs(): void {
    // Sync games every 5 minutes during game days (Thursday-Saturday)
    cron.schedule('*/5 * * * 4-6', async () => {
      const hour = new Date().getHours();
      // Only sync during typical game hours (10 AM - 2 AM)
      if (hour >= 10 || hour <= 2) {
        await this.syncGamesData();
      }
    });

    // Sync rankings every Tuesday at 2 PM (when AP poll is released)
    cron.schedule('0 14 * * 2', async () => {
      await this.syncRankings();
    });

    // Full sync daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
      await this.syncAll();
    });

    console.log('📅 Scheduled syncs set up:');
    console.log('  - Games: Every 5 min on game days');
    console.log('  - Rankings: Tuesdays at 2 PM');
    console.log('  - Full sync: Daily at 3 AM');
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();