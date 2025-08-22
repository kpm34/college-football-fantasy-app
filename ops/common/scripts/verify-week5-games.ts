import { serverDatabases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';
import { Query } from 'node-appwrite';

async function verifyWeek5Games() {
  try {
    console.log('🔍 Checking Week 5 games in database...');
    
    // Query for Week 5 games
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GAMES,
      [
        Query.equal('week', 5),
        Query.equal('season', 2025),
        Query.orderAsc('start_date')
      ]
    );

    console.log(`📊 Found ${response.total} Week 5 games in the database`);
    
    if (response.total > 0) {
      console.log('\n📅 Sample games:');
      response.documents.slice(0, 5).forEach((game, index) => {
        console.log(`${index + 1}. ${game.away_team} @ ${game.home_team} - ${game.date} (Eligible: ${game.eligible_game})`);
      });
      
      const eligibleGames = response.documents.filter(game => game.eligible_game);
      console.log(`\n🎯 ${eligibleGames.length} games are eligible for fantasy play`);
      
      if (eligibleGames.length > 0) {
        console.log('\n🏈 Conference matchups (eligible games):');
        eligibleGames.forEach((game, index) => {
          console.log(`${index + 1}. ${game.away_team} @ ${game.home_team}`);
        });
      }

      // Count games by conference eligibility
      const secGames = eligibleGames.filter(game => 
        ['Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 'Mississippi State', 
         'Missouri', 'Ole Miss', 'South Carolina', 'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt']
        .includes(game.home_team) && 
        ['Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky', 'LSU', 'Mississippi State', 
         'Missouri', 'Ole Miss', 'South Carolina', 'Tennessee', 'Texas', 'Texas A&M', 'Vanderbilt']
        .includes(game.away_team)
      ).length;
      
      const bigTenGames = eligibleGames.filter(game => 
        ['Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota', 
         'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State', 'Purdue', 'Rutgers', 
         'UCLA', 'USC', 'Washington', 'Wisconsin']
        .includes(game.home_team) && 
        ['Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State', 'Minnesota', 
         'Nebraska', 'Northwestern', 'Ohio State', 'Oregon', 'Penn State', 'Purdue', 'Rutgers', 
         'UCLA', 'USC', 'Washington', 'Wisconsin']
        .includes(game.away_team)
      ).length;
      
      const accGames = eligibleGames.filter(game => 
        ['Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville', 
         'Miami (FL)', 'North Carolina', 'NC State', 'Pittsburgh', 'Syracuse', 'Virginia', 
         'Virginia Tech', 'Wake Forest']
        .includes(game.home_team) && 
        ['Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech', 'Louisville', 
         'Miami (FL)', 'North Carolina', 'NC State', 'Pittsburgh', 'Syracuse', 'Virginia', 
         'Virginia Tech', 'Wake Forest']
        .includes(game.away_team)
      ).length;
      
      const big12Games = eligibleGames.filter(game => 
        ['Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado', 'Houston', 
         'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 
         'UCF', 'Utah', 'West Virginia']
        .includes(game.home_team) && 
        ['Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado', 'Houston', 
         'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State', 'TCU', 'Texas Tech', 
         'UCF', 'Utah', 'West Virginia']
        .includes(game.away_team)
      ).length;

      console.log(`\n📈 Conference breakdown:`);
      console.log(`   SEC: ${secGames} games`);
      console.log(`   Big Ten: ${bigTenGames} games`);
      console.log(`   ACC: ${accGames} games`);
      console.log(`   Big 12: ${big12Games} games`);
      
    } else {
      console.log('❌ No Week 5 games found in database');
    }
    
  } catch (error) {
    console.error('❌ Error verifying Week 5 games:', error);
    throw error;
  }
}

// Run the verification
if (require.main === module) {
  verifyWeek5Games()
    .then(() => {
      console.log('✅ Week 5 games verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Week 5 games verification failed:', error);
      process.exit(1);
    });
}

export { verifyWeek5Games };