#!/usr/bin/env node

const { Client, Databases, Query, ID } = require('node-appwrite');
const fetch = require('node-fetch');

// Configuration
const CFBD_API_KEY = process.env.CFBD_API_KEY;
const CFBD_BASE_URL = 'https://api.collegefootballdata.com';
const POWER_4_CONFERENCES = ['SEC', 'ACC', 'Big 12', 'Big Ten'];

// Appwrite configuration
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

const COLLECTIONS = {
  PLAYERS: 'college_players',
  TEAMS: 'teams',
  GAMES: 'games',
  RANKINGS: 'rankings'
};

// Fetch from CFBD API
async function fetchFromCFBD(endpoint, params = {}) {
  const url = new URL(`${CFBD_BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${CFBD_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Sync teams
async function syncTeams(season = 2025) {
  console.log('🏈 Syncing teams from CFBD...');
  
  const teams = await fetchFromCFBD('/teams', { year: season });
  const power4Teams = teams.filter(team => POWER_4_CONFERENCES.includes(team.conference));
  
  console.log(`Found ${power4Teams.length} Power 4 teams`);
  
  for (const team of power4Teams) {
    try {
      // Check if team exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.equal('school', team.school)]
      );
      
      const teamData = {
        school: team.school,
        mascot: team.mascot,
        abbreviation: team.abbreviation,
        conference: team.conference,
        division: team.division,
        color: team.color,
        alt_color: team.alt_color,
        logos: team.logos || [],
        venue_id: team.venue_id?.toString() || '',
        venue_name: team.venue?.name || '',
        venue_capacity: team.venue?.capacity || 0,
        venue_grass: team.venue?.grass || false,
        location_city: team.location?.city || '',
        location_state: team.location?.state || '',
        power_4: true,
        season: season
      };
      
      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TEAMS,
          existing.documents[0].$id,
          teamData
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TEAMS,
          ID.unique(),
          teamData
        );
      }
    } catch (error) {
      console.error(`Error syncing team ${team.school}:`, error);
    }
  }
  
  console.log('✅ Teams synced successfully');
}

// Sync players
async function syncPlayers(season = 2025) {
  console.log('🏈 Syncing players from CFBD...');
  
  const fantasyPositions = ['QB', 'RB', 'WR', 'TE', 'K'];
  let totalCreated = 0;
  let totalUpdated = 0;
  
  // Sync players for each Power 4 conference
  for (const conference of POWER_4_CONFERENCES) {
    console.log(`\nSyncing ${conference} players...`);
    
    const roster = await fetchFromCFBD('/roster', { 
      year: season, 
      conference: conference 
    });
    
    const fantasyPlayers = roster.filter(player => 
      fantasyPositions.includes(player.position)
    );
    
    console.log(`Found ${fantasyPlayers.length} fantasy-relevant players in ${conference}`);
    
    for (const player of fantasyPlayers) {
      try {
        // Check if player exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PLAYERS,
          [Query.equal('cfbd_id', player.id.toString())]
        );
        
        const playerData = {
          cfbd_id: player.id.toString(),
          first_name: player.first_name || '',
          last_name: player.last_name || '',
          name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          position: player.position,
          team: player.team,
          conference: conference,
          jersey: player.jersey?.toString() || '',
          height: player.height ? `${Math.floor(player.height / 12)}-${player.height % 12}` : '',
          weight: player.weight?.toString() || '',
          year: player.year ? getYearString(player.year) : 'FR',
          season: season,
          draftable: true,
          power_4: true
        };
        
        if (existing.documents.length > 0) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            existing.documents[0].$id,
            playerData
          );
          totalUpdated++;
        } else {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PLAYERS,
            ID.unique(),
            playerData
          );
          totalCreated++;
        }
      } catch (error) {
        console.error(`Error syncing player ${player.first_name} ${player.last_name}:`, error);
      }
    }
  }
  
  console.log(`\n✅ Players synced: ${totalCreated} created, ${totalUpdated} updated`);
}

// Sync games
async function syncGames(season = 2025, week = null) {
  console.log('🏈 Syncing games from CFBD...');
  
  const params = { year: season, seasonType: 'regular' };
  if (week) params.week = week;
  
  const games = await fetchFromCFBD('/games', params);
  
  // Filter for Power 4 games
  const power4Games = games.filter(game => 
    POWER_4_CONFERENCES.includes(game.home_conference) || 
    POWER_4_CONFERENCES.includes(game.away_conference)
  );
  
  console.log(`Found ${power4Games.length} Power 4 games`);
  
  for (const game of power4Games) {
    try {
      // Check if game exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GAMES,
        [Query.equal('cfbd_id', game.id.toString())]
      );
      
      const gameData = {
        cfbd_id: game.id.toString(),
        season: game.season,
        week: game.week,
        season_type: game.season_type,
        start_date: game.start_date,
        home_team: game.home_team,
        home_conference: game.home_conference,
        home_points: game.home_points,
        away_team: game.away_team,
        away_conference: game.away_conference,
        away_points: game.away_points,
        venue: game.venue,
        completed: game.completed || false,
        neutral_site: game.neutral_site || false
      };
      
      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.GAMES,
          existing.documents[0].$id,
          gameData
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.GAMES,
          ID.unique(),
          gameData
        );
      }
    } catch (error) {
      console.error(`Error syncing game ${game.home_team} vs ${game.away_team}:`, error);
    }
  }
  
  console.log('✅ Games synced successfully');
}

// Sync AP rankings
async function syncRankings(season = 2025, week = null) {
  console.log('🏈 Syncing AP rankings from CFBD...');
  
  const params = { year: season, seasonType: 'regular' };
  if (week) params.week = week;
  
  const rankings = await fetchFromCFBD('/rankings', params);
  
  // Find AP poll
  const apPoll = rankings.find(poll => 
    poll.polls?.find(p => p.poll === 'AP Top 25')
  );
  
  if (!apPoll) {
    console.log('No AP rankings found for specified parameters');
    return;
  }
  
  const apRankings = apPoll.polls.find(p => p.poll === 'AP Top 25').ranks;
  
  console.log(`Found ${apRankings.length} ranked teams`);
  
  for (const ranking of apRankings) {
    try {
      // Check if ranking exists for this week
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RANKINGS,
        [
          Query.equal('school', ranking.school),
          Query.equal('week', apPoll.week),
          Query.equal('season', apPoll.season)
        ]
      );
      
      const rankingData = {
        school: ranking.school,
        conference: ranking.conference,
        rank: ranking.rank,
        points: ranking.points || 0,
        first_place_votes: ranking.firstPlaceVotes || 0,
        season: apPoll.season,
        week: apPoll.week,
        poll: 'AP Top 25'
      };
      
      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.RANKINGS,
          existing.documents[0].$id,
          rankingData
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.RANKINGS,
          ID.unique(),
          rankingData
        );
      }
    } catch (error) {
      console.error(`Error syncing ranking for ${ranking.school}:`, error);
    }
  }
  
  console.log('✅ Rankings synced successfully');
}

// Helper functions
function getYearString(year) {
  switch(year) {
    case 1: return 'FR';
    case 2: return 'SO';
    case 3: return 'JR';
    case 4: return 'SR';
    default: return 'FR';
  }
}

// Main sync function
async function syncAll() {
  if (!CFBD_API_KEY) {
    console.error('❌ CFBD_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  const season = process.argv[2] || 2025;
  const week = process.argv[3] || null;
  
  console.log(`🏈 Starting CFBD data sync for season ${season}${week ? ` week ${week}` : ''}...\n`);
  
  try {
    await syncTeams(season);
    await syncPlayers(season);
    await syncGames(season, week);
    await syncRankings(season, week);
    
    console.log('\n✅ All data synced successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncAll();
