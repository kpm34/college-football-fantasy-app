#!/usr/bin/env tsx

import { serverDatabases as databases, DATABASE_ID } from './lib/appwrite-server.js';
import { Permission, Role } from 'node-appwrite';

async function finalFixLeagues() {
  try {
    console.log('🚨 FINAL FIX: Recreating leagues collection...');
    
    // Step 1: Backup existing leagues
    console.log('1. Backing up existing leagues...');
    let existingLeagues: any[] = [];
    try {
      const backup = await databases.listDocuments(DATABASE_ID, 'leagues', []);
      existingLeagues = backup.documents;
      console.log(`✅ Backed up ${existingLeagues.length} leagues`);
      
      // Save to file
      const fs = await import('fs');
      await fs.promises.writeFile(
        'leagues-final-backup.json',
        JSON.stringify(existingLeagues, null, 2)
      );
      console.log('💾 Backup saved to leagues-final-backup.json');
    } catch (error) {
      console.log('⚠️  Could not backup leagues (might be corrupted)');
    }
    
    // Step 2: Delete the corrupted collection
    console.log('2. Deleting corrupted leagues collection...');
    try {
      await databases.deleteCollection(DATABASE_ID, 'leagues');
      console.log('✅ Deleted corrupted collection');
    } catch (error: any) {
      console.log('⚠️  Collection might not exist or already deleted:', error.message);
    }
    
    // Step 3: Wait for propagation
    console.log('3. Waiting for database propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Recreate the collection with proper schema
    console.log('4. Recreating leagues collection...');
    const permissions = [
      Permission.read(Role.any()),
      Permission.write(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users())
    ];
    
    const newCollection = await databases.createCollection(
      DATABASE_ID,
      'leagues',
      'Leagues',
      permissions,
      false, // documentSecurity = false initially
      true   // enabled = true
    );
    console.log('✅ Created new leagues collection:', newCollection.$id);
    
    // Step 5: Add required attributes
    console.log('5. Adding collection attributes...');
    
    // Add required attributes first
    await databases.createStringAttribute(DATABASE_ID, 'leagues', 'name', 100, true);
    await databases.createStringAttribute(DATABASE_ID, 'leagues', 'commissioner', 50, true);
    await databases.createIntegerAttribute(DATABASE_ID, 'leagues', 'season', true, 2020, 2030);
    
    // Add optional attributes
    await databases.createIntegerAttribute(DATABASE_ID, 'leagues', 'maxTeams', false, 4, 20);
    await databases.createStringAttribute(DATABASE_ID, 'leagues', 'status', 20, false);
    await databases.createStringAttribute(DATABASE_ID, 'leagues', 'gameMode', 20, false);
    await databases.createStringAttribute(DATABASE_ID, 'leagues', 'draftType', 20, false);
    await databases.createBooleanAttribute(DATABASE_ID, 'leagues', 'isPublic', false);
    await databases.createIntegerAttribute(DATABASE_ID, 'leagues', 'currentTeams', false, 0, 20);
    await databases.createIntegerAttribute(DATABASE_ID, 'leagues', 'pickTimeSeconds', false, 30, 600);
    await databases.createStringAttribute(DATABASE_ID, 'leagues', 'scoringRules', 5000, false);
    
    console.log('✅ Added all collection attributes');
    
    // Step 6: Test creation
    console.log('6. Testing league creation...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for attributes to propagate
    
    const testLeague = {
      name: 'Final Test League',
      commissioner: '689728660623e03830fc',
      season: 2025,
      maxTeams: 8,
      status: 'open',
      gameMode: 'power4',
      draftType: 'snake',
      isPublic: true,
      currentTeams: 0,
      pickTimeSeconds: 90,
      scoringRules: '{}'
    };
    
    const createdLeague = await databases.createDocument(
      DATABASE_ID,
      'leagues',
      'unique()', // Let Appwrite generate the ID
      testLeague
    );
    
    console.log('✅ Successfully created test league:', createdLeague.$id);
    
    // Clean up test league
    await databases.deleteDocument(DATABASE_ID, 'leagues', createdLeague.$id);
    console.log('🗑️ Cleaned up test league');
    
    console.log('\n🎉 SUCCESS! Leagues collection has been fixed.');
    console.log('You can now create leagues through the web interface.');
    
  } catch (error: any) {
    console.error('❌ Final fix failed:', error.message);
    console.error('Full error:', error);
  }
}

finalFixLeagues().catch(console.error);