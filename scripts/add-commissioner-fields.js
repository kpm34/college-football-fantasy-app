const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addCommissionerFields() {
  try {
    console.log('Adding commissioner settings fields to leagues collection...');
    
    // Check existing fields
    const collection = await databases.getCollection(
      'college-football-fantasy',
      'leagues'
    );
    
    // Commissioner settings fields that need to be added
    const fieldsToAdd = [
      { key: 'scheduleSettings', type: 'string', size: 5000, default: null },
      { key: 'playoffSettings', type: 'string', size: 5000, default: null },
      { key: 'theme', type: 'string', size: 5000, default: null },
      { key: 'trophyAwards', type: 'string', size: 5000, default: null },
      { key: 'weeklyHighScores', type: 'string', size: 5000, default: null }
    ];
    
    for (const field of fieldsToAdd) {
      const hasField = collection.attributes.some(attr => attr.key === field.key);
      
      if (!hasField) {
        console.log(`Adding ${field.key} attribute...`);
        
        await databases.createStringAttribute(
          'college-football-fantasy',
          'leagues',
          field.key,
          field.size,
          false, // Not required
          field.default,
          false // Not an array
        );
        
        console.log(`✅ ${field.key} attribute added`);
        
        // Wait a bit for schema to propagate
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log(`${field.key} attribute already exists`);
      }
    }
    
    console.log('\n✅ All commissioner fields added successfully!');
    console.log('\nExisting league attributes:');
    collection.attributes.forEach(attr => {
      console.log(`- ${attr.key} (${attr.type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
    console.error('\nFull error:', error);
  }
}

// Run the script
addCommissionerFields().catch(console.error);
