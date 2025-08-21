import { serverDatabases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';

// Week 4 schedule data
const week4Games = [
  // Friday Sep 19
  { week: 4, date: '2025-09-19', time: '20:00', homeTeam: 'Rutgers', awayTeam: 'Iowa', network: 'FOX', site: 'Home' },
  { week: 4, date: '2025-09-19', time: '19:00', homeTeam: 'Oklahoma State', awayTeam: 'Tulsa', network: 'ESPN', site: 'Home' },

  // Saturday Sep 20
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Baylor', awayTeam: 'Arizona State', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Memphis', awayTeam: 'Arkansas', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:30', homeTeam: 'Oklahoma', awayTeam: 'Auburn', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'East Carolina', awayTeam: 'BYU', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '22:30', homeTeam: 'San Diego State', awayTeam: 'California', network: 'CBSSN', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Clemson', awayTeam: 'Syracuse', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Colorado', awayTeam: 'Wyoming', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Duke', awayTeam: 'NC State', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Miami (FL)', awayTeam: 'Florida', network: '', site: 'Home', spread: '-3', overUnder: '55.5' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Florida State', awayTeam: 'Kent State', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Georgia Tech', awayTeam: 'Temple', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Indiana', awayTeam: 'Illinois', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Kansas', awayTeam: 'West Virginia', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Louisville', awayTeam: 'Bowling Green', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '19:45', homeTeam: 'LSU', awayTeam: 'SE Louisiana', network: 'SEC Network', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Wisconsin', awayTeam: 'Maryland', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:30', homeTeam: 'Nebraska', awayTeam: 'Michigan', network: 'CBS/Paramount+', site: 'Home', spread: 'MICH -3', overUnder: '44.5' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'USC', awayTeam: 'Michigan State', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '16:15', homeTeam: 'Mississippi State', awayTeam: 'Northern Illinois', network: 'SEC Network', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:30', homeTeam: 'Missouri', awayTeam: 'South Carolina', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'UCF', awayTeam: 'North Carolina', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Ole Miss', awayTeam: 'Tulane', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Oregon', awayTeam: 'Oregon State', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:30', homeTeam: 'Notre Dame', awayTeam: 'Purdue', network: 'NBC/Peacock', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'TCU', awayTeam: 'SMU', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Virginia', awayTeam: 'Stanford', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '12:45', homeTeam: 'Tennessee', awayTeam: 'UAB', network: 'SEC Network', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '20:00', homeTeam: 'Texas', awayTeam: 'Sam Houston', network: 'ESPN+ / SECN+', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Utah', awayTeam: 'Texas Tech', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '19:30', homeTeam: 'Vanderbilt', awayTeam: 'Georgia State', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '15:00', homeTeam: 'Virginia Tech', awayTeam: 'Wofford', network: '', site: 'Home' },
  { week: 4, date: '2025-09-20', time: '19:30', homeTeam: 'Washington State', awayTeam: 'Washington', network: 'CBS', site: 'Home' },
];

// Helper function to determine if a team is Power 4
const isPower4Team = (team: string): boolean => {
  const power4Teams = [
    // SEC
    'Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 'Mississippi State', 
    'Missouri', 'Ole Miss', 'South Carolina', 'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt',
    // Big Ten
    'Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota', 
    'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State', 'Purdue', 'Rutgers', 
    'UCLA', 'USC', 'Washington', 'Wisconsin',
    // ACC
    'Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville', 
    'Miami (FL)', 'North Carolina', 'NC State', 'Pittsburgh', 'Syracuse', 'Virginia', 
    'Virginia Tech', 'Wake Forest',
    // Big 12
    'Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado', 'Houston', 
    'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 
    'UCF', 'Utah', 'West Virginia'
  ];
  
  return power4Teams.includes(team);
};

// Helper function to determine if game is conference game
const isConferenceGame = (homeTeam: string, awayTeam: string): boolean => {
  const conferences = {
    SEC: ['Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 'Mississippi State', 
          'Missouri', 'Ole Miss', 'South Carolina', 'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt'],
    
    'Big Ten': ['Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota', 
                'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State', 'Purdue', 'Rutgers', 
                'UCLA', 'USC', 'Washington', 'Wisconsin'],
    
    ACC: ['Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville', 
          'Miami (FL)', 'North Carolina', 'NC State', 'Pittsburgh', 'Syracuse', 'Virginia', 
          'Virginia Tech', 'Wake Forest'],
    
    'Big 12': ['Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado', 'Houston', 
               'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 
               'UCF', 'Utah', 'West Virginia']
  };

  for (const [conf, teams] of Object.entries(conferences)) {
    if (teams.includes(homeTeam) && teams.includes(awayTeam)) {
      return true;
    }
  }
  return false;
};

async function insertWeek4Games() {
  try {
    console.log('Starting Week 4 games insertion...');
    
    const insertPromises = week4Games.map(async (game) => {
      // Create startTime in ISO format
      const startTime = new Date(`${game.date}T${game.time}:00-04:00`).toISOString();
      
      const gameData = {
        // Only use fields that exist in the schema
        week: game.week,
        season: 2025,
        season_type: 'regular',
        home_team: game.homeTeam,
        away_team: game.awayTeam,
        start_date: startTime,
        date: game.date,
        eligible_game: isConferenceGame(game.homeTeam, game.awayTeam),
        completed: false,
      };

      try {
        const result = await serverDatabases.createDocument(
          DATABASE_ID,
          COLLECTIONS.GAMES,
          'unique()',
          gameData
        );
        console.log(`✅ Inserted: ${game.awayTeam} @ ${game.homeTeam}`);
        return result;
      } catch (error) {
        console.error(`❌ Error inserting ${game.awayTeam} @ ${game.homeTeam}:`, error);
        throw error;
      }
    });

    const results = await Promise.all(insertPromises);
    console.log(`\n🎉 Successfully inserted ${results.length} Week 4 games!`);
    
    const eligibleGames = results.filter(game => game.eligible_game);
    console.log(`📊 ${eligibleGames.length} games are eligible for fantasy play`);
    
  } catch (error) {
    console.error('❌ Error inserting Week 4 games:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  insertWeek4Games()
    .then(() => {
      console.log('✅ Week 4 games insertion completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Week 4 games insertion failed:', error);
      process.exit(1);
    });
}

export { insertWeek4Games };