import * as dotenv from 'dotenv';
import { databases, DATABASE_ID, COLLECTIONS } from '../config/appwrite.config';

dotenv.config();

async function checkData() {
  console.log('📊 Checking data in Appwrite...\n');

  try {
    // Check games
    const games = await databases.listDocuments(DATABASE_ID, COLLECTIONS.GAMES);
    console.log(`✅ Games: ${games.total} documents`);
    if (games.documents.length > 0) {
      console.log('   Sample game:', {
        teams: `${games.documents[0].awayTeam} @ ${games.documents[0].homeTeam}`,
        date: games.documents[0].startDate,
        status: games.documents[0].status
      });
    }

    // Check rankings
    const rankings = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RANKINGS);
    console.log(`\n✅ Rankings: ${rankings.total} documents`);
    if (rankings.documents.length > 0) {
      const latestRanking = rankings.documents[0];
      const teams = JSON.parse(latestRanking.rankings);
      console.log(`   Week ${latestRanking.week} - Top 5:`);
      teams.slice(0, 5).forEach((team: any) => {
        console.log(`   #${team.rank} ${team.school}`);
      });
    }

    // Check teams
    const teams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TEAMS);
    console.log(`\n✅ Teams: ${teams.total} documents`);
    
    console.log('\n🎉 Your database is ready to use!');
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

checkData();