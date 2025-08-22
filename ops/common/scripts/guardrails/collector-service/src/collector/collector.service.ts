import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios, { AxiosInstance } from 'axios';
import { Redis } from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { DATA_FEEDS, FeedPriorityManager } from '../../../data-feeds/feed-config';

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);
  private feedManager = new FeedPriorityManager();
  private axiosInstances: Map<string, AxiosInstance> = new Map();
  private redis: Redis;
  
  constructor(
    @InjectQueue('data-processing') private dataQueue: Queue,
    private databaseService: DatabaseService,
    private storageService: StorageService,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    
    this.initializeAxiosInstances();
  }
  
  private initializeAxiosInstances() {
    Object.entries(DATA_FEEDS).forEach(([name, config]) => {
      const instance = axios.create({
        baseURL: config.baseUrl,
        timeout: 30000,
      });
      
      if (config.authentication.type !== 'none') {
        instance.interceptors.request.use((req) => {
          if (config.authentication.type === 'bearer') {
            req.headers.Authorization = `Bearer ${config.authentication.credentials?.token}`;
          } else if (config.authentication.type === 'api_key') {
            req.headers[config.authentication.headerName!] = config.authentication.credentials?.key;
          }
          return req;
        });
      }
      
      this.axiosInstances.set(name, instance);
    });
  }
  
  // Pre-season data collection
  @Cron('0 0 * * *') // Daily at midnight
  async collectPreSeasonData() {
    this.logger.log('Starting pre-season data collection');
    
    await this.collectTeams();
    await this.collectRosters();
    await this.collectSchedule();
  }
  
  // Nightly updates
  @Cron('0 2 * * *') // 2 AM daily
  async collectNightlyUpdates() {
    this.logger.log('Starting nightly data updates');
    
    await this.collectInjuries();
    await this.collectDepthCharts();
    await this.collectTransferPortalMoves();
  }
  
  // Game day real-time collection
  async startGameDayCollection(gameId: string) {
    this.logger.log(`Starting game day collection for game ${gameId}`);
    
    const jobId = `game-${gameId}`;
    
    // Add to Bull queue for processing every 30 seconds
    await this.dataQueue.add(
      'collect-game-data',
      { gameId, feedType: 'live' },
      {
        repeat: {
          every: 30000, // 30 seconds
        },
        jobId,
      }
    );
  }
  
  async collectTeams() {
    try {
      const feed = this.feedManager.getActiveFeed('teams');
      if (!feed) throw new Error('No active feed for teams');
      
      const axiosInstance = this.axiosInstances.get(feed.name);
      const startTime = Date.now();
      
      const response = await axiosInstance!.get(feed.endpoints.teams.path, {
        params: {
          conference: 'SEC,B1G,ACC,B12'
        }
      });
      
      const responseTime = Date.now() - startTime;
      this.feedManager.recordSuccess(feed.name, responseTime);
      
      // Store raw data in S3
      await this.storageService.storeRawData('teams', response.data);
      
      // Parse and store in Postgres
      await this.databaseService.upsertTeams(response.data);
      
      // Cache in Redis
      await this.redis.setex(
        'teams:power4',
        3600,
        JSON.stringify(response.data)
      );
      
    } catch (error) {
      this.logger.error('Failed to collect teams data', error);
      throw error;
    }
  }
  
  async collectRosters() {
    try {
      const teams = await this.databaseService.getTeams();
      
      for (const team of teams) {
        const feed = this.feedManager.getActiveFeed('roster');
        if (!feed) continue;
        
        const axiosInstance = this.axiosInstances.get(feed.name);
        
        try {
          const response = await axiosInstance!.get(
            feed.endpoints.roster.path.replace('{team_id}', team.id)
          );
          
          await this.storageService.storeRawData(`roster-${team.id}`, response.data);
          await this.databaseService.upsertPlayers(team.id, response.data);
          
        } catch (error) {
          this.logger.error(`Failed to collect roster for team ${team.id}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to collect rosters', error);
      throw error;
    }
  }
  
  async collectSchedule() {
    try {
      const feed = this.feedManager.getActiveFeed('games');
      if (!feed) throw new Error('No active feed for games');
      
      const axiosInstance = this.axiosInstances.get(feed.name);
      const currentYear = new Date().getFullYear();
      
      const response = await axiosInstance!.get(feed.endpoints.games.path, {
        params: {
          year: currentYear,
          seasonType: 'regular',
          conference: 'SEC,B1G,ACC,B12'
        }
      });
      
      await this.storageService.storeRawData('schedule', response.data);
      await this.databaseService.upsertGames(response.data);
      
    } catch (error) {
      this.logger.error('Failed to collect schedule', error);
      throw error;
    }
  }
  
  async collectInjuries() {
    try {
      const feed = this.feedManager.getActiveFeed('injuries');
      if (!feed) return;
      
      const axiosInstance = this.axiosInstances.get(feed.name);
      const response = await axiosInstance!.get(feed.endpoints.injuries.path);
      
      await this.storageService.storeRawData('injuries', response.data);
      await this.databaseService.updatePlayerInjuries(response.data);
      
      // Publish to Redis stream for real-time updates
      await this.redis.xadd(
        'injuries:stream',
        '*',
        'data',
        JSON.stringify(response.data),
        'timestamp',
        Date.now().toString()
      );
      
    } catch (error) {
      this.logger.error('Failed to collect injuries', error);
    }
  }
  
  async collectDepthCharts() {
    // Implementation for depth charts collection
    this.logger.log('Collecting depth charts');
  }
  
  async collectTransferPortalMoves() {
    // Implementation for transfer portal tracking
    this.logger.log('Collecting transfer portal moves');
  }
  
  async collectLiveGameData(gameId: string) {
    try {
      const feed = this.feedManager.getActiveFeed('plays');
      if (!feed) throw new Error('No active feed for live data');
      
      const axiosInstance = this.axiosInstances.get(feed.name);
      const response = await axiosInstance!.get(
        feed.endpoints.plays.path.replace('{game_id}', gameId)
      );
      
      // Store raw data
      await this.storageService.storeRawData(`game-${gameId}-live`, response.data);
      
      // Process and store game events
      await this.databaseService.insertGameEvents(gameId, response.data);
      
      // Publish to Redis stream for real-time consumption
      await this.redis.xadd(
        `game:${gameId}:stream`,
        '*',
        'plays',
        JSON.stringify(response.data),
        'timestamp',
        Date.now().toString()
      );
      
      // Check if game is complete
      if (response.data.status === 'completed') {
        await this.dataQueue.removeRepeatable({
          jobId: `game-${gameId}`,
        });
      }
      
    } catch (error) {
      this.logger.error(`Failed to collect live data for game ${gameId}`, error);
      
      // Try fallback feed
      const fallbackFeed = DATA_FEEDS.ESPN_FALLBACK;
      try {
        const fallbackInstance = this.axiosInstances.get('ESPN_FALLBACK');
        const fallbackResponse = await fallbackInstance!.get(
          `/games/${gameId}/summary`
        );
        
        await this.redis.xadd(
          `game:${gameId}:stream`,
          '*',
          'fallback',
          JSON.stringify(fallbackResponse.data),
          'timestamp',
          Date.now().toString()
        );
        
      } catch (fallbackError) {
        this.logger.error('Fallback feed also failed', fallbackError);
      }
    }
  }
}