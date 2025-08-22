const sdk = require('node-appwrite');

// Initialize Appwrite SDK
const client = new sdk.Client();
const databases = new sdk.Databases(client);
const users = new sdk.Users(client);

client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

const DATABASE_ID = process.env.DATABASE_ID;

module.exports = async function (req, res) {
  try {
    // This function processes trade offers
    // Triggered when a trade document is created or updated
    
    const { $id: tradeId, status, roster1Id, roster2Id, players1, players2 } = req.payload || {};
    
    if (!tradeId) {
      throw new Error('Trade ID is required');
    }
    
    console.log(`Processing trade ${tradeId} with status: ${status}`);
    
    // Get trade details
    const trade = await databases.getDocument(
      DATABASE_ID,
      'trades',
      tradeId
    );
    
    // Handle different trade statuses
    switch (trade.status) {
      case 'pending':
        // Send notification to receiving team
        await notifyTradeOffer(trade);
        break;
        
      case 'accepted':
        // Execute the trade
        await executeTrade(trade);
        await notifyTradeResult(trade, 'accepted');
        break;
        
      case 'rejected':
        // Notify the proposer
        await notifyTradeResult(trade, 'rejected');
        break;
        
      case 'cancelled':
        // Clean up any locks on players
        await notifyTradeResult(trade, 'cancelled');
        break;
    }
    
    return res.json({
      success: true,
      message: `Trade ${tradeId} processed successfully`,
      status: trade.status
    });
    
  } catch (error) {
    console.error('Trade processor error:', error);
    return res.json({
      success: false,
      error: error.message
    }, 500);
  }
};

async function executeTrade(trade) {
  console.log('Executing trade...');
  
  // Get both rosters
  const [roster1, roster2] = await Promise.all([
    databases.getDocument(DATABASE_ID, 'rosters', trade.roster1Id),
    databases.getDocument(DATABASE_ID, 'rosters', trade.roster2Id)
  ]);
  
  // Parse player arrays
  const roster1Players = JSON.parse(roster1.players || '[]');
  const roster2Players = JSON.parse(roster2.players || '[]');
  const tradePlayers1 = JSON.parse(trade.players1 || '[]');
  const tradePlayers2 = JSON.parse(trade.players2 || '[]');
  
  // Validate all players exist on correct rosters
  for (const playerId of tradePlayers1) {
    if (!roster1Players.some(p => p.playerId === playerId)) {
      throw new Error(`Player ${playerId} not found on roster 1`);
    }
  }
  
  for (const playerId of tradePlayers2) {
    if (!roster2Players.some(p => p.playerId === playerId)) {
      throw new Error(`Player ${playerId} not found on roster 2`);
    }
  }
  
  // Execute the swap
  const newRoster1Players = roster1Players
    .filter(p => !tradePlayers1.includes(p.playerId))
    .concat(
      tradePlayers2.map(playerId => {
        const player = roster2Players.find(p => p.playerId === playerId);
        return {
          ...player,
          acquisitionType: 'trade',
          acquisitionDate: new Date().toISOString()
        };
      })
    );
    
  const newRoster2Players = roster2Players
    .filter(p => !tradePlayers2.includes(p.playerId))
    .concat(
      tradePlayers1.map(playerId => {
        const player = roster1Players.find(p => p.playerId === playerId);
        return {
          ...player,
          acquisitionType: 'trade',
          acquisitionDate: new Date().toISOString()
        };
      })
    );
  
  // Update both rosters
  await Promise.all([
    databases.updateDocument(
      DATABASE_ID,
      'rosters',
      trade.roster1Id,
      { 
        players: JSON.stringify(newRoster1Players),
        updatedAt: new Date().toISOString()
      }
    ),
    databases.updateDocument(
      DATABASE_ID,
      'rosters',
      trade.roster2Id,
      { 
        players: JSON.stringify(newRoster2Players),
        updatedAt: new Date().toISOString()
      }
    )
  ]);
  
  // Log the trade
  await databases.createDocument(
    DATABASE_ID,
    'activity_log',
    sdk.ID.unique(),
    {
      type: 'trade',
      leagueId: roster1.leagueId,
      message: `Trade completed between ${roster1.teamName} and ${roster2.teamName}`,
      metadata: JSON.stringify({
        tradeId: trade.$id,
        roster1Id: trade.roster1Id,
        roster2Id: trade.roster2Id,
        players1: tradePlayers1,
        players2: tradePlayers2
      }),
      createdAt: new Date().toISOString()
    }
  );
  
  console.log('Trade executed successfully');
}

async function notifyTradeOffer(trade) {
  console.log('Notifying trade offer...');
  
  // Get roster and user details
  const [roster1, roster2] = await Promise.all([
    databases.getDocument(DATABASE_ID, 'rosters', trade.roster1Id),
    databases.getDocument(DATABASE_ID, 'rosters', trade.roster2Id)
  ]);
  
  const [user1, user2] = await Promise.all([
    users.get(roster1.userId),
    users.get(roster2.userId)
  ]);
  
  // Get player names for the notification
  const tradePlayers1 = JSON.parse(trade.players1 || '[]');
  const tradePlayers2 = JSON.parse(trade.players2 || '[]');
  
  const players1Names = await getPlayerNames(tradePlayers1);
  const players2Names = await getPlayerNames(tradePlayers2);
  
  // Create notification (in production, send actual email)
  const notification = {
    to: user2.email,
    subject: `New Trade Offer in ${roster1.leagueName || 'your league'}`,
    content: `${user1.name || user1.email} wants to trade:\n\n` +
             `They offer: ${players1Names.join(', ')}\n` +
             `For your: ${players2Names.join(', ')}\n\n` +
             `Review at: https://cfbfantasy.app/league/${roster1.leagueId}/trades`,
  };
  
  console.log('Trade offer notification:', notification);
  
  // Store notification for processing
  await databases.createDocument(
    DATABASE_ID,
    'notifications',
    sdk.ID.unique(),
    {
      userId: user2.$id,
      type: 'trade_offer',
      title: 'New Trade Offer',
      message: notification.content,
      read: false,
      metadata: JSON.stringify({ tradeId: trade.$id }),
      createdAt: new Date().toISOString()
    }
  );
}

async function notifyTradeResult(trade, result) {
  console.log(`Notifying trade ${result}...`);
  
  // Get roster details
  const roster1 = await databases.getDocument(DATABASE_ID, 'rosters', trade.roster1Id);
  const user1 = await users.get(roster1.userId);
  
  const message = result === 'accepted' 
    ? 'Your trade offer has been accepted!' 
    : `Your trade offer has been ${result}.`;
  
  // Store notification
  await databases.createDocument(
    DATABASE_ID,
    'notifications',
    sdk.ID.unique(),
    {
      userId: user1.$id,
      type: `trade_${result}`,
      title: `Trade ${result}`,
      message: message,
      read: false,
      metadata: JSON.stringify({ tradeId: trade.$id }),
      createdAt: new Date().toISOString()
    }
  );
}

async function getPlayerNames(playerIds) {
  if (!playerIds || playerIds.length === 0) return [];
  
  const players = await databases.listDocuments(
    DATABASE_ID,
    'college_players',
    [sdk.Query.equal('$id', playerIds)]
  );
  
  return players.documents.map(p => p.name);
}
