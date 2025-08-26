#!/usr/bin/env tsx
/**
 * Script to update all index references from snake_case to camelCase
 * This updates Query.equal(), Query.orderAsc(), etc. throughout the codebase
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Comprehensive mapping of all snake_case to camelCase fields
const fieldMappings: Record<string, string> = {
  // Common fields across collections
  'authUserId': 'authUserId',
  'displayName': 'displayName',
  'leagueId': 'leagueId',
  'clientId': 'clientId',
  'ownerAuthUserId': 'ownerAuthUserId',
  'ownerClientId': 'ownerClientId',
  'fantasyTeamId': 'fantasyTeamId',
  'playerId': 'playerId',
  'teamId': 'teamId',
  'rosterId': 'rosterId',
  
  // league_memberships
  'joinedAt': 'joinedAt',
  
  // fantasy_teams (formerly rosters/user_teams)
  'teamName': 'teamName',
  'logoUrl': 'logoUrl',
  'pointsFor': 'pointsFor',
  'pointsAgainst': 'pointsAgainst',
  'draftPosition': 'draftPosition',
  'auctionBudgetTotal': 'auctionBudgetTotal',
  'auctionBudgetRemaining': 'auctionBudgetRemaining',
  
  // leagues
  'commissionerAuthUserId': 'commissionerAuthUserId',
  'draftDate': 'draftDate',
  'maxTeams': 'maxTeams',
  'currentTeams': 'currentTeams',
  'pickTimeSeconds': 'pickTimeSeconds',
  'isPublic': 'isPublic',
  'gameMode': 'gameMode',
  'selectedConference': 'selectedConference',
  'seasonStartWeek': 'seasonStartWeek',
  'playoffTeams': 'playoffTeams',
  'playoffStartWeek': 'playoffStartWeek',
  'scoringRules': 'scoringRules',
  'waiverType': 'waiverType',
  'waiverBudget': 'waiverBudget',
  'draftType': 'draftType',
  
  // clients
  'avatarUrl': 'avatarUrl',
  'createdAt': 'createdAt',
  'lastLogin': 'lastLogin',
  
  // invites
  'invitedByAuthUserId': 'invitedByAuthUserId',
  'acceptedAt': 'acceptedAt',
  'expiresAt': 'expiresAt',
  'inviteCode': 'inviteCode',
  
  // games
  'seasonType': 'seasonType',
  'homeTeam': 'homeTeam',
  'awayTeam': 'awayTeam',
  'homeSchoolId': 'homeSchoolId',
  'awaySchoolId': 'awaySchoolId',
  'homeScore': 'homeScore',
  'awayScore': 'awayScore',
  'kickoffAt': 'kickoffAt',
  'eligibleGame': 'eligibleGame',
  'startDate': 'startDate',
  
  // rankings
  'pollType': 'pollType',
  'firstPlaceVotes': 'firstPlaceVotes',
  'schoolId': 'schoolId',
  
  // college_players
  'fantasyPoints': 'fantasyPoints',
  'seasonFantasyPoints': 'seasonFantasyPoints',
  'depthChartOrder': 'depthChartOrder',
  'lastProjectionUpdate': 'lastProjectionUpdate',
  'externalId': 'externalId',
  'imageUrl': 'imageUrl',
  'cfbdId': 'cfbdId',
  'espnId': 'espnId',
  'classYear': 'classYear',
  'jerseyNumber': 'jerseyNumber',
  
  // player_stats
  'statlineJson': 'statlineJson',
  'gameId': 'gameId',
  
  // activity_log
  'ipAddress': 'ipAddress',
  'userAgent': 'userAgent',
  'actorClientId': 'actorClientId',
  'objectId': 'objectId',
  'objectType': 'objectType',
  'payloadJson': 'payloadJson',
  
  // drafts
  'clockSeconds': 'clockSeconds',
  'isMock': 'isMock',
  'orderJson': 'orderJson',
  'draftOrder': 'draftOrder',
  'currentPick': 'currentPick',
  'currentRound': 'currentRound',
  'startTime': 'startTime',
  'endTime': 'endTime',
  'maxRounds': 'maxRounds',
  'leagueName': 'leagueName',
  
  // draft_events & draft_states
  'draftId': 'draftId',
  'onClockTeamId': 'onClockTeamId',
  'deadlineAt': 'deadlineAt',
  'pickIndex': 'pickIndex',
  
  // auctions & bids
  'auctionId': 'auctionId',
  'winnerTeamId': 'winnerTeamId',
  'winningBid': 'winningBid',
  'isWinning': 'isWinning',
  
  // projections
  'boomProb': 'boomProb',
  'bustProb': 'bustProb',
  'componentsJson': 'componentsJson',
  'defenseVsPosGrade': 'defenseVsPosGrade',
  'homeAway': 'homeAway',
  'injuryStatus': 'injuryStatus',
  'opponentSchoolId': 'opponentSchoolId',
  'rankPro': 'rankPro',
  'startSitColor': 'startSitColor',
  'teamTotalEst': 'teamTotalEst',
  'utilizationTrend': 'utilizationTrend',
  
  // model_runs
  'finishedAt': 'finishedAt',
  'startedAt': 'startedAt',
  'inputsJson': 'inputsJson',
  'metricsJson': 'metricsJson',
  'modelVersionId': 'modelVersionId',
  'runId': 'runId',
  'weightsJson': 'weightsJson',
  
  // model_versions
  'artifactUri': 'artifactUri',
  'bucketFileId': 'bucketFileId',
  'createdBy': 'createdBy',
  'versionId': 'versionId',
  'modelPath': 'modelPath',
  'thumbnailUrl': 'thumbnailUrl',
  'glbUrl': 'glbUrl',
  
  // meshy_jobs
  'userId': 'userId',
  'resultUrl': 'resultUrl',
  'updatedAt': 'updatedAt',
  'webhookSecret': 'webhookSecret',
  'baseModelUrl': 'baseModelUrl',
  
  // matchups
  'awayPoints': 'awayPoints',
  'awayTeamId': 'awayTeamId',
  'homePoints': 'homePoints',
  'homeTeamId': 'homeTeamId',
  
  // roster_slots
  'acquiredAt': 'acquiredAt',
  'acquiredVia': 'acquiredVia',
  
  // schools
  'primaryColor': 'primaryColor',
  'secondaryColor': 'secondaryColor',
  
  // transactions
  'payloadJson': 'payloadJson',
};

async function updateFile(filePath: string): Promise<number> {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changeCount = 0;
  
  // Update Query methods with field names
  for (const [oldField, newField] of Object.entries(fieldMappings)) {
    // Query methods with quotes - match various Query method patterns
    const queryPatterns = [
      // Query.method('field_name', ...)
      new RegExp(`Query\\.(equal|notEqual|lessThan|lessThanEqual|greaterThan|greaterThanEqual|contains|search|orderAsc|orderDesc|isNull|isNotNull|startsWith|endsWith|between)\\(\\s*['"\`]${oldField}['"\`]`, 'g'),
      // Query.method("field_name", ...)
      new RegExp(`Query\\.(equal|notEqual|lessThan|lessThanEqual|greaterThan|greaterThanEqual|contains|search|orderAsc|orderDesc|isNull|isNotNull|startsWith|endsWith|between)\\(\\s*"${oldField}"`, 'g'),
      // Query.method(`field_name`, ...)
      new RegExp(`Query\\.(equal|notEqual|lessThan|lessThanEqual|greaterThan|greaterThanEqual|contains|search|orderAsc|orderDesc|isNull|isNotNull|startsWith|endsWith|between)\\(\\s*\`${oldField}\``, 'g'),
    ];
    
    for (const pattern of queryPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        changeCount += matches.length;
        content = content.replace(pattern, (match, method) => {
          // Preserve the quote style
          const quoteMatch = match.match(/(['"\`])/);
          const quote = quoteMatch ? quoteMatch[1] : "'";
          return `Query.${method}(${quote}${newField}${quote}`;
        });
      }
    }
    
    // Also update object property access patterns like doc.field_name
    const accessPattern = new RegExp(`\\.${oldField}(?![a-zA-Z0-9_])`, 'g');
    const accessMatches = content.match(accessPattern);
    if (accessMatches) {
      changeCount += accessMatches.length;
      content = content.replace(accessPattern, `.${newField}`);
    }
    
    // Update destructuring patterns like { field_name }
    const destructurePattern = new RegExp(`{([^}]*?)\\b${oldField}\\b`, 'g');
    const destructureMatches = content.match(destructurePattern);
    if (destructureMatches) {
      changeCount += destructureMatches.length;
      content = content.replace(destructurePattern, (match, prefix) => {
        return `{${prefix}${newField}`;
      });
    }
    
    // Update object keys like field_name: value
    const keyPattern = new RegExp(`^(\\s*)${oldField}:`, 'gm');
    const keyMatches = content.match(keyPattern);
    if (keyMatches) {
      changeCount += keyMatches.length;
      content = content.replace(keyPattern, `$1${newField}:`);
    }
  }
  
  // Save if changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} (${changeCount} changes)`);
    return changeCount;
  }
  
  return 0;
}

async function main() {
  console.log('🔄 Updating all index references from snake_case to camelCase...\n');
  
  // Find all TypeScript/JavaScript files
  const files = await glob('app/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
  });
  
  // Also update lib and scripts directories
  const libFiles = await glob('lib/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });
  
  const scriptFiles = await glob('scripts/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**']
  });
  
  const allFiles = [...files, ...libFiles, ...scriptFiles];
  
  let totalFiles = 0;
  let totalChanges = 0;
  
  for (const file of allFiles) {
    const changes = await updateFile(file);
    if (changes > 0) {
      totalFiles++;
      totalChanges += changes;
    }
  }
  
  console.log(`\n✨ Complete! Updated ${totalFiles} files with ${totalChanges} total changes.`);
  console.log('\n⚠️  Important reminders:');
  console.log('1. Review the changes carefully');
  console.log('2. Run npm run build to check for any TypeScript errors');
  console.log('3. Run tests to ensure everything works');
  console.log('4. Update any Appwrite indexes that reference snake_case fields');
  console.log('5. Deploy the changes');
}

main().catch(console.error);
