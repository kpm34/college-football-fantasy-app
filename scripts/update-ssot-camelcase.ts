#!/usr/bin/env tsx

import * as fs from 'fs';

const filePath = 'schema/zod-schema.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
  ['games_played_est', 'gamesPlayedEst'],
  ['usage_rate', 'usageRate'],
  ['pace_adj', 'paceAdj'],
  ['fantasy_points_simple', 'fantasyPointsSimple'],
  ['range_floor', 'rangeFloor'],
  ['range_median', 'rangeMedian'],
  ['range_ceiling', 'rangeCeiling'],
  ['injury_risk', 'injuryRisk'],
  ['volatility_score', 'volatilityScore'],
  ['replacement_value', 'replacementValue'],
  ['adp_est', 'adpEst'],
  ['ecr_rank', 'ecrRank'],
  ['statline_simple_json', 'statlineSimpleJson'],
  ['opponent_team_id', 'opponentTeamId'],
  ['home_away', 'homeAway'],
  ['team_total_est', 'teamTotalEst'],
  ['pace_matchup_adj', 'paceMatchupAdj'],
  ['boom_prob', 'boomProb'],
  ['bust_prob', 'bustProb'],
  ['defense_vs_pos_grade', 'defenseVsPosGrade'],
  ['injury_status', 'injuryStatus'],
  ['utilization_trend', 'utilizationTrend'],
  ['rank_pro', 'rankPro'],
  ['start_sit_color', 'startSitColor'],
  ['depth_chart', 'depthChart'],
  ['team_pace', 'teamPace'],
  ['pass_rate', 'passRate'],
  ['rush_rate', 'rushRate'],
  ['depth_chart_json', 'depthChartJson'],
  ['usage_priors_json', 'usagePriorsJson'],
  ['team_efficiency_json', 'teamEfficiencyJson'],
  ['pace_estimates_json', 'paceEstimatesJson'],
  ['opponent_grades_by_pos_json', 'opponentGradesByPosJson'],
  ['manual_overrides_json', 'manualOverridesJson'],
  ['ea_ratings_json', 'eaRatingsJson'],
  ['nfl_draft_capital_json', 'nflDraftCapitalJson'],
  ['league_id', 'leagueId'],
  ['auth_user_id', 'authUserId'],
  ['joined_at', 'joinedAt'],
  ['display_name', 'displayName'],
  ['invited_by_auth_user_id', 'invitedByAuthUserId'],
  // Collection names (keep as snake_case in the COLLECTIONS object)
  // These are the actual table names in the database
];

for (const [oldStr, newStr] of replacements) {
  // Replace in property definitions (with colon)
  const regex1 = new RegExp(`  ${oldStr}:`, 'g');
  content = content.replace(regex1, `  ${newStr}:`);
  
  // Replace in standalone references
  const regex2 = new RegExp(`\\b${oldStr}\\b`, 'g');
  // Skip if it's in a collection name context
  if (!oldStr.includes('_')) continue;
  if (!content.includes(`'${oldStr}'`) && !content.includes(`"${oldStr}"`)) {
    content = content.replace(regex2, newStr);
  }
}

fs.writeFileSync(filePath, content);
console.log('✅ Updated schema/zod-schema.ts to use camelCase');
