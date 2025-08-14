const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addScoringRulesField() {
  try {
    console.log('Adding scoringRules field to leagues collection...');
    
    // Check if scoringRules attribute exists
    const collection = await databases.getCollection(
      'college-football-fantasy',
      'leagues'
    );
    
    const hasScoringRules = collection.attributes.some(attr => attr.key === 'scoringRules');
    
    if (!hasScoringRules) {
      console.log('Creating scoringRules attribute...');
      await databases.createStringAttribute(
        'college-football-fantasy',
        'leagues',
        'scoringRules',
        5000, // Max length for JSON string
        false, // Not required
        null, // No default
        false // Not an array
      );
      console.log('✅ scoringRules attribute added successfully');
      
      // Wait a bit for schema to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('scoringRules attribute already exists');
    }
    
    // Also add other commissioner settings fields if missing
    const fieldsToAdd = [
      { key: 'pickTimeSeconds', type: 'integer', size: null, default: 90 },
      { key: 'seasonStartWeek', type: 'integer', size: null, default: 1 },
      { key: 'gameMode', type: 'string', size: 50, default: 'power4' },
      { key: 'rosterSchema', type: 'string', size: 1000, default: null },
      { key: 'inviteCode', type: 'string', size: 20, default: null },
      { key: 'isPublic', type: 'boolean', size: null, default: true },
      { key: 'commissionerId', type: 'string', size: 255, default: null }
    ];
    
    for (const field of fieldsToAdd) {
      const hasField = collection.attributes.some(attr => attr.key === field.key);
      
      if (!hasField) {
        console.log(`Adding ${field.key} attribute...`);
        
        if (field.type === 'string') {
          await databases.createStringAttribute(
            'college-football-fantasy',
            'leagues',
            field.key,
            field.size,
            false,
            field.default,
            false
          );
        } else if (field.type === 'integer') {
          await databases.createIntegerAttribute(
            'college-football-fantasy',
            'leagues',
            field.key,
            false,
            null,
            null,
            field.default,
            false
          );
        } else if (field.type === 'boolean') {
          await databases.createBooleanAttribute(
            'college-football-fantasy',
            'leagues',
            field.key,
            false,
            field.default,
            false
          );
        }
        
        console.log(`✅ ${field.key} attribute added`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n✅ All fields added successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

addScoringRulesField();
