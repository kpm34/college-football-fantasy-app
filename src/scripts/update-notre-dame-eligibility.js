import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'college_players';

async function updateNotreDameEligibility() {
  console.log('🏈 Updating Notre Dame Eligibility Rules...');
  console.log('==========================================');
  console.log('📋 Special case: ND players can be used vs ranked teams or Power 4 teams');
  console.log('');

  try {
    // Get all Notre Dame players
    const response = await databases.listDocuments(
      DATABASE_ID, 
      COLLECTION_ID, 
      [Query.equal('team', 'Notre Dame')],
      100, 
      0
    );

    console.log(`Found ${response.total} Notre Dame players to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const player of response.documents) {
      try {
        // Update the player with special eligibility rules
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          player.$id,
          {
            // Keep existing data but add special eligibility flags
            power_4: false, // They're not Power 4, but have special rules
            conference: 'Independent',
            conference_id: 'independent',
            draftable: player.draftable, // Keep existing draftable status
            // Add special eligibility notes
            special_eligibility: true,
            eligibility_rules: 'Can be used vs ranked teams or Power 4 teams (SEC, ACC, Big Ten, Big 12)',
            updated_at: new Date().toISOString()
          }
        );

        console.log(`  ✅ Updated ${player.name} (${player.position}) - Special eligibility: vs ranked/Power 4 teams`);
        updatedCount++;
      } catch (error) {
        console.log(`  ❌ Error updating ${player.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n🎉 Notre Dame Eligibility Update Summary:');
    console.log(`  ✅ Total players updated: ${updatedCount}`);
    console.log(`  ❌ Total errors: ${errorCount}`);
    console.log(`  📋 Special rules applied: Can be used vs ranked teams or Power 4 teams`);
    console.log('🏈 Notre Dame eligibility rules updated!');

  } catch (error) {
    console.error('❌ Error fetching Notre Dame players:', error.message);
  }
}

updateNotreDameEligibility(); 