import { databases, DATABASE_ID } from '../config/appwrite.config';
import { ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

async function createCollegePlayersCollection() {
  console.log('Creating college_players collection...\n');
  
  try {
    // Check if database exists
    const db = await databases.get(DATABASE_ID);
    console.log(`✅ Found database: ${db.name}`);
    
    // Create college_players collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      'college_players',
      'College Players',
      [
        { 
          type: 'string',
          key: 'espnId',
          size: 20,
          required: false
        },
        {
          type: 'string',
          key: 'cfbdId',
          size: 20,
          required: false
        },
        {
          type: 'string',
          key: 'firstName',
          size: 50,
          required: true
        },
        {
          type: 'string',
          key: 'lastName',
          size: 50,
          required: true
        },
        {
          type: 'string',
          key: 'displayName',
          size: 100,
          required: true
        },
        {
          type: 'string',
          key: 'jersey',
          size: 10,
          required: false
        },
        {
          type: 'string',
          key: 'position',
          size: 20,
          required: true
        },
        {
          type: 'string',
          key: 'fantasyPosition',
          size: 10,
          required: true
        },
        {
          type: 'string',
          key: 'team',
          size: 100,
          required: true
        },
        {
          type: 'string',
          key: 'teamId',
          size: 20,
          required: true
        },
        {
          type: 'string',
          key: 'conference',
          size: 20,
          required: true
        },
        {
          type: 'string',
          key: 'height',
          size: 10,
          required: false
        },
        {
          type: 'integer',
          key: 'weight',
          required: false
        },
        {
          type: 'string',
          key: 'class',
          size: 20,
          required: false
        },
        {
          type: 'integer',
          key: 'depthChartPosition',
          required: false
        },
        {
          type: 'boolean',
          key: 'isStarter',
          required: false
        },
        {
          type: 'boolean',
          key: 'eligibleForWeek',
          required: false,
          default: true
        },
        {
          type: 'string',
          key: 'injuryStatus',
          size: 20,
          required: false
        },
        {
          type: 'string',
          key: 'injuryNotes',
          size: 500,
          required: false
        },
        {
          type: 'string',
          key: 'seasonStats',
          size: 5000,
          required: false
        },
        {
          type: 'string',
          key: 'weeklyProjections',
          size: 10000,
          required: false
        },
        {
          type: 'double',
          key: 'fantasyPoints',
          required: false,
          default: 0
        },
        {
          type: 'datetime',
          key: 'lastUpdated',
          required: false
        },
        {
          type: 'string',
          key: 'dataSource',
          size: 50,
          required: false
        }
      ]
    );
    
    console.log('✅ Created college_players collection');
    
    // Create indexes
    console.log('\nCreating indexes...');
    
    await databases.createIndex(
      DATABASE_ID,
      'college_players',
      'team_index',
      'key',
      ['team']
    );
    console.log('✅ Created team index');
    
    await databases.createIndex(
      DATABASE_ID,
      'college_players',
      'position_index',
      'key',
      ['fantasyPosition']
    );
    console.log('✅ Created position index');
    
    await databases.createIndex(
      DATABASE_ID,
      'college_players',
      'conference_index',
      'key',
      ['conference']
    );
    console.log('✅ Created conference index');
    
    await databases.createIndex(
      DATABASE_ID,
      'college_players',
      'fantasy_points_index',
      'key',
      ['fantasyPoints']
    );
    console.log('✅ Created fantasy points index');
    
    await databases.createIndex(
      DATABASE_ID,
      'college_players',
      'eligible_index',
      'key',
      ['eligibleForWeek']
    );
    console.log('✅ Created eligibility index');
    
    console.log('\n✅ College players collection created successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message || error);
    
    // Check if it's because the collection already exists
    if (error.code === 409) {
      console.log('\n✅ College players collection already exists!');
    }
  }
}

// Run the script
createCollegePlayersCollection().catch(console.error);