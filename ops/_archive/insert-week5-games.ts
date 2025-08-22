import { serverDatabases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';

// Week 5 schedule data
const week5Games = [
  // Friday Sep 26
  { week: 5, date: '2025-09-26', time: '19:30', homeTeam: 'Georgia', awayTeam: 'Alabama', network: 'ABC', site: 'Home', spread: 'UGA -4', overUnder: '52.5' },
  { week: 5, date: '2025-09-26', time: '21:00', homeTeam: 'Arizona State', awayTeam: 'TCU', network: 'FOX', site: 'Home' },
  { week: 5, date: '2025-09-26', time: '19:00', homeTeam: 'Virginia', awayTeam: 'Florida State', network: 'ESPN', site: 'Home' },
  { week: 5, date: '2025-09-26', time: '22:30', homeTeam: 'Oregon State', awayTeam: 'Houston', network: 'ESPN', site: 'Home' },

  // Saturday Sep 27
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Iowa State', awayTeam: 'Arizona', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '12:00', homeTeam: 'Arkansas', awayTeam: 'Notre Dame', network: 'ABC', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Texas A&M', awayTeam: 'Auburn', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Oklahoma State', awayTeam: 'Baylor', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Boston College', awayTeam: 'California', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '22:15', homeTeam: 'Colorado', awayTeam: 'BYU', network: 'ESPN', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Kansas', awayTeam: 'Cincinnati', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Syracuse', awayTeam: 'Duke', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Wake Forest', awayTeam: 'Georgia Tech', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Illinois', awayTeam: 'USC', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Iowa', awayTeam: 'Indiana', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Kansas State', awayTeam: 'UCF', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'South Carolina', awayTeam: 'Kentucky', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Pittsburgh', awayTeam: 'Louisville', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Ole Miss', awayTeam: 'LSU', network: '', site: 'Home', spread: 'LSU -2', overUnder: '56.5' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Minnesota', awayTeam: 'Rutgers', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Mississippi State', awayTeam: 'Tennessee', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Missouri', awayTeam: 'UMass', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'NC State', awayTeam: 'Virginia Tech', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Northwestern', awayTeam: 'UCLA', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Washington', awayTeam: 'Ohio State', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '19:30', homeTeam: 'Penn State', awayTeam: 'Oregon', network: 'NBC/Peacock', site: 'Home', spread: 'PSU -6', overUnder: '52.5' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'Stanford', awayTeam: 'San José State', network: '', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '12:45', homeTeam: 'Vanderbilt', awayTeam: 'Utah State', network: 'SEC Network', site: 'Home' },
  { week: 5, date: '2025-09-27', time: '15:00', homeTeam: 'West Virginia', awayTeam: 'Utah', network: '', site: 'Home' },
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

async function insertWeek5Games() {
  try {
    console.log('Starting Week 5 games insertion...');
    
    const insertPromises = week5Games.map(async (game) => {
      // Create startTime in ISO format
      const startTime = new Date(`${game.date}T${game.time}:00-04:00`).toISOString();
      
      const gameData = {
        // Required fields based on schema
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
    console.log(`\n🎉 Successfully inserted ${results.length} Week 5 games!`);
    
    const eligibleGames = results.filter(game => game.eligible_game);
    console.log(`📊 ${eligibleGames.length} games are eligible for fantasy play`);
    
  } catch (error) {
    console.error('❌ Error inserting Week 5 games:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  insertWeek5Games()
    .then(() => {
      console.log('✅ Week 5 games insertion completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Week 5 games insertion failed:', error);
      process.exit(1);
    });
}

export { insertWeek5Games };