import { Router } from 'express';
import { AppwriteDataService } from '../../services/appwrite-data-service';
import { DataCache } from '../../utils/cache';

const router = Router();

// GET /api/rankings - Get current AP Top 25 rankings
router.get('/', async (req, res) => {
  try {
    const dataService: AppwriteDataService = req.app.locals.dataService;
    const cache: DataCache = req.app.locals.cache;
    
    // Check cache first
    const cacheKey = 'api-rankings-current';
    const cached = cache.getRankings(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const rankings = await dataService.getAPRankings();
    
    if (!rankings) {
      return res.status(404).json({ error: 'Rankings not available' });
    }
    
    // Cache for 1 hour
    cache.cacheRankings(cacheKey, rankings);
    
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// GET /api/rankings/week/:week - Get rankings for specific week
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
    const cacheKey = `api-rankings-week-${week}-${year}`;
    const cached = cache.getRankings(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const rankings = await dataService.getAPRankings(week, year);
    
    if (!rankings) {
      return res.status(404).json({ error: 'Rankings not available for this week' });
    }
    
    // Cache for 1 hour
    cache.cacheRankings(cacheKey, rankings);
    
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// GET /api/rankings/team/:teamName - Check if team is ranked
router.get('/team/:teamName', async (req, res) => {
  try {
    const teamName = decodeURIComponent(req.params.teamName);
    const dataService: AppwriteDataService = req.app.locals.dataService;
    
    const rankings = await dataService.getAPRankings();
    
    if (!rankings || rankings.polls.length === 0) {
      return res.status(404).json({ error: 'Rankings not available' });
    }
    
    const apPoll = rankings.polls[0];
    const teamRank = apPoll.ranks.find(r => 
      r.school.toLowerCase() === teamName.toLowerCase()
    );
    
    res.json({
      team: teamName,
      isRanked: !!teamRank,
      rank: teamRank?.rank || null,
      points: teamRank?.points || 0,
      firstPlaceVotes: teamRank?.firstPlaceVotes || 0
    });
  } catch (error) {
    console.error('Error checking team ranking:', error);
    res.status(500).json({ error: 'Failed to check team ranking' });
  }
});

export default router;