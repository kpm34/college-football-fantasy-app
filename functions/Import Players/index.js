const sdk = require('node-appwrite');

// Player data embedded in the function (first 100 for testing)
const playerData = require('./players-data.json');

module.exports = async function (req, res) {
  // Initialize Appwrite SDK
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  client
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || 'college-football-fantasy-app')
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY || req.variables['APPWRITE_API_KEY']);

  const DATABASE_ID = req.variables['DATABASE_ID'] || 'college-football-fantasy';
  const COLLECTION_ID = req.variables['COLLECTION_ID'] || 'college_players';

  // Parse request
  const payload = req.payload ? JSON.parse(req.payload) : {};
  const action = payload.action || 'import';
  const batchSize = payload.batchSize || 100;
  const startIndex = payload.startIndex || 0;

  if (action === 'count') {
    // Just return current count
    try {
      const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        sdk.Query.limit(1)
      ]);
      return res.json({
        success: true,
        currentCount: result.total,
        totalToImport: playerData.length
      });
    } catch (error) {
      return res.json({
        success: false,
        error: error.message
      });
    }
  }

  if (action === 'clear') {
    // Clear existing data
    try {
      let deleted = 0;
      while (true) {
        const batch = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
          sdk.Query.limit(100)
        ]);
        
        if (batch.documents.length === 0) break;
        
        for (const doc of batch.documents) {
          await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
          deleted++;
        }
      }
      
      return res.json({
        success: true,
        deleted: deleted
      });
    } catch (error) {
      return res.json({
        success: false,
        error: error.message
      });
    }
  }

  // Import action
  try {
    const endIndex = Math.min(startIndex + batchSize, playerData.length);
    const batch = playerData.slice(startIndex, endIndex);
    
    let imported = 0;
    let failed = 0;
    const errors = [];

    for (const player of batch) {
      try {
        // Clean player data - map to schema
        const playerDoc = {
          name: player.name || 'Unknown',
          position: player.position || 'RB',
          team: player.team || player.school || 'Unknown',
          conference: player.conference || 'SEC',
          jerseyNumber: player.jersey_number || player.jerseyNumber || null,
          height: player.height || null,
          weight: player.weight || null,
          year: player.year || null,
          eligible: true,
          fantasy_points: player.fantasy_points || 0,
          season_fantasy_points: player.season_fantasy_points || 0,
          depth_chart_order: player.depth_chart_order || null,
          external_id: player.cfbd_id || player.external_id || null,
          image_url: player.image_url || null,
          stats: player.statline_simple_json || player.stats || null
        };

        // Remove null values
        Object.keys(playerDoc).forEach(key => {
          if (playerDoc[key] === null || playerDoc[key] === undefined) {
            delete playerDoc[key];
          }
        });

        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          sdk.ID.unique(),
          playerDoc
        );
        
        imported++;
      } catch (error) {
        failed++;
        if (errors.length < 5) {
          errors.push(`${player.name}: ${error.message}`);
        }
      }
    }

    // Check if more batches needed
    const hasMore = endIndex < playerData.length;
    const nextIndex = hasMore ? endIndex : null;

    return res.json({
      success: true,
      imported: imported,
      failed: failed,
      startIndex: startIndex,
      endIndex: endIndex,
      totalPlayers: playerData.length,
      hasMore: hasMore,
      nextIndex: nextIndex,
      errors: errors,
      progress: `${endIndex}/${playerData.length} (${Math.round(endIndex/playerData.length * 100)}%)`
    });

  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};
