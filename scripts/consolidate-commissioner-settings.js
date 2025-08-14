const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function consolidateCommissionerSettings() {
  try {
    console.log('Checking existing leagues collection...');
    
    // Check existing fields
    const collection = await databases.getCollection(
      'college-football-fantasy',
      'leagues'
    );
    
    console.log('\nExisting league attributes:');
    collection.attributes.forEach(attr => {
      console.log(`- ${attr.key} (${attr.type}, size: ${attr.size || 'N/A'})`);
    });
    console.log(`Total attributes: ${collection.attributes.length}`);
    
    // Check if commissionerSettings field exists
    const hasCommissionerSettings = collection.attributes.some(attr => attr.key === 'commissionerSettings');
    
    if (!hasCommissionerSettings) {
      console.log('\nAdding commissionerSettings consolidated field...');
      
      try {
        await databases.createStringAttribute(
          'college-football-fantasy',
          'leagues',
          'commissionerSettings',
          10000, // Large size for all settings combined
          false, // Not required
          null,  // No default
          false  // Not an array
        );
        
        console.log('✅ commissionerSettings attribute added successfully!');
        console.log('\nThis field will store all commissioner settings as a JSON string including:');
        console.log('- scheduleSettings');
        console.log('- playoffSettings');
        console.log('- theme');
        console.log('- trophyAwards');
        console.log('- weeklyHighScores');
        
      } catch (error) {
        console.error('Failed to add commissionerSettings field:', error.message);
      }
    } else {
      console.log('\ncommissionerSettings field already exists!');
    }
    
    // Check if we have scoringRules field
    const hasScoringRules = collection.attributes.some(attr => attr.key === 'scoringRules');
    console.log(`\nscoringRules field exists: ${hasScoringRules ? 'Yes ✅' : 'No ❌'}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

// Run the script
consolidateCommissionerSettings().catch(console.error);
