/**
 * Appwrite Function: Weekly Scoring Calculator
 * Runs every Sunday night to calculate fantasy scores
 */

import { Client, Databases, Query } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID;

// Main function entry point
export default async ({ req, res, log, error }) => {
  try {
    log('Starting weekly scoring calculation...');
    
    const week = req.query.week || getCurrentWeek();
    const season = req.query.season || new Date().getFullYear();
    
    // Get all active leagues
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [
        Query.equal('status', ['active']),
        Query.equal('season', [season])
      ]
    );
    
    log(`Processing ${leagues.documents.length} active leagues for week ${week}`);
    
    // Process each league
    const results = await Promise.all(
      leagues.documents.map(league => processLeague(league, week, log))
    );
    
    // Update last calculation timestamp
    await databases.createDocument(
      DATABASE_ID,
      'scoring_logs',
      'unique()',
      {
        week,
        season,
        leaguesProcessed: results.length,
        successCount: results.filter(r => r.success).length,
        timestamp: new Date().toISOString()
      }
    );
    
    return res.json({
      success: true,
      week,
      season,
      leaguesProcessed: results.length,
      results: results.map(r => ({
        leagueId: r.leagueId,
        success: r.success,
        matchupsUpdated: r.matchupsUpdated
      }))
    });
    
  } catch (err) {
    error('Weekly scoring failed: ' + err.message);
    return res.json({ 
      success: false, 
      error: err.message 
    }, 500);
  }
};

async function processLeague(league, week, log) {
  try {
    log(`Processing league: ${league.name} (${league.$id})`);
    
    // Get all rosters in the league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      'rosters',
      [Query.equal('leagueId', [league.$id])]
    );
    
    // Get this week's matchups
    const matchups = await databases.listDocuments(
      DATABASE_ID,
      'matchups',
      [
        Query.equal('leagueId', [league.$id]),
        Query.equal('week', [week])
      ]
    );
    
    // Calculate scores for each roster
    const rosterScores = await Promise.all(
      rosters.documents.map(roster => calculateRosterScore(roster, week, league))
    );
    
    // Update matchup results
    const matchupUpdates = await updateMatchupScores(
      matchups.documents, 
      rosterScores,
      week
    );
    
    // Update roster records
    await updateRosterRecords(rosterScores, rosters.documents);
    
    return {
      leagueId: league.$id,
      success: true,
      matchupsUpdated: matchupUpdates.length,
      rostersProcessed: rosterScores.length
    };
    
  } catch (err) {
    log(`Error processing league ${league.$id}: ${err.message}`);
    return {
      leagueId: league.$id,
      success: false,
      error: err.message
    };
  }
}

async function calculateRosterScore(roster, week, league) {
  // Get lineup for this week
  const lineup = await databases.listDocuments(
    DATABASE_ID,
    'lineups',
    [
      Query.equal('rosterId', [roster.$id]),
      Query.equal('week', [week])
    ]
  );
  
  if (lineup.documents.length === 0) {
    // No lineup set - use last week's or bench players
    return {
      rosterId: roster.$id,
      week,
      score: 0,
      playersScored: 0
    };
  }
  
  const weekLineup = lineup.documents[0];
  const playerIds = Object.values(weekLineup.starters || {});
  
  // Get player stats for the week
  const playerStats = await databases.listDocuments(
    DATABASE_ID,
    'player_stats',
    [
      Query.equal('playerId', playerIds),
      Query.equal('week', [week])
    ]
  );
  
  // Calculate fantasy points based on scoring rules
  let totalScore = 0;
  const scoringRules = league.scoringRules || getDefaultScoringRules();
  
  playerStats.documents.forEach(stat => {
    const points = calculateFantasyPoints(stat, scoringRules);
    totalScore += points;
  });
  
  return {
    rosterId: roster.$id,
    week,
    score: Math.round(totalScore * 100) / 100, // Round to 2 decimals
    playersScored: playerStats.documents.length,
    breakdown: playerStats.documents.map(stat => ({
      playerId: stat.playerId,
      points: calculateFantasyPoints(stat, scoringRules)
    }))
  };
}

function calculateFantasyPoints(stats, rules) {
  let points = 0;
  
  // Passing
  if (stats.passingYards) {
    points += stats.passingYards * (rules.passingYards || 0.04);
  }
  if (stats.passingTouchdowns) {
    points += stats.passingTouchdowns * (rules.passingTouchdowns || 4);
  }
  if (stats.passingInterceptions) {
    points += stats.passingInterceptions * (rules.passingInterceptions || -2);
  }
  
  // Rushing
  if (stats.rushingYards) {
    points += stats.rushingYards * (rules.rushingYards || 0.1);
  }
  if (stats.rushingTouchdowns) {
    points += stats.rushingTouchdowns * (rules.rushingTouchdowns || 6);
  }
  
  // Receiving
  if (stats.receivingYards) {
    points += stats.receivingYards * (rules.receivingYards || 0.1);
  }
  if (stats.receivingTouchdowns) {
    points += stats.receivingTouchdowns * (rules.receivingTouchdowns || 6);
  }
  if (stats.receptions) {
    points += stats.receptions * (rules.receptions || 1); // PPR
  }
  
  // Defense
  if (stats.sacks) {
    points += stats.sacks * (rules.sacks || 1);
  }
  if (stats.interceptions) {
    points += stats.interceptions * (rules.interceptions || 2);
  }
  
  return Math.round(points * 100) / 100;
}

async function updateMatchupScores(matchups, rosterScores, week) {
  const scoreMap = new Map(
    rosterScores.map(s => [s.rosterId, s.score])
  );
  
  const updates = await Promise.all(
    matchups.map(async matchup => {
      const homeScore = scoreMap.get(matchup.homeTeamId) || 0;
      const awayScore = scoreMap.get(matchup.awayTeamId) || 0;
      
      const winner = homeScore > awayScore ? matchup.homeTeamId 
                   : awayScore > homeScore ? matchup.awayTeamId 
                   : null; // Tie
      
      return databases.updateDocument(
        DATABASE_ID,
        'matchups',
        matchup.$id,
        {
          homeScore,
          awayScore,
          winner,
          completed: true,
          completedAt: new Date().toISOString()
        }
      );
    })
  );
  
  return updates;
}

async function updateRosterRecords(rosterScores, rosters) {
  // This would update W-L-T records based on matchup results
  // Implementation depends on your matchup structure
}

function getCurrentWeek() {
  // Calculate current week of season
  const seasonStart = new Date(new Date().getFullYear(), 8, 1); // Sept 1
  const now = new Date();
  const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));
  return Math.min(Math.max(1, weeksSinceStart), 15); // Cap at week 15
}

function getDefaultScoringRules() {
  return {
    passingYards: 0.04,
    passingTouchdowns: 4,
    passingInterceptions: -2,
    rushingYards: 0.1,
    rushingTouchdowns: 6,
    receivingYards: 0.1,
    receivingTouchdowns: 6,
    receptions: 1,
    sacks: 1,
    interceptions: 2
  };
}
