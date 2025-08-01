import { Router } from 'express';
import { FreeDataService } from '../../services/data-service';
import { EligibilityChecker } from '../../services/eligibility-checker';

const router = Router();

// GET /api/eligibility/check - Check if a game is eligible
router.get('/check', async (req, res) => {
  try {
    const { playerTeam, opponentTeam } = req.query;
    
    if (!playerTeam || !opponentTeam) {
      return res.status(400).json({ 
        error: 'Missing required parameters: playerTeam and opponentTeam' 
      });
    }
    
    const dataService: FreeDataService = req.app.locals.dataService;
    const eligibilityChecker: EligibilityChecker = req.app.locals.eligibilityChecker;
    
    // Get current rankings
    const rankings = await dataService.getAPRankings();
    if (rankings && rankings.polls.length > 0) {
      eligibilityChecker.updateAPRankings(rankings.polls[0].ranks);
    }
    
    // Get current games to find the matchup
    const games = await dataService.getCurrentWeekGames();
    const game = games.find(g => 
      (g.homeTeam === playerTeam && g.awayTeam === opponentTeam) ||
      (g.awayTeam === playerTeam && g.homeTeam === opponentTeam)
    );
    
    if (!game) {
      return res.status(404).json({ 
        error: 'Game not found for these teams this week' 
      });
    }
    
    const isEligible = eligibilityChecker.isGameEligible(game, playerTeam as string);
    const reason = eligibilityChecker.getEligibilityReason(game, playerTeam as string);
    
    res.json({
      playerTeam,
      opponentTeam,
      eligible: isEligible,
      reason,
      game
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// GET /api/eligibility/report - Get eligibility report for current week
router.get('/report', async (req, res) => {
  try {
    const dataService: FreeDataService = req.app.locals.dataService;
    const eligibilityChecker: EligibilityChecker = req.app.locals.eligibilityChecker;
    
    // Get current data
    const [games, rankings] = await Promise.all([
      dataService.getCurrentWeekGames(),
      dataService.getAPRankings()
    ]);
    
    if (rankings && rankings.polls.length > 0) {
      eligibilityChecker.updateAPRankings(rankings.polls[0].ranks);
    }
    
    const report = eligibilityChecker.generateEligibilityReport(games);
    
    res.json({
      week: rankings?.week || 'current',
      ...report,
      rankedTeams: rankings?.polls[0]?.ranks.length || 0
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate eligibility report' });
  }
});

// GET /api/eligibility/team/:teamName - Get eligible games for a team
router.get('/team/:teamName', async (req, res) => {
  try {
    const teamName = decodeURIComponent(req.params.teamName);
    const dataService: FreeDataService = req.app.locals.dataService;
    const eligibilityChecker: EligibilityChecker = req.app.locals.eligibilityChecker;
    
    // Get current data
    const [games, rankings] = await Promise.all([
      dataService.getCurrentWeekGames(),
      dataService.getAPRankings()
    ]);
    
    if (rankings && rankings.polls.length > 0) {
      eligibilityChecker.updateAPRankings(rankings.polls[0].ranks);
    }
    
    const eligibleGames = eligibilityChecker.getEligibleGamesForTeam(teamName, games);
    
    res.json({
      team: teamName,
      totalGames: games.filter(g => g.homeTeam === teamName || g.awayTeam === teamName).length,
      eligibleGames: eligibleGames.length,
      games: eligibleGames.map(game => ({
        ...game,
        eligibilityReason: eligibilityChecker.getEligibilityReason(game, teamName)
      }))
    });
  } catch (error) {
    console.error('Error fetching team eligibility:', error);
    res.status(500).json({ error: 'Failed to fetch team eligibility' });
  }
});

export default router;