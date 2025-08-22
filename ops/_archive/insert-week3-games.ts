import { serverDatabases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';

// Week 3 schedule data
const week3Games = [
  // Thursday Sept 11
  { week: 3, date: '2025-09-11', time: '19:30', homeTeam: 'Wake Forest', awayTeam: 'NC State', network: 'ESPN', site: 'Home' },
  
  // Friday Sept 12
  { week: 3, date: '2025-09-12', time: '21:00', homeTeam: 'Arizona', awayTeam: 'Kansas State', network: 'FOX', site: 'Home' },
  { week: 3, date: '2025-09-12', time: '19:30', homeTeam: 'Houston', awayTeam: 'Colorado', network: 'ESPN', site: 'Home' },
  { week: 3, date: '2025-09-12', time: '18:30', homeTeam: 'Indiana', awayTeam: 'Indiana State', network: 'BTN', site: 'Home' },
  { week: 3, date: '2025-09-12', time: '19:00', homeTeam: 'Syracuse', awayTeam: 'Colgate', network: 'ACCN', site: 'Home' },
  { week: 3, date: '2025-09-12', time: '22:00', homeTeam: 'UCLA', awayTeam: 'New Mexico', network: '', site: 'Home' },

  // Saturday Sept 13
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Alabama', awayTeam: 'Wisconsin', network: '', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '22:30', homeTeam: 'Arizona State', awayTeam: 'Texas State', network: 'TNT/HBO Max', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Ole Miss', awayTeam: 'Arkansas', network: '', site: 'Home', spread: '', overUnder: '' },
  { week: 3, date: '2025-09-13', time: '12:45', homeTeam: 'Auburn', awayTeam: 'South Alabama', network: 'SECN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Baylor', awayTeam: 'Samford', network: 'ESPN+', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Cincinnati', awayTeam: 'Northwestern State', network: 'ESPN+', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Georgia Tech', awayTeam: 'Clemson', network: '', site: 'Home', spread: 'CLEM -9.5', overUnder: '58.5' },
  { week: 3, date: '2025-09-13', time: '20:00', homeTeam: 'Tulane', awayTeam: 'Duke', network: 'ESPN2', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '19:30', homeTeam: 'LSU', awayTeam: 'Florida', network: 'ABC', site: 'Home', spread: '-6.5', overUnder: '54.5' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Tennessee', awayTeam: 'Georgia', network: 'ABC', site: 'Home', spread: 'UGA -7', overUnder: '50.5' },
  { week: 3, date: '2025-09-13', time: '19:00', homeTeam: 'Illinois', awayTeam: 'Western Michigan', network: 'FS1', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '19:30', homeTeam: 'Iowa', awayTeam: 'UMass', network: 'BTN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '16:00', homeTeam: 'Arkansas State', awayTeam: 'Iowa State', network: 'ESPN2', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '19:30', homeTeam: 'Kentucky', awayTeam: 'Eastern Michigan', network: 'ESPNU', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Maryland', awayTeam: 'Towson', network: 'Peacock', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '16:30', homeTeam: 'Miami (FL)', awayTeam: 'USF', network: 'The CW', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Michigan', awayTeam: 'Central Michigan', network: 'BTN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Michigan State', awayTeam: 'Youngstown State', network: 'BTN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '16:00', homeTeam: 'Missouri', awayTeam: 'Louisiana', network: 'ESPN+ / SECN+', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Nebraska', awayTeam: 'Houston Christian', network: 'FS1', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'North Carolina', awayTeam: 'Richmond', network: 'ACCN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Northwestern', awayTeam: 'Oregon', network: 'FOX', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '19:00', homeTeam: 'Ohio State', awayTeam: 'Ohio', network: 'Peacock', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Temple', awayTeam: 'Oklahoma', network: 'ESPN2', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Penn State', awayTeam: 'Villanova', network: 'FS1', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'West Virginia', awayTeam: 'Pittsburgh', network: 'ESPN', site: 'Home', spread: 'PITT -2', overUnder: '57.5' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Purdue', awayTeam: 'USC', network: 'CBS/Paramount+', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Rutgers', awayTeam: 'Norfolk State', network: 'BTN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Missouri State', awayTeam: 'SMU', network: 'CBSSN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'South Carolina', awayTeam: 'Vanderbilt', network: '', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '20:00', homeTeam: 'TCU', awayTeam: 'Abilene Christian', network: 'ESPN+', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '16:15', homeTeam: 'Texas', awayTeam: 'UTEP', network: 'SECN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '19:30', homeTeam: 'Notre Dame', awayTeam: 'Texas A&M', network: 'NBC/Peacock', site: 'Home', spread: 'ND -6.5', overUnder: '49.5' },
  { week: 3, date: '2025-09-13', time: '15:30', homeTeam: 'Texas Tech', awayTeam: 'Oregon State', network: 'FOX', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '20:00', homeTeam: 'Wyoming', awayTeam: 'Utah', network: 'CBSSN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '12:00', homeTeam: 'Virginia', awayTeam: 'William & Mary', network: 'ACCN', site: 'Home' },
  { week: 3, date: '2025-09-13', time: '19:00', homeTeam: 'Virginia Tech', awayTeam: 'Old Dominion', network: 'ACCN', site: 'Home' },
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

// Helper function to get team conference
const getTeamConference = (team: string): string => {
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
    if (teams.includes(team)) {
      return conf;
    }
  }
  return 'Other';
};

async function insertWeek3Games() {
  try {
    console.log('Starting Week 3 games insertion...');
    
    const insertPromises = week3Games.map(async (game) => {
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
    console.log(`\n🎉 Successfully inserted ${results.length} Week 3 games!`);
    
    const eligibleGames = results.filter(game => game.eligibleGame || game.isConferenceGame);
    console.log(`📊 ${eligibleGames.length} games are eligible for fantasy play`);
    
  } catch (error) {
    console.error('❌ Error inserting Week 3 games:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  insertWeek3Games()
    .then(() => {
      console.log('✅ Week 3 games insertion completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Week 3 games insertion failed:', error);
      process.exit(1);
    });
}

export { insertWeek3Games };