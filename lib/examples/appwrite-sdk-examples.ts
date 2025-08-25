/**
 * Appwrite SDK Usage Examples
 * Demonstrates how to use the configured Appwrite SDK
 */

import { 
  AppwriteID, 
  AppwriteQuery, 
  AppwritePermissions,
  AppwriteOperations,
  LeaguesCollection,
  PlayersCollection,
  ServerLeaguesCollection,
  type LeagueDocument,
  type PlayerDocument 
} from '../appwrite-sdk';

/**
 * ID Generation Examples
 */
export function idExamples() {
  // Generate a unique ID
  const uniqueId = AppwriteID.unique();
  console.log('Unique ID:', uniqueId);
  
  // Generate a custom ID
  const customId = AppwriteID.custom('my-custom-league-id');
  console.log('Custom ID:', customId);
  
  // Generate a prefixed ID
  const prefixedId = AppwriteID.prefixed('league');
  console.log('Prefixed ID:', prefixedId);
  
  // Generate a league-specific ID
  const leagueSpecificId = AppwriteID.forLeague('league_123', 'draft');
  console.log('League-specific ID:', leagueSpecificId);
  
  return { uniqueId, customId, prefixedId, leagueSpecificId };
}

/**
 * Query Building Examples
 */
export function queryExamples() {
  // Basic queries
  const byLeagueQuery = AppwriteQuery.byLeague('league_123');
  const byUserQuery = AppwriteQuery.byUser('user_456');
  const activeStatusQuery = AppwriteQuery.isActive();
  
  // Sorting queries
  const sortByPointsDesc = AppwriteQuery.sortBy('fantasy_points', 'desc');
  const sortByCreatedDesc = AppwriteQuery.sortByCreated('desc');
  
  // Pagination queries
  const limitQuery = AppwriteQuery.limit(25);
  const offsetQuery = AppwriteQuery.offset(50);
  
  // Search queries
  const searchByName = AppwriteQuery.search('name', 'John');
  const containsTeam = AppwriteQuery.contains('team', 'Alabama');
  
  // Date range queries
  const createdAfter = AppwriteQuery.createdAfter(new Date('2024-01-01'));
  
  return {
    byLeagueQuery,
    byUserQuery,
    activeStatusQuery,
    sortByPointsDesc,
    sortByCreatedDesc,
    limitQuery,
    offsetQuery,
    searchByName,
    containsTeam,
    createdAfter
  };
}

/**
 * Permission Examples
 */
export function permissionExamples() {
  const userId = 'user_123';
  const commissionerId = 'commissioner_456';
  const teamId = 'team_789';
  
  // User permissions
  const userRead = AppwritePermissions.userRead(userId);
  const userWrite = AppwritePermissions.userWrite(userId);
  
  // Team permissions
  const teamRead = AppwritePermissions.teamRead(teamId);
  
  // Public permissions
  const publicRead = AppwritePermissions.publicRead();
  
  // Commissioner permissions (full access)
  const commissionerPerms = AppwritePermissions.leagueCommissioner(commissionerId);
  
  // Combined permissions (user + public read)
  const userAndPublic = AppwritePermissions.userAndPublicRead(userId);
  
  return {
    userRead,
    userWrite,
    teamRead,
    publicRead,
    commissionerPerms,
    userAndPublic
  };
}

/**
 * CRUD Operations Examples
 */
export async function crudExamples() {
  try {
    // Create a new league
    const newLeague: Omit<LeagueDocument, keyof import('appwrite').Models.Document> = {
      name: 'My Fantasy League',
      commissioner: 'user_123',
      season: 2025,
      maxTeams: 12,
      currentTeams: 1,
      draftType: 'snake',
      gameMode: 'power4',
      status: 'open',
      isPublic: true,
      pickTimeSeconds: 90
    };
    
    const createdLeague = await LeaguesCollection.create(
      newLeague,
      AppwriteID.prefixed('league'),
      AppwritePermissions.leagueCommissioner('user_123')
    );
    console.log('Created league:', createdLeague);
    
    // Get the created league
    const fetchedLeague = await LeaguesCollection.get(createdLeague.$id);
    console.log('Fetched league:', fetchedLeague);
    
    // List leagues with queries
    const openLeagues = await LeaguesCollection.list([
      AppwriteQuery.byStatus('open'),
      AppwriteQuery.sortByCreated('desc'),
      AppwriteQuery.limit(10)
    ]);
    console.log('Open leagues:', openLeagues);
    
    // Update the league
    const updatedLeague = await LeaguesCollection.update(createdLeague.$id, {
      currentTeams: 2,
      name: 'Updated Fantasy League'
    });
    console.log('Updated league:', updatedLeague);
    
    // Count leagues
    const leagueCount = await LeaguesCollection.count([
      AppwriteQuery.byStatus('open')
    ]);
    console.log('Open league count:', leagueCount);
    
    // Delete the league (cleanup)
    // await LeaguesCollection.delete(createdLeague.$id);
    
    return { createdLeague, fetchedLeague, openLeagues, updatedLeague, leagueCount };
    
  } catch (error) {
    console.error('CRUD operation failed:', error);
    throw error;
  }
}

/**
 * Server-side Operations Examples (requires API key)
 */
export async function serverSideExamples() {
  try {
    // Server-side operations with full admin access
    const allLeagues = await ServerLeaguesCollection.list([
      AppwriteQuery.limit(100),
      AppwriteQuery.sortByCreated('desc')
    ]);
    console.log('All leagues (server):', allLeagues);
    
    // Create league with admin permissions
    const adminLeague: Omit<LeagueDocument, keyof import('appwrite').Models.Document> = {
      name: 'Admin Created League',
      commissioner: 'admin_user',
      season: 2025,
      maxTeams: 16,
      currentTeams: 0,
      draftType: 'auction',
      gameMode: 'sec',
      status: 'open',
      isPublic: true,
      pickTimeSeconds: 120
    };
    
    const adminCreatedLeague = await ServerLeaguesCollection.create(
      adminLeague,
      AppwriteID.custom('admin_league_2025')
    );
    console.log('Admin created league:', adminCreatedLeague);
    
    return { allLeagues, adminCreatedLeague };
    
  } catch (error) {
    console.error('Server-side operation failed:', error);
    throw error;
  }
}

/**
 * Common Operations Examples
 */
export async function commonOperationsExamples() {
  try {
    const userId = 'user_123';
    const leagueId = 'league_456';
    const season = 2025;
    const week = 1;
    
    // Get user's leagues
    const userLeagues = await AppwriteOperations.getUserLeagues(userId);
    console.log('User leagues:', userLeagues);
    
    // Get league members
    const leagueMembers = await AppwriteOperations.getLeagueMembers(leagueId);
    console.log('League members:', leagueMembers);
    
    // Get available players for draft
    const availablePlayers = await AppwriteOperations.getAvailablePlayers('QB', 20);
    console.log('Available QBs:', availablePlayers);
    
    // Get current week games
    const currentWeekGames = await AppwriteOperations.getCurrentWeekGames(season, week);
    console.log('Current week games:', currentWeekGames);
    
    return { userLeagues, leagueMembers, availablePlayers, currentWeekGames };
    
  } catch (error) {
    console.error('Common operations failed:', error);
    throw error;
  }
}

/**
 * Advanced Query Examples
 */
export async function advancedQueryExamples() {
  try {
    // Complex player query: Top 50 eligible QBs from SEC, sorted by fantasy points
    const topSecQBs = await PlayersCollection.list([
      AppwriteQuery.isEligible(),
      AppwriteQuery.byPosition('QB'),
      AppwriteQuery.byConference('SEC'),
      AppwriteQuery.sortBy('fantasy_points', 'desc'),
      AppwriteQuery.limit(50)
    ]);
    console.log('Top SEC QBs:', topSecQBs);
    
    // Complex league query: Open public leagues from this season, sorted by creation date
    const recentOpenLeagues = await LeaguesCollection.list([
      AppwriteQuery.byStatus('open'),
      AppwriteQuery.equal('isPublic', true),
      AppwriteQuery.bySeason(2025),
      AppwriteQuery.createdAfter('2024-01-01'),
      AppwriteQuery.sortByCreated('desc'),
      AppwriteQuery.limit(25)
    ]);
    console.log('Recent open leagues:', recentOpenLeagues);
    
    // Search players by name containing specific text
    const searchResults = await PlayersCollection.list([
      AppwriteQuery.search('name', 'Smith'),
      AppwriteQuery.isEligible(),
      AppwriteQuery.sortBy('fantasy_points', 'desc'),
      AppwriteQuery.limit(20)
    ]);
    console.log('Players named Smith:', searchResults);
    
    return { topSecQBs, recentOpenLeagues, searchResults };
    
  } catch (error) {
    console.error('Advanced queries failed:', error);
    throw error;
  }
}

/**
 * Real-world Usage Example: Creating a complete league setup
 */
export async function createCompleteLeague(commissionerId: string, leagueName: string) {
  try {
    // Step 1: Create the league
    const league = await LeaguesCollection.create({
      name: leagueName,
      commissioner: commissionerId,
      season: 2025,
      maxTeams: 12,
      currentTeams: 1,
      draftType: 'snake',
      gameMode: 'power4',
      status: 'open',
      isPublic: true,
      pickTimeSeconds: 90,
      draftDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
    }, AppwriteID.prefixed('league'), [
      AppwritePermissions.userRead(commissionerId),
      AppwritePermissions.userWrite(commissionerId),
      AppwritePermissions.publicRead()
    ]);
    
    console.log('✅ League created:', league.name, league.$id);
    
    // Step 2: Create commissioner's fantasy team
    const commissionerTeam = await import('../appwrite-sdk').then(sdk => 
      sdk.FantasyTeamsCollection.create({
        leagueId: league.$id,
        userId: commissionerId,
        teamName: `${leagueName} Commissioner`,
        draftPosition: 1,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        players: '[]' // Empty roster to start
      }, AppwriteID.forLeague(league.$id, 'team', 'commissioner'), [
        AppwritePermissions.userRead(commissionerId),
        AppwritePermissions.userWrite(commissionerId)
      ])
    );
    
    console.log('✅ Commissioner team created:', commissionerTeam.teamName);
    
    return { league, commissionerTeam };
    
  } catch (error) {
    console.error('❌ Failed to create complete league:', error);
    throw error;
  }
}

// Export all examples for easy testing
export default {
  idExamples,
  queryExamples,
  permissionExamples,
  crudExamples,
  serverSideExamples,
  commonOperationsExamples,
  advancedQueryExamples,
  createCompleteLeague
};