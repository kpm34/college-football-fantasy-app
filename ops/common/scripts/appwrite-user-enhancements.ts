import { Client, Databases, Storage, Teams, Query, ID, Permission, Role } from 'appwrite';
import { APPWRITE_CONFIG } from '../lib/config/appwrite.config';
import { COLLECTIONS } from '../lib/appwrite';

// This script uses user session (not API key) to create what we can
// For admin features like indexes, you'll need to use the Appwrite console

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n🎯 Appwrite User-Level Enhancements\n', 'blue');
  
  // Initialize client with session from cookies
  const sessionCookie = process.env.SESSION_COOKIE;
  if (!sessionCookie) {
    log('❌ Please provide SESSION_COOKIE environment variable', 'red');
    log('Run: SESSION_COOKIE="your_session_cookie" npm run enhance-appwrite', 'yellow');
    process.exit(1);
  }
  
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setSession(sessionCookie);
  
  const databases = new Databases(client);
  const storage = new Storage(client);
  const teams = new Teams(client);
  
  const DATABASE_ID = APPWRITE_CONFIG.databaseId;
  
  try {
    // 1. Create missing collections
    log('\n📁 Creating Missing Collections...', 'blue');
    
    const collectionsToCreate = [
      {
        id: 'trades',
        name: 'Trades',
        attributes: [
          { name: 'roster1Id', type: 'string', size: 36, required: true },
          { name: 'roster2Id', type: 'string', size: 36, required: true },
          { name: 'players1', type: 'string', size: 5000, required: true },
          { name: 'players2', type: 'string', size: 5000, required: true },
          { name: 'status', type: 'string', size: 20, required: true },
          { name: 'proposedBy', type: 'string', size: 36, required: true },
          { name: 'proposedAt', type: 'datetime', required: true },
          { name: 'respondedAt', type: 'datetime', required: false },
          { name: 'message', type: 'string', size: 500, required: false }
        ]
      },
      {
        id: 'notifications',
        name: 'Notifications',
        attributes: [
          { name: 'userId', type: 'string', size: 36, required: true },
          { name: 'type', type: 'string', size: 50, required: true },
          { name: 'title', type: 'string', size: 100, required: true },
          { name: 'message', type: 'string', size: 1000, required: true },
          { name: 'read', type: 'boolean', required: true, default: false },
          { name: 'metadata', type: 'string', size: 5000, required: false },
          { name: 'createdAt', type: 'datetime', required: true }
        ]
      },
      {
        id: 'waiver_claims',
        name: 'Waiver Claims',
        attributes: [
          { name: 'rosterId', type: 'string', size: 36, required: true },
          { name: 'leagueId', type: 'string', size: 36, required: true },
          { name: 'playerId', type: 'string', size: 36, required: true },
          { name: 'dropPlayerId', type: 'string', size: 36, required: false },
          { name: 'priority', type: 'integer', required: true, min: 1, max: 100 },
          { name: 'status', type: 'string', size: 20, required: true },
          { name: 'processedAt', type: 'datetime', required: false },
          { name: 'createdAt', type: 'datetime', required: true }
        ]
      }
    ];
    
    for (const collection of collectionsToCreate) {
      try {
        log(`Creating collection: ${collection.name}...`, 'yellow');
        
        // Create collection
        const col = await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
          ]
        );
        
        log(`✅ Created collection: ${collection.name}`, 'green');
        
        // Create attributes
        for (const attr of collection.attributes) {
          try {
            switch (attr.type) {
              case 'string':
                await databases.createStringAttribute(
                  DATABASE_ID,
                  collection.id,
                  attr.name,
                  attr.size!,
                  attr.required,
                  attr.default
                );
                break;
              case 'integer':
                await databases.createIntegerAttribute(
                  DATABASE_ID,
                  collection.id,
                  attr.name,
                  attr.required,
                  attr.min,
                  attr.max,
                  attr.default
                );
                break;
              case 'boolean':
                await databases.createBooleanAttribute(
                  DATABASE_ID,
                  collection.id,
                  attr.name,
                  attr.required,
                  attr.default
                );
                break;
              case 'datetime':
                await databases.createDatetimeAttribute(
                  DATABASE_ID,
                  collection.id,
                  attr.name,
                  attr.required,
                  attr.default
                );
                break;
            }
            log(`  ✅ Created attribute: ${attr.name}`, 'green');
          } catch (error: any) {
            if (error.code === 409) {
              log(`  ⏭️  Attribute ${attr.name} already exists`, 'yellow');
            } else {
              log(`  ❌ Error creating attribute ${attr.name}: ${error.message}`, 'red');
            }
          }
        }
        
      } catch (error: any) {
        if (error.code === 409) {
          log(`⏭️  Collection ${collection.name} already exists`, 'yellow');
        } else {
          log(`❌ Error creating collection ${collection.name}: ${error.message}`, 'red');
        }
      }
    }
    
    // 2. Create Teams for Leagues
    log('\n👥 Setting up Teams for Leagues...', 'blue');
    
    try {
      // Get user's leagues where they are commissioner
      const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
        headers: {
          'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': `a_session_${APPWRITE_CONFIG.projectId}=${sessionCookie}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }
      
      const user = await userResponse.json();
      
      const leagues = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        [Query.equal('commissioner', user.$id)]
      );
      
      for (const league of leagues.documents) {
        try {
          log(`Creating team for league: ${league.name}...`, 'yellow');
          
          // Create a team for the league
          const team = await teams.create(
            ID.unique(),
            `league-${league.$id}`,
            [`${league.name} Members`]
          );
          
          // Update league with team ID
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.LEAGUES,
            league.$id,
            { teamId: team.$id }
          );
          
          log(`✅ Created team for ${league.name}`, 'green');
          
        } catch (error: any) {
          if (error.code === 409) {
            log(`⏭️  Team for ${league.name} already exists`, 'yellow');
          } else {
            log(`❌ Error creating team for ${league.name}: ${error.message}`, 'red');
          }
        }
      }
      
    } catch (error: any) {
      log(`❌ Error setting up teams: ${error.message}`, 'red');
    }
    
    // 3. Generate Manual Setup Guide
    log('\n📖 Manual Setup Required in Appwrite Console:', 'blue');
    log('\n1. 🔍 Database Indexes (Settings > Database > [Collection] > Indexes):', 'yellow');
    log('   Leagues: commissioner, status, gameMode, season, isPublic+status', 'reset');
    log('   Rosters: leagueId, userId, leagueId+userId, wins, pointsFor', 'reset');
    log('   Players: team, position, conference, eligibility, name(fulltext)', 'reset');
    log('   Games: week, season, home_team, away_team, season+week', 'reset');
    log('   Draft Picks: leagueId, rosterId, playerId, round, leagueId+round+pick', 'reset');
    
    log('\n2. 📦 Storage Buckets (Settings > Storage):', 'yellow');
    log('   - team-logos (5MB, images only)', 'reset');
    log('   - user-avatars (2MB, images only)', 'reset');
    log('   - league-assets (10MB, images/PDFs)', 'reset');
    
    log('\n3. 🚀 Functions (Settings > Functions):', 'yellow');
    log('   - Deploy ops/common/functions/weekly-scoring', 'reset');
    log('   - Deploy ops/common/functions/draft-reminder', 'reset');
    log('   - Deploy ops/common/functions/trade-processor', 'reset');
    
    log('\n4. 📧 Messaging (Settings > Messaging):', 'yellow');
    log('   - Configure SMTP provider', 'reset');
    log('   - Set up email templates', 'reset');
    
    log('\n5. 🔗 Database Relationships:', 'yellow');
    log('   - rosters.leagueId -> leagues (many-to-one)', 'reset');
    log('   - draft_picks.rosterId -> rosters (many-to-one)', 'reset');
    log('   - draft_picks.playerId -> players (many-to-one)', 'reset');
    
    log('\n✅ User-level enhancements complete!', 'green');
    
  } catch (error: any) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default main;
