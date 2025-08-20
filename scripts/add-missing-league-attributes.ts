#!/usr/bin/env tsx
/**
 * Add missing attributes to the leagues collection in Appwrite
 * Based on the schema drift report
 */

import { Client, Databases } from 'node-appwrite';

const client = new Client();

client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891');

const databases = new Databases(client);
const DATABASE_ID = 'college-football-fantasy';
const COLLECTION_ID = 'leagues';

async function addMissingAttributes() {
  console.log('🔧 Adding missing attributes to leagues collection...\n');

  const attributesToAdd = [
    {
      key: 'draftDate',
      type: 'datetime',
      required: false,
      default: null,
      description: 'Date and time of the draft'
    },
    {
      key: 'selectedConference',
      type: 'string',
      size: 50,
      required: false,
      default: null,
      description: 'Selected conference for single-conference leagues'
    },
    {
      key: 'seasonStartWeek',
      type: 'integer',
      required: false,
      default: null,
      min: 1,
      max: 20,
      description: 'Week number when season starts'
    },
    {
      key: 'playoffTeams',
      type: 'integer',
      required: false,
      default: null,
      min: 0,
      max: 20,
      description: 'Number of teams that make playoffs'
    },
    {
      key: 'playoffStartWeek',
      type: 'integer',
      required: false,
      default: null,
      min: 1,
      max: 20,
      description: 'Week number when playoffs start'
    },
    {
      key: 'waiverType',
      type: 'string',
      size: 20,
      required: false,
      default: null,
      description: 'Type of waiver system'
    },
    {
      key: 'waiverBudget',
      type: 'integer',
      required: false,
      default: null,
      min: 0,
      max: 1000,
      description: 'FAAB waiver budget'
    },
    {
      key: 'password',
      type: 'string',
      size: 50,
      required: false,
      default: null,
      description: 'Password for private leagues'
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const attr of attributesToAdd) {
    try {
      console.log(`📝 Adding attribute: ${attr.key} (${attr.type})`);
      
      let result;
      
      switch (attr.type) {
        case 'string':
          result = await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.size!,
            attr.required!,
            attr.default as string
          );
          break;
          
        case 'integer':
          result = await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required!,
            attr.min,
            attr.max,
            attr.default as number
          );
          break;
          
        case 'datetime':
          result = await databases.createDatetimeAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            attr.key,
            attr.required!,
            attr.default as string
          );
          break;
          
        default:
          throw new Error(`Unknown attribute type: ${attr.type}`);
      }
      
      console.log(`   ✅ Successfully added ${attr.key}`);
      console.log(`   📋 Description: ${attr.description}`);
      successCount++;
      
    } catch (error: any) {
      if (error.message?.includes('Attribute with the requested key already exists')) {
        console.log(`   ⏭️ ${attr.key} already exists - skipping`);
      } else {
        console.error(`   ❌ Failed to add ${attr.key}:`, error.message);
        errorCount++;
      }
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully added: ${successCount} attributes`);
  console.log(`❌ Failed: ${errorCount} attributes`);
  console.log(`⏭️ Skipped (already exist): ${attributesToAdd.length - successCount - errorCount} attributes`);
  
  if (successCount > 0) {
    console.log('\n🎉 Attributes added successfully!');
    console.log('⚠️  Note: It may take a moment for the attributes to appear in the Appwrite Console.');
    console.log('📝 Next steps:');
    console.log('   1. Refresh the Appwrite Console to see the new attributes');
    console.log('   2. Update the API code to include "draftDate" back in VALID_LEAGUE_ATTRIBUTES');
    console.log('   3. Test commissioner settings again - it should work now!');
  }
}

addMissingAttributes().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
