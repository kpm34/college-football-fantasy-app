const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Define expected permissions for each collection
const COLLECTION_PERMISSIONS = {
  'users': [
    Permission.read(Role.users()),    // Users can read other users (for league members)
    Permission.create(Role.guests()), // Guests can create accounts
    Permission.update(Role.users()),  // Users can update their own (document-level)
  ],
  'leagues': [
    Permission.read(Role.users()),    // Any user can read leagues
    Permission.create(Role.users()),  // Any user can create leagues
    Permission.update(Role.users()),  // Users can update (commissioner only - document level)
    Permission.delete(Role.users()),  // Users can delete (commissioner only - document level)
  ],
  'rosters': [
    Permission.read(Role.users()),    // Any user can read rosters
    Permission.create(Role.users()),  // Any user can create rosters
    Permission.update(Role.users()),  // Users can update their own
    Permission.delete(Role.users()),  // Users can delete their own
  ],
  'players': [
    Permission.read(Role.users()),    // Any user can read players
  ],
  'games': [
    Permission.read(Role.any()),      // Anyone can read games (public data)
  ],
  'rankings': [
    Permission.read(Role.any()),      // Anyone can read rankings (public data)
  ],
  'teams': [
    Permission.read(Role.any()),      // Anyone can read teams (public data)
  ],
  'draft_picks': [
    Permission.read(Role.users()),    // Users can read draft picks
    Permission.create(Role.users()),  // Users can create draft picks
  ],
  'lineups': [
    Permission.read(Role.users()),    // Users can read lineups
    Permission.create(Role.users()),  // Users can create lineups
    Permission.update(Role.users()),  // Users can update their own
    Permission.delete(Role.users()),  // Users can delete their own
  ],
  'activity_log': [
    Permission.read(Role.users()),    // Users can read activity
    Permission.create(Role.users()),  // System can create activity
  ],
};

async function checkAllPermissions() {
  try {
    console.log('Checking all collection permissions...\n');
    
    // Get all collections
    const collections = await databases.listCollections('college-football-fantasy');
    
    for (const collection of collections.collections) {
      console.log(`\n📁 Collection: ${collection.name} (${collection.$id})`);
      console.log('Current permissions:', JSON.stringify(collection.$permissions, null, 2));
      
      const expectedPerms = COLLECTION_PERMISSIONS[collection.$id];
      if (expectedPerms) {
        console.log('Expected permissions:', JSON.stringify(expectedPerms, null, 2));
        
        // Check if permissions match
        const currentPermsStr = JSON.stringify(collection.$permissions.sort());
        const expectedPermsStr = JSON.stringify(expectedPerms.sort());
        
        if (currentPermsStr !== expectedPermsStr) {
          console.log('❌ Permissions do not match expected!');
        } else {
          console.log('✅ Permissions match expected');
        }
      } else {
        console.log('⚠️  No expected permissions defined for this collection');
      }
      
      console.log('---');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

// Run the script
checkAllPermissions().catch(console.error);
