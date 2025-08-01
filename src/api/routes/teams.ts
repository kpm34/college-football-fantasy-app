import { Router } from 'express';
import { FreeDataService } from '../../services/data-service';
import { DataCache } from '../../utils/cache';

const router = Router();

// GET /api/teams - Get all Power 4 teams
router.get('/', async (req, res) => {
  try {
    const dataService: FreeDataService = req.app.locals.dataService;
    const cache: DataCache = req.app.locals.cache;
    
    // Check cache first
    const cacheKey = 'api-teams';
    const cached = cache.getTeams(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const teams = await dataService.getTeams();
    
    // Group by conference
    const teamsByConference = teams.reduce((acc, team) => {
      const conf = team.conference || 'Unknown';
      if (!acc[conf]) acc[conf] = [];
      acc[conf].push(team);
      return acc;
    }, {} as Record<string, typeof teams>);
    
    const response = {
      total: teams.length,
      conferences: Object.keys(teamsByConference),
      teams: teamsByConference
    };
    
    // Cache for 24 hours
    cache.cacheTeams(cacheKey, response);
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/teams/:teamId/roster - Get team roster
router.get('/:teamId/roster', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const dataService: FreeDataService = req.app.locals.dataService;
    const cache: DataCache = req.app.locals.cache;
    
    // Check cache
    const cacheKey = `api-roster-${teamId}`;
    const cached = cache.getPlayers(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const roster = await dataService.getTeamRoster(teamId);
    
    if (!roster) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Cache for 12 hours
    cache.cachePlayers(cacheKey, roster);
    
    res.json(roster);
  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ error: 'Failed to fetch team roster' });
  }
});

export default router;