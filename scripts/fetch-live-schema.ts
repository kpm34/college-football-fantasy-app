import { Client, Databases } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('APPWRITE_API_KEY not found in environment');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(API_KEY.replace(/^"|"$/g, '').replace(/\r?\n$/g, ''));

const databases = new Databases(client);

async function fetchLiveSchema() {
  try {
    console.log('Fetching live Appwrite schema...');
    console.log('Endpoint:', APPWRITE_ENDPOINT);
    console.log('Project ID:', APPWRITE_PROJECT_ID);
    console.log('Database ID:', DATABASE_ID);

    // Get the database info
    const database = await databases.get(DATABASE_ID);
    console.log('\n📊 Database:', database.name);

    // Get all collections
    const collectionsResponse = await databases.listCollections(DATABASE_ID, [], 100);
    const collections = collectionsResponse.collections;
    
    console.log(`\n📚 Found ${collections.length} collections`);

    const schemaData: any = {
      database: {
        id: database.$id,
        name: database.name,
        createdAt: database.$createdAt,
        updatedAt: database.$updatedAt,
      },
      collections: {},
    };

    // For each collection, get its attributes and indexes
    for (const collection of collections) {
      console.log(`\n📁 Processing collection: ${collection.name} (${collection.$id})`);
      
      // Get attributes
      const attributesResponse = await databases.listAttributes(DATABASE_ID, collection.$id, [], 100);
      const attributes = attributesResponse.attributes;
      
      // Get indexes
      const indexesResponse = await databases.listIndexes(DATABASE_ID, collection.$id, [], 100);
      const indexes = indexesResponse.indexes;
      
      schemaData.collections[collection.$id] = {
        name: collection.name,
        id: collection.$id,
        enabled: collection.enabled,
        documentSecurity: collection.documentSecurity,
        permissions: collection.$permissions,
        createdAt: collection.$createdAt,
        updatedAt: collection.$updatedAt,
        attributes: attributes.map((attr: any) => ({
          key: attr.key,
          type: attr.type,
          status: attr.status,
          error: attr.error,
          required: attr.required,
          array: attr.array,
          size: attr.size,
          default: attr.default,
          min: attr.min,
          max: attr.max,
          format: attr.format,
          elements: attr.elements,
          relatedCollection: attr.relatedCollection,
          relationType: attr.relationType,
          twoWay: attr.twoWay,
          twoWayKey: attr.twoWayKey,
          onDelete: attr.onDelete,
          side: attr.side,
        })),
        indexes: indexes.map((index: any) => ({
          key: index.key,
          type: index.type,
          status: index.status,
          error: index.error,
          attributes: index.attributes,
          orders: index.orders,
        })),
        stats: {
          totalAttributes: attributes.length,
          totalIndexes: indexes.length,
        },
      };
      
      console.log(`  ✅ ${attributes.length} attributes, ${indexes.length} indexes`);
    }

    // Save the schema to a JSON file
    const outputPath = path.join(__dirname, '../schema/live-appwrite-schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schemaData, null, 2));
    console.log(`\n✅ Live schema saved to: ${outputPath}`);

    // Generate a summary report
    const summaryPath = path.join(__dirname, '../schema/LIVE_SCHEMA_SUMMARY.md');
    const summary = generateSummary(schemaData);
    fs.writeFileSync(summaryPath, summary);
    console.log(`✅ Summary saved to: ${summaryPath}`);

    return schemaData;
  } catch (error) {
    console.error('Error fetching live schema:', error);
    throw error;
  }
}

function generateSummary(schema: any): string {
  let summary = `# Live Appwrite Schema Summary\n`;
  summary += `Generated: ${new Date().toISOString()}\n\n`;
  summary += `## Database\n`;
  summary += `- **ID**: ${schema.database.id}\n`;
  summary += `- **Name**: ${schema.database.name}\n`;
  summary += `- **Last Updated**: ${schema.database.updatedAt}\n\n`;
  summary += `## Collections (${Object.keys(schema.collections).length})\n\n`;
  
  const sortedCollections = Object.entries(schema.collections)
    .sort(([, a]: any, [, b]: any) => a.name.localeCompare(b.name));
  
  for (const [id, collection] of sortedCollections) {
    const col = collection as any;
    summary += `### ${col.name} (\`${id}\`)\n`;
    summary += `- **Attributes**: ${col.stats.totalAttributes}\n`;
    summary += `- **Indexes**: ${col.stats.totalIndexes}\n`;
    summary += `- **Document Security**: ${col.documentSecurity ? 'Enabled' : 'Disabled'}\n`;
    
    if (col.attributes.length > 0) {
      summary += `\n#### Attributes:\n`;
      for (const attr of col.attributes) {
        const required = attr.required ? ' (required)' : '';
        const array = attr.array ? '[]' : '';
        summary += `- \`${attr.key}\`: ${attr.type}${array}${required}`;
        if (attr.default !== null && attr.default !== undefined) {
          summary += ` [default: ${attr.default}]`;
        }
        summary += `\n`;
      }
    }
    
    if (col.indexes.length > 0) {
      summary += `\n#### Indexes:\n`;
      for (const index of col.indexes) {
        summary += `- \`${index.key}\`: ${index.type} on [${index.attributes.join(', ')}]\n`;
      }
    }
    
    summary += `\n`;
  }
  
  return summary;
}

// Run the script
fetchLiveSchema()
  .then(() => {
    console.log('\n✨ Schema fetch complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Schema fetch failed:', error);
    process.exit(1);
  });
