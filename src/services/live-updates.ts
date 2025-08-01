import { EventEmitter } from 'events';
import { FreeDataService } from './data-service';
import { RateLimiter } from '../utils/rate-limiter';
import { DataCache } from '../utils/cache';
import { Game, GameStatus } from '../types/api.types';

export interface GameUpdate {
  gameId: string;
  timestamp: Date;
  previousScore?: { home: number; away: number };
  currentScore: { home: number; away: number };
  status: GameStatus;
  period?: number;
  clock?: string;
  lastPlay?: string;
}

export class LiveUpdatesService extends EventEmitter {
  private dataService: FreeDataService;
  private rateLimiter: RateLimiter;
  private cache: DataCache;
  private updateInterval: NodeJS.Timeout | null = null;
  private activeGames: Set<string> = new Set();
  private gameStates: Map<string, Game> = new Map();
  private isRunning: boolean = false;

  // Polling intervals
  private readonly LIVE_GAME_INTERVAL = 30000; // 30 seconds for live games
  private readonly SCHEDULED_GAME_INTERVAL = 300000; // 5 minutes for scheduled games
  private readonly COMPLETED_GAME_INTERVAL = 900000; // 15 minutes for completed games

  constructor(dataService: FreeDataService, rateLimiter: RateLimiter, cache: DataCache) {
    super();
    this.dataService = dataService;
    this.rateLimiter = rateLimiter;
    this.cache = cache;
  }

  async startPolling(gameIds?: string[]): Promise<void> {
    if (this.isRunning) {
      console.log('Live updates already running');
      return;
    }

    this.isRunning = true;

    // If specific games provided, track them
    if (gameIds) {
      gameIds.forEach(id => this.activeGames.add(id));
    }

    // Initial update
    await this.updateGames();

    // Set up polling interval
    this.updateInterval = setInterval(async () => {
      await this.updateGames();
    }, this.LIVE_GAME_INTERVAL);

    this.emit('polling-started', { gameIds: Array.from(this.activeGames) });
  }

  stopPolling(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isRunning = false;
    this.emit('polling-stopped');
  }

  addGame(gameId: string): void {
    this.activeGames.add(gameId);
    this.emit('game-added', { gameId });
  }

  removeGame(gameId: string): void {
    this.activeGames.delete(gameId);
    this.gameStates.delete(gameId);
    this.emit('game-removed', { gameId });
  }

  private async updateGames(): Promise<void> {
    try {
      // If no specific games are being tracked, get all current week games
      if (this.activeGames.size === 0) {
        await this.updateAllCurrentGames();
        return;
      }

      // Update specific tracked games
      const updatePromises = Array.from(this.activeGames).map(gameId => 
        this.updateSingleGame(gameId)
      );

      await Promise.allSettled(updatePromises);
    } catch (error) {
      console.error('Error updating games:', error);
      this.emit('error', error);
    }
  }

  private async updateAllCurrentGames(): Promise<void> {
    // Check rate limit
    await this.rateLimiter.waitIfNeeded('espn');

    try {
      const games = await this.dataService.getCurrentWeekGames();
      
      // Cache the games
      this.cache.cacheGames('current-week-games', games, true);

      // Process each game
      games.forEach(game => {
        const previousState = this.gameStates.get(game.id);
        this.gameStates.set(game.id, game);

        // Check for updates
        if (previousState) {
          this.checkForUpdates(previousState, game);
        }

        // Track live games
        if (game.status === GameStatus.IN_PROGRESS) {
          this.activeGames.add(game.id);
        } else if (game.status === GameStatus.FINAL) {
          // Stop tracking completed games after a delay
          setTimeout(() => this.removeGame(game.id), this.COMPLETED_GAME_INTERVAL);
        }
      });

      this.emit('games-updated', { count: games.length, games });
    } catch (error) {
      console.error('Failed to update all games:', error);
      this.emit('error', { type: 'update-all-games', error });
    }
  }

  private async updateSingleGame(gameId: string): Promise<void> {
    // Check cache first
    const cachedData = this.cache.getGames(`game-${gameId}`);
    if (cachedData) {
      this.processGameUpdate(gameId, cachedData);
      return;
    }

    // Check rate limit
    await this.rateLimiter.waitIfNeeded('espn');

    try {
      const gameData = await this.dataService.getLiveGameStats(gameId);
      
      if (!gameData) {
        console.error(`No data returned for game ${gameId}`);
        return;
      }

      // Cache the game data
      this.cache.cacheGames(`game-${gameId}`, gameData, true);

      this.processGameUpdate(gameId, gameData);
    } catch (error) {
      console.error(`Failed to update game ${gameId}:`, error);
      this.emit('error', { type: 'update-game', gameId, error });
    }
  }

  private processGameUpdate(gameId: string, gameData: any): void {
    // Transform ESPN data to our Game format
    const game = this.transformGameData(gameId, gameData);
    
    const previousState = this.gameStates.get(gameId);
    this.gameStates.set(gameId, game);

    if (previousState) {
      this.checkForUpdates(previousState, game);
    }
  }

  private transformGameData(gameId: string, espnData: any): Game {
    const competition = espnData.header?.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const home = competitors.find((c: any) => c.homeAway === 'home');
    const away = competitors.find((c: any) => c.homeAway === 'away');

    return {
      id: gameId,
      season: new Date().getFullYear(),
      week: espnData.header?.week || 0,
      seasonType: 'regular',
      startDate: competition.date,
      homeTeam: home?.team?.displayName || '',
      homeConference: home?.team?.conference || undefined,
      homePoints: home?.score ? parseInt(home.score) : undefined,
      awayTeam: away?.team?.displayName || '',
      awayConference: away?.team?.conference || undefined,
      awayPoints: away?.score ? parseInt(away.score) : undefined,
      status: this.mapGameStatus(competition.status),
      period: competition.status?.period,
      clock: competition.status?.displayClock
    };
  }

  private mapGameStatus(espnStatus: any): GameStatus {
    if (!espnStatus) return GameStatus.SCHEDULED;

    const state = espnStatus.type?.state;
    const completed = espnStatus.type?.completed;

    if (state === 'pre') return GameStatus.SCHEDULED;
    if (completed) return GameStatus.FINAL;
    if (state === 'in') return GameStatus.IN_PROGRESS;

    return GameStatus.SCHEDULED;
  }

  private checkForUpdates(previousState: Game, currentState: Game): void {
    const updates: Partial<GameUpdate> = {
      gameId: currentState.id,
      timestamp: new Date()
    };

    let hasUpdate = false;

    // Check for score changes
    if (previousState.homePoints !== currentState.homePoints || 
        previousState.awayPoints !== currentState.awayPoints) {
      updates.previousScore = {
        home: previousState.homePoints || 0,
        away: previousState.awayPoints || 0
      };
      updates.currentScore = {
        home: currentState.homePoints || 0,
        away: currentState.awayPoints || 0
      };
      hasUpdate = true;

      this.emit('score-update', {
        ...updates,
        game: currentState
      });
    }

    // Check for status changes
    if (previousState.status !== currentState.status) {
      updates.status = currentState.status;
      hasUpdate = true;

      this.emit('status-update', {
        ...updates,
        previousStatus: previousState.status,
        game: currentState
      });
    }

    // Check for period/clock changes
    if (previousState.period !== currentState.period || 
        previousState.clock !== currentState.clock) {
      updates.period = currentState.period;
      updates.clock = currentState.clock;
      hasUpdate = true;

      this.emit('game-clock-update', {
        ...updates,
        game: currentState
      });
    }

    if (hasUpdate) {
      this.emit('game-update', {
        ...updates,
        game: currentState
      });
    }
  }

  getGameState(gameId: string): Game | undefined {
    return this.gameStates.get(gameId);
  }

  getAllGameStates(): Game[] {
    return Array.from(this.gameStates.values());
  }

  getLiveGames(): Game[] {
    return this.getAllGameStates().filter(
      game => game.status === GameStatus.IN_PROGRESS
    );
  }

  isGameLive(gameId: string): boolean {
    const game = this.gameStates.get(gameId);
    return game?.status === GameStatus.IN_PROGRESS || false;
  }

  destroy(): void {
    this.stopPolling();
    this.removeAllListeners();
    this.activeGames.clear();
    this.gameStates.clear();
  }
}