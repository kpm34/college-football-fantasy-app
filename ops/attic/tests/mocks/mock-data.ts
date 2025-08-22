/**
 * Mock Data Generators
 * 
 * Provides realistic mock data for testing.
 * Used by MSW to return consistent, predictable test data.
 */

import { faker } from '@faker-js/faker';
import type { Models } from 'appwrite';

// Types from our schema
type MockPlayer = Models.Document & {
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  team: string;
  conference: 'SEC' | 'ACC' | 'Big 12' | 'Big Ten';
  jerseyNumber?: number;
  height?: string;
  weight?: number;
  year?: 'FR' | 'SO' | 'JR' | 'SR';
  eligible: boolean;
  fantasy_points: number;
  season_fantasy_points: number;
  depth_chart_order?: number;
  external_id?: string;
};

type MockLeague = Models.Document & {
  name: string;
  commissioner: string;
  season: number;
  maxTeams: number;
  currentTeams: number;
  draftType: 'snake' | 'auction';
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten';
  status: 'open' | 'drafting' | 'active' | 'complete';
  isPublic: boolean;
  pickTimeSeconds: number;
};

type MockRoster = Models.Document & {
  leagueId: string;
  userId: string;
  teamName: string;
  abbreviation?: string;
  draftPosition?: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  players: string; // JSON string
};

type MockGame = Models.Document & {
  week: number;
  season: number;
  season_type: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  start_date: string;
  completed: boolean;
  eligible_game: boolean;
  external_id?: string;
};

// Sample data pools
const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const;
const CONFERENCES = ['SEC', 'ACC', 'Big 12', 'Big Ten'] as const;
const YEARS = ['FR', 'SO', 'JR', 'SR'] as const;

const SEC_TEAMS = ['UGA', 'ALA', 'LSU', 'FLA', 'TENN', 'AUB', 'ARK', 'MSU', 'USC', 'MISS', 'VAN', 'UK', 'MIZ', 'TAMU', 'TEX', 'OU'];
const ACC_TEAMS = ['CLEM', 'FSU', 'MIA', 'UNC', 'NCSU', 'DUKE', 'WF', 'VT', 'UVA', 'GT', 'LOU', 'SYR', 'BC', 'PITT', 'CAL', 'SMU', 'STAN'];
const BIG12_TEAMS = ['TCU', 'BAY', 'TTU', 'OSU', 'KU', 'KSU', 'ISU', 'WVU', 'CIN', 'UCF', 'HOU', 'ASU', 'AZ', 'COL', 'UTAH'];
const BIGTEN_TEAMS = ['OSU', 'MICH', 'PSU', 'MSU', 'IND', 'PUR', 'ILL', 'NW', 'WIS', 'MIN', 'IOW', 'NEB', 'RU', 'MD', 'ORE', 'WASH', 'UCLA', 'USC'];

const ALL_TEAMS = [...SEC_TEAMS, ...ACC_TEAMS, ...BIG12_TEAMS, ...BIGTEN_TEAMS];

const TEAM_TO_CONFERENCE: Record<string, typeof CONFERENCES[number]> = {
  ...Object.fromEntries(SEC_TEAMS.map(team => [team, 'SEC' as const])),
  ...Object.fromEntries(ACC_TEAMS.map(team => [team, 'ACC' as const])),
  ...Object.fromEntries(BIG12_TEAMS.map(team => [team, 'Big 12' as const])),
  ...Object.fromEntries(BIGTEN_TEAMS.map(team => [team, 'Big Ten' as const]))
};

/**
 * Generate mock college football player
 */
export function generateMockPlayer(overrides: Partial<MockPlayer> = {}): MockPlayer {
  const position = overrides.position || faker.helpers.arrayElement(POSITIONS);
  const team = overrides.team || faker.helpers.arrayElement(ALL_TEAMS);
  const conference = TEAM_TO_CONFERENCE[team];
  
  // Position-specific fantasy points ranges
  let baseFantasyPoints = 0;
  switch (position) {
    case 'QB': baseFantasyPoints = faker.number.int({ min: 200, max: 400 }); break;
    case 'RB': baseFantasyPoints = faker.number.int({ min: 150, max: 300 }); break;
    case 'WR': baseFantasyPoints = faker.number.int({ min: 120, max: 250 }); break;
    case 'TE': baseFantasyPoints = faker.number.int({ min: 80, max: 180 }); break;
    case 'K': baseFantasyPoints = faker.number.int({ min: 60, max: 120 }); break;
    case 'DEF': baseFantasyPoints = faker.number.int({ min: 40, max: 100 }); break;
  }
  
  return {
    $id: overrides.$id || faker.string.uuid(),
    $createdAt: overrides.$createdAt || faker.date.recent().toISOString(),
    $updatedAt: overrides.$updatedAt || faker.date.recent().toISOString(),
    $permissions: ['read("any")', 'write("role:admin")'],
    $databaseId: 'test-database',
    $collectionId: 'college_players',
    
    name: overrides.name || `${faker.person.firstName()} ${faker.person.lastName()}`,
    position,
    team,
    conference,
    jerseyNumber: overrides.jerseyNumber ?? faker.number.int({ min: 1, max: 99 }),
    height: overrides.height || `${faker.number.int({ min: 5, max: 6 })}-${faker.number.int({ min: 8, max: 11 })}`,
    weight: overrides.weight ?? faker.number.int({ min: 160, max: 320 }),
    year: overrides.year || faker.helpers.arrayElement(YEARS),
    eligible: overrides.eligible ?? faker.datatype.boolean(0.9), // 90% eligible
    fantasy_points: overrides.fantasy_points ?? baseFantasyPoints,
    season_fantasy_points: overrides.season_fantasy_points ?? baseFantasyPoints,
    depth_chart_order: overrides.depth_chart_order ?? faker.number.int({ min: 1, max: 5 }),
    external_id: overrides.external_id || faker.number.int({ min: 1000000, max: 9999999 }).toString(),
    
    ...overrides
  };
}

/**
 * Generate mock fantasy league
 */
export function generateMockLeague(overrides: Partial<MockLeague> = {}): MockLeague {
  const maxTeams = overrides.maxTeams || faker.helpers.arrayElement([8, 10, 12, 14, 16]);
  const currentTeams = overrides.currentTeams ?? faker.number.int({ min: 0, max: maxTeams });
  
  return {
    $id: overrides.$id || faker.string.uuid(),
    $createdAt: overrides.$createdAt || faker.date.recent().toISOString(),
    $updatedAt: overrides.$updatedAt || faker.date.recent().toISOString(),
    $permissions: ['read("any")', 'write("role:user")'],
    $databaseId: 'test-database',
    $collectionId: 'leagues',
    
    name: overrides.name || `${faker.word.adjective()} ${faker.word.noun()} League`,
    commissioner: overrides.commissioner || faker.string.uuid(),
    season: overrides.season || 2025,
    maxTeams,
    currentTeams,
    draftType: overrides.draftType || faker.helpers.arrayElement(['snake', 'auction']),
    gameMode: overrides.gameMode || faker.helpers.arrayElement(['power4', 'sec', 'acc', 'big12', 'bigten']),
    status: overrides.status || faker.helpers.arrayElement(['open', 'drafting', 'active', 'complete']),
    isPublic: overrides.isPublic ?? faker.datatype.boolean(0.7), // 70% public
    pickTimeSeconds: overrides.pickTimeSeconds || faker.helpers.arrayElement([60, 90, 120, 180]),
    
    ...overrides
  };
}

/**
 * Generate mock fantasy roster
 */
export function generateMockRoster(overrides: Partial<MockRoster> = {}): MockRoster {
  const wins = overrides.wins ?? faker.number.int({ min: 0, max: 12 });
  const losses = overrides.losses ?? faker.number.int({ min: 0, max: 12 - wins });
  const ties = overrides.ties ?? faker.number.int({ min: 0, max: 1 });
  
  // Generate mock player IDs for roster
  const playerIds = Array.from({ length: faker.number.int({ min: 15, max: 20 }) }, () => faker.string.uuid());
  
  return {
    $id: overrides.$id || faker.string.uuid(),
    $createdAt: overrides.$createdAt || faker.date.recent().toISOString(),
    $updatedAt: overrides.$updatedAt || faker.date.recent().toISOString(),
    $permissions: ['read("any")', 'write("role:user")'],
    $databaseId: 'test-database',
    $collectionId: 'user_teams',
    
    leagueId: overrides.leagueId || faker.string.uuid(),
    userId: overrides.userId || faker.string.uuid(),
    teamName: overrides.teamName || `${faker.word.adjective()} ${faker.animal.type()}s`,
    abbreviation: overrides.abbreviation || faker.string.alpha({ length: 3, casing: 'upper' }),
    draftPosition: overrides.draftPosition ?? faker.number.int({ min: 1, max: 12 }),
    wins,
    losses, 
    ties,
    pointsFor: overrides.pointsFor ?? faker.number.float({ min: 800, max: 1400, fractionDigits: 2 }),
    pointsAgainst: overrides.pointsAgainst ?? faker.number.float({ min: 800, max: 1400, fractionDigits: 2 }),
    players: overrides.players || JSON.stringify(playerIds),
    
    ...overrides
  };
}

/**
 * Generate mock college football game
 */
export function generateMockGame(overrides: Partial<MockGame> = {}): MockGame {
  const homeTeam = overrides.home_team || faker.helpers.arrayElement(ALL_TEAMS);
  const awayTeam = overrides.away_team || faker.helpers.arrayElement(ALL_TEAMS.filter(t => t !== homeTeam));
  const completed = overrides.completed ?? faker.datatype.boolean(0.3); // 30% completed
  
  return {
    $id: overrides.$id || faker.string.uuid(),
    $createdAt: overrides.$createdAt || faker.date.recent().toISOString(),
    $updatedAt: overrides.$updatedAt || faker.date.recent().toISOString(),
    $permissions: ['read("any")', 'write("role:admin")'],
    $databaseId: 'test-database',
    $collectionId: 'games',
    
    week: overrides.week ?? faker.number.int({ min: 1, max: 15 }),
    season: overrides.season || 2025,
    season_type: overrides.season_type || 'regular',
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: completed ? (overrides.home_score ?? faker.number.int({ min: 0, max: 56 })) : undefined,
    away_score: completed ? (overrides.away_score ?? faker.number.int({ min: 0, max: 56 })) : undefined,
    start_date: overrides.start_date || faker.date.future().toISOString(),
    completed,
    eligible_game: overrides.eligible_game ?? faker.datatype.boolean(0.8), // 80% eligible
    external_id: overrides.external_id || faker.number.int({ min: 400000000, max: 499999999 }).toString(),
    
    ...overrides
  };
}

/**
 * Generate complete mock dataset for testing
 */
export function generateMockDataset() {
  const leagues = Array.from({ length: 5 }, () => generateMockLeague());
  const players = Array.from({ length: 100 }, () => generateMockPlayer());
  const games = Array.from({ length: 50 }, () => generateMockGame());
  
  // Generate user teams for leagues
  const userTeams = leagues.flatMap(league => 
    Array.from({ length: league.currentTeams }, (_, index) => 
      generateMockRoster({
        leagueId: league.$id,
        draftPosition: index + 1
      })
    )
  );
  
  return {
    leagues,
    players,
    games,
    userTeams,
    total: leagues.length + players.length + games.length + userTeams.length
  };
}

/**
 * Common test scenarios
 */
export const testScenarios = {
  // High-scoring QB for testing
  eliteQB: (): MockPlayer => generateMockPlayer({
    name: 'Elite Quarterback',
    position: 'QB',
    team: 'UGA',
    conference: 'SEC',
    fantasy_points: 350,
    season_fantasy_points: 350,
    depth_chart_order: 1,
    eligible: true
  }),
  
  // Backup player with low score
  benchPlayer: (): MockPlayer => generateMockPlayer({
    name: 'Bench Warmer',
    position: 'RB',
    fantasy_points: 15,
    season_fantasy_points: 45,
    depth_chart_order: 3,
    eligible: true
  }),
  
  // Ineligible player
  ineligiblePlayer: (): MockPlayer => generateMockPlayer({
    name: 'Ineligible Player', 
    eligible: false,
    fantasy_points: 0
  }),
  
  // Open league ready for joining
  openLeague: (): MockLeague => generateMockLeague({
    name: 'Test Open League',
    status: 'open',
    currentTeams: 8,
    maxTeams: 12,
    isPublic: true
  }),
  
  // Full league
  fullLeague: (): MockLeague => generateMockLeague({
    name: 'Full League',
    status: 'active',
    currentTeams: 12,
    maxTeams: 12,
    isPublic: false
  }),
  
  // Active game in progress
  activeGame: (): MockGame => generateMockGame({
    week: 1,
    season: 2025,
    home_team: 'UGA',
    away_team: 'ALA',
    start_date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    completed: false,
    eligible_game: true
  }),
  
  // Completed game with scores
  completedGame: (): MockGame => generateMockGame({
    week: 1,
    season: 2025,
    home_team: 'TEX',
    away_team: 'OU',
    home_score: 35,
    away_score: 21,
    start_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    completed: true,
    eligible_game: true
  })
};

export default {
  generateMockPlayer,
  generateMockLeague,
  generateMockRoster,
  generateMockGame,
  generateMockDataset,
  testScenarios
};