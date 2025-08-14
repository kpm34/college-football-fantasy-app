const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixPlayersPermissions() {
  try {
    console.log('Checking players collection permissions...');
    
    const collection = await databases.getCollection(
      'college-football-fantasy',
      'players'
    );
    
    console.log('\nCurrent permissions:');
    console.log(JSON.stringify(collection.$permissions, null, 2));
    
    // Players should be readable by all authenticated users
    // Only admins should be able to create/update/delete
    const newPermissions = [
      Permission.read(Role.users()),    // Any authenticated user can read players
    ];
    
    console.log('\nUpdating permissions to:');
    console.log(JSON.stringify(newPermissions, null, 2));
    
    await databases.updateCollection(
      'college-football-fantasy',
      'players',
      collection.name,
      newPermissions
    );
    
    console.log('\n✅ Permissions updated successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
  }
}

// Run the script
fixPlayersPermissions().catch(console.error);
