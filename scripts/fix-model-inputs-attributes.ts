#!/usr/bin/env ts-node
import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';

async function addMissingAttributes() {
  console.log('Adding missing attributes to model_inputs collection...');
  
  const attributesToAdd = [
    { key: 'depth_chart_json', size: 16384 },
    { key: 'usage_priors_json', size: 16384 },
    { key: 'team_efficiency_json', size: 16384 },
    { key: 'pace_estimates_json', size: 16384 },
    { key: 'opponent_grades_by_pos_json', size: 16384 },
    { key: 'manual_overrides_json', size: 16384 },
    { key: 'ea_ratings_json', size: 16384 },
    { key: 'nfl_draft_capital_json', size: 16384 }
  ];

  for (const attr of attributesToAdd) {
    try {
      await databases.getAttribute(DATABASE_ID, 'model_inputs', attr.key);
      console.log(`✓ Attribute ${attr.key} already exists`);
    } catch {
      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          'model_inputs',
          attr.key,
          attr.size,
          false // not required
        );
        console.log(`✓ Created attribute ${attr.key}`);
      } catch (error: any) {
        console.error(`✗ Failed to create ${attr.key}:`, error.message);
      }
    }
  }
}

async function main() {
  if (!process.env.APPWRITE_API_KEY) {
    console.error('Missing APPWRITE_API_KEY environment variable');
    process.exit(1);
  }

  try {
    await addMissingAttributes();
    console.log('\n✅ Attribute fixes complete');
  } catch (error: any) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main();
