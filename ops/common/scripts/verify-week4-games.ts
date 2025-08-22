import { serverDatabases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite-server';
import { Query } from 'node-appwrite';

async function verifyWeek4Games() {
  try {
    console.log('🔍 Checking Week 4 games in database...');
    
    // Query for Week 4 games
    const response = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GAMES,
      [
        Query.equal('week', 4),
        Query.equal('season', 2025),
        Query.orderAsc('start_date')
      ]
    );

    console.log(`📊 Found ${response.total} Week 4 games in the database`);
    
    if (response.total > 0) {
      console.log('\n📅 Sample games:');
      response.documents.slice(0, 5).forEach((game, index) => {
        console.log(`${index + 1}. ${game.away_team} @ ${game.home_team} - ${game.date} (Eligible: ${game.eligible_game})`);
      });
      
      const eligibleGames = response.documents.filter(game => game.eligible_game);
      console.log(`\n🎯 ${eligibleGames.length} games are eligible for fantasy play`);
      
      if (eligibleGames.length > 0) {
        console.log('\n🏈 Eligible games:');
        eligibleGames.forEach((game, index) => {
          console.log(`${index + 1}. ${game.away_team} @ ${game.home_team}`);
        });
      }
    } else {
      console.log('❌ No Week 4 games found in database');
    }
    
  } catch (error) {
    console.error('❌ Error verifying Week 4 games:', error);
    throw error;
  }
}

// Run the verification
if (require.main === module) {
  verifyWeek4Games()
    .then(() => {
      console.log('✅ Week 4 games verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Week 4 games verification failed:', error);
      process.exit(1);
    });
}

export { verifyWeek4Games };