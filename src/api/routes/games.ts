import { Router } from 'express';
import { AppwriteDataService } from '../../services/appwrite-data-service';
import { EligibilityChecker } from '../../services/eligibility-checker';
import { DataCache } from '../../utils/cache';

const router = Router();

// GET /api/games - Get current week games
router.get('/', async (req, res) => {
  try {
    const dataService: AppwriteDataService = req.app.locals.dataService;
    const cache: DataCache = req.app.locals.cache;
    
    // Check cache first
    const cacheKey = 'api-current-games';
    const cached = cache.getGames(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const games = await dataService.getCurrentWeekGames();
    
    // Cache for 5 minutes
    cache.cacheGames(cacheKey, games, true);
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/games/week/:week - Get games for specific week
router.get('/week/:week', async (req, res) => {
  try {
    const week = parseInt(req.params.week);
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    
    if (isNaN(week) || week < 1 || week > 15) {
      return res.status(400).json({ error: 'Invalid week number' });
    }
    
    const dataService: AppwriteDataService = req.app.locals.dataService;
    const cache: DataCache = req.app.locals.cache;
    
    // Check cache
    const cacheKey = `api-games-week-${week}-${year}`;
    const cached = cache.getGames(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const games = await dataService.getGamesForWeek(week, year);
    
    // Cache for 1 hour for past/future weeks
    cache.cacheGames(cacheKey, games, false);
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// GET /api/games/eligible - Get only eligible games
router.get('/eligible', async (req, res) => {
  try {
    const dataService: AppwriteDataService = req.app.locals.dataService;
    const eligibilityChecker: EligibilityChecker = req.app.locals.eligibilityChecker;
    
    // Get current games
    const games = await dataService.getCurrentWeekGames();
    
    // Get AP rankings to check eligibility
    const rankings = await dataService.getAPRankings();
    if (rankings && rankings.polls.length > 0) {
      eligibilityChecker.updateAPRankings(rankings.polls[0].ranks);
    }
    
    // Filter for eligible games
    const eligibleGames = games.filter(game => {
      const homeEligible = eligibilityChecker.isGameEligible(game, game.homeTeam);
      const awayEligible = eligibilityChecker.isGameEligible(game, game.awayTeam);
      return homeEligible || awayEligible;
    });
    
    res.json({
      total: games.length,
      eligible: eligibleGames.length,
      games: eligibleGames.map(game => ({
        ...game,
        eligibilityReasons: {
          home: eligibilityChecker.getEligibilityReason(game, game.homeTeam),
          away: eligibilityChecker.getEligibilityReason(game, game.awayTeam)
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching eligible games:', error);
    res.status(500).json({ error: 'Failed to fetch eligible games' });
  }
});

// GET /api/games/:gameId - Get specific game details
router.get('/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const dataService: AppwriteDataService = req.app.locals.dataService;
    
    const gameStats = await dataService.getLiveGameStats(gameId);
    
    if (!gameStats) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(gameStats);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

export default router;