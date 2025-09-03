#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';

// Read the live collections data
const liveCollectionsPath = path.join(__dirname, '../schema/live-collections.json');
const liveData = JSON.parse(fs.readFileSync(liveCollectionsPath, 'utf-8'));

// Generate updated zod-schema.ts based on live Appwrite schema
function generateZodSchema() {
  const collections = liveData.collections.sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  );

  let output = `// Single Source of Truth: all schemas defined in this file
/**
 * ZOD-FIRST SINGLE SOURCE OF TRUTH
 * 
 * All database schemas, TypeScript types, and validation rules 
 * are defined here using Zod. Everything else is inferred.
 * 
 * Generated from live Appwrite schema on ${new Date().toISOString()}
 */

import { z } from "zod";

/**
 * LIVE APPWRITE COLLECTIONS - Zod Schemas
 * Total Collections: ${collections.length}
 */

`;

  // Collection ID to variable name mapping
  const collectionNameMap: Record<string, string> = {
    'activity_log': 'ActivityLog',
    'rankings': 'Rankings',
    'auctions': 'Auctions',
    'bids': 'Bids',
    'clients': 'Clients',
    'college_players': 'CollegePlayers',
    'migrations': 'Migrations',
    'draft_states': 'DraftStates',
    'draft_events': 'DraftEvents',
    'drafts': 'Drafts',
    'fantasy_teams': 'FantasyTeams',
    'games': 'Games',
    'invites': 'Invites',
    'league_memberships': 'LeagueMemberships',
    'leagues': 'Leagues',
    'lineups': 'Lineups',
    'matchups': 'Matchups',
    'meshy_jobs': 'MeshyJobs',
    'model_versions': 'ModelVersions',
    'model_runs': 'ModelRuns',
    'player_stats': 'PlayerStats',
    'projections': 'Projections',
    'roster_slots': 'RosterSlots',
    'schools': 'Schools',
    'transactions': 'Transactions',
  };

  // Generate schema for each collection
  for (const col of collections) {
    const varName = collectionNameMap[col.$id] || col.$id.replace(/_/g, '');
    
    output += `// Collection: ${col.name} (ID: ${col.$id})\n`;
    output += `export const ${varName} = z.object({\n`;
    
    if (col.attributes && col.attributes.length > 0) {
      for (const attr of col.attributes) {
        let zodType = '';
        
        // Map Appwrite types to Zod types
        switch (attr.type) {
          case 'string':
            zodType = `z.string()`;
            if (attr.size) {
              zodType += `.max(${attr.size})`;
            }
            break;
          case 'integer':
            zodType = `z.number().int()`;
            if (attr.min !== undefined && attr.min !== '-9223372036854775808') {
              zodType += `.min(${attr.min})`;
            }
            if (attr.max !== undefined && attr.max !== '9223372036854775807') {
              zodType += `.max(${attr.max})`;
            }
            break;
          case 'double':
            zodType = `z.number()`;
            break;
          case 'boolean':
            zodType = `z.boolean()`;
            break;
          case 'datetime':
            zodType = `z.date()`;
            break;
          case 'relationship':
            zodType = `z.string()`;
            break;
          default:
            zodType = `z.unknown()`;
        }
        
        // Handle arrays
        if (attr.array) {
          zodType += `.array()`;
        }
        
        // Handle defaults
        if (attr.default !== null && attr.default !== undefined) {
          if (typeof attr.default === 'string') {
            zodType += `.default('${attr.default}')`;
          } else if (typeof attr.default === 'boolean') {
            zodType += `.default(${attr.default})`;
          } else if (typeof attr.default === 'number') {
            zodType += `.default(${attr.default})`;
          }
        }
        
        // Handle optional fields
        if (!attr.required) {
          zodType += `.optional()`;
        }
        
        output += `  ${attr.key}: ${zodType},\n`;
      }
    }
    
    output += `});\n\n`;
  }

  // Add type exports
  output += `/**\n * TYPESCRIPT TYPE EXPORTS\n */\n\n`;
  
  for (const col of collections) {
    const varName = collectionNameMap[col.$id] || col.$id.replace(/_/g, '');
    output += `export type ${varName}Type = z.infer<typeof ${varName}>;\n`;
  }

  // Add collection mappings
  output += `\n/**\n * COLLECTION ID MAPPINGS\n */\n\n`;
  output += `export const COLLECTIONS = {\n`;
  for (const col of collections) {
    const varName = collectionNameMap[col.$id] || col.$id.replace(/_/g, '');
    output += `  ${varName.toUpperCase()}: '${col.$id}',\n`;
  }
  output += `} as const;\n\n`;

  output += `export const COLLECTION_NAMES = {\n`;
  for (const col of collections) {
    output += `  '${col.$id}': '${col.name}',\n`;
  }
  output += `} as const;\n`;

  return output;
}

// Generate updated appwrite-generated.ts
function generateAppwriteTypes() {
  const collections = liveData.collections;
  
  let output = `/**
 * Appwrite Generated Types
 * Generated from live schema on ${new Date().toISOString()}
 */

// Database Configuration
export const DATABASE_ID = 'college-football-fantasy';
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';

// Collection IDs
export const COLLECTIONS = {
`;

  for (const col of collections) {
    const constName = col.$id.toUpperCase().replace(/-/g, '_');
    output += `  ${constName}: '${col.$id}',\n`;
  }

  output += `} as const;

// Collection Names
export const COLLECTION_NAMES = {
`;

  for (const col of collections) {
    output += `  '${col.$id}': '${col.name}',\n`;
  }

  output += `} as const;

// Type exports for collection IDs
export type CollectionId = typeof COLLECTIONS[keyof typeof COLLECTIONS];
export type CollectionName = typeof COLLECTION_NAMES[keyof typeof COLLECTION_NAMES];
`;

  return output;
}

// Main execution
async function updateSSOT() {
  try {
    console.log('📝 Updating SSOT from live Appwrite schema...\n');
    
    // Generate and save zod-schema.ts
    const zodSchema = generateZodSchema();
    const zodPath = path.join(__dirname, '../schema/zod-schema-updated.ts');
    fs.writeFileSync(zodPath, zodSchema);
    console.log(`✅ Generated: ${zodPath}`);
    
    // Generate and save appwrite-generated.ts
    const appwriteTypes = generateAppwriteTypes();
    const appwritePath = path.join(__dirname, '../lib/appwrite-generated-updated.ts');
    fs.writeFileSync(appwritePath, appwriteTypes);
    console.log(`✅ Generated: ${appwritePath}`);
    
    // Create migration report
    const reportPath = path.join(__dirname, '../schema/SCHEMA_MIGRATION_REPORT.md');
    let report = `# Schema Migration Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- Total Collections: ${liveData.collections.length}\n`;
    report += `- Files Updated:\n`;
    report += `  - schema/zod-schema-updated.ts\n`;
    report += `  - lib/appwrite-generated-updated.ts\n\n`;
    report += `## Collections\n\n`;
    
    for (const col of liveData.collections) {
      report += `- **${col.name}** (\`${col.$id}\`): ${col.attributes?.length || 0} attributes, ${col.indexes?.length || 0} indexes\n`;
    }
    
    report += `\n## Next Steps\n\n`;
    report += `1. Review the generated files\n`;
    report += `2. Run tests to ensure compatibility\n`;
    report += `3. Replace the old files with the updated ones\n`;
    report += `4. Update any imports that reference the old schemas\n`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`✅ Report saved: ${reportPath}`);
    
    console.log('\n✨ SSOT update complete!');
    console.log('\n⚠️  Note: The updated files have been saved with "-updated" suffix.');
    console.log('Review them before replacing the original files.');
    
  } catch (error) {
    console.error('❌ Error updating SSOT:', error);
    process.exit(1);
  }
}

// Run the update
updateSSOT();
