const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixRostersPermissions() {
  try {
    console.log('Checking rosters collection permissions...');
    
    const collection = await databases.getCollection(
      'college-football-fantasy',
      'rosters'
    );
    
    console.log('\nCurrent permissions:');
    console.log(JSON.stringify(collection.$permissions, null, 2));
    
    // Update permissions to allow:
    // 1. Any authenticated user to read rosters in their leagues
    // 2. Users to update their own rosters
    // 3. Create rosters when joining a league
    const newPermissions = [
      Permission.read(Role.users()),    // Any authenticated user can read
      Permission.create(Role.users()),  // Any authenticated user can create
      Permission.update(Role.users()),  // Users can update (we'll add document-level security)
      Permission.delete(Role.users())   // Users can delete (we'll add document-level security)
    ];
    
    console.log('\nUpdating permissions to:');
    console.log(JSON.stringify(newPermissions, null, 2));
    
    await databases.updateCollection(
      'college-football-fantasy',
      'rosters',
      collection.name,
      newPermissions
    );
    
    console.log('\n✅ Permissions updated successfully!');
    
    // Also check the document security model
    console.log('\nNote: Make sure your rosters documents have proper document-level permissions:');
    console.log('- Read: Role.users() or Role.user(userId) for private rosters');
    console.log('- Update/Delete: Role.user(userId) for the roster owner only');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

// Run the script
fixRostersPermissions().catch(console.error);
