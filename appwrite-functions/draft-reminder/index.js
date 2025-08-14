const sdk = require('node-appwrite');

// Initialize Appwrite SDK
const client = new sdk.Client();
const databases = new sdk.Databases(client);
const messaging = new sdk.Messaging(client);
const users = new sdk.Users(client);

client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

const DATABASE_ID = process.env.DATABASE_ID;

module.exports = async function (req, res) {
  try {
    // This function can be triggered by:
    // 1. A scheduled cron job (1 hour before drafts)
    // 2. Manual trigger with leagueId
    
    const { leagueId } = req.payload || {};
    
    let leagues = [];
    
    if (leagueId) {
      // Specific league reminder
      const league = await databases.getDocument(
        DATABASE_ID,
        'leagues',
        leagueId
      );
      leagues = [league];
    } else {
      // Check all leagues with upcoming drafts (within 1 hour)
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        'leagues',
        [
          sdk.Query.equal('status', 'open'),
          sdk.Query.notEqual('draftDate', null),
          sdk.Query.greaterThan('draftDate', now.toISOString()),
          sdk.Query.lessThanEqual('draftDate', oneHourFromNow.toISOString())
        ]
      );
      leagues = response.documents;
    }
    
    console.log(`Found ${leagues.length} leagues with upcoming drafts`);
    
    // Send reminders for each league
    const notifications = [];
    
    for (const league of leagues) {
      // Get all members of the league
      const rosters = await databases.listDocuments(
        DATABASE_ID,
        'rosters',
        [sdk.Query.equal('leagueId', league.$id)]
      );
      
      for (const roster of rosters.documents) {
        try {
          // Get user details
          const user = await users.get(roster.userId);
          
          if (user.email) {
            // Calculate time until draft
            const draftTime = new Date(league.draftDate);
            const timeDiff = draftTime - new Date();
            const minutesUntil = Math.floor(timeDiff / 1000 / 60);
            
            let timeUntil = '';
            if (minutesUntil >= 60) {
              timeUntil = `${Math.floor(minutesUntil / 60)} hour${Math.floor(minutesUntil / 60) > 1 ? 's' : ''}`;
            } else {
              timeUntil = `${minutesUntil} minute${minutesUntil > 1 ? 's' : ''}`;
            }
            
            // Create notification data
            const notification = {
              to: user.email,
              subject: `Your CFB Fantasy Draft Starts Soon!`,
              content: `Hi ${user.name || user.email},\n\n` +
                       `Your draft for ${league.name} starts in ${timeUntil}!\n\n` +
                       `Join here: https://cfbfantasy.app/draft/${league.$id}\n\n` +
                       `Good luck!\n` +
                       `CFB Fantasy Team`,
              html: `<h2>Draft Reminder</h2>` +
                    `<p>Hi ${user.name || user.email},</p>` +
                    `<p>Your draft for <strong>${league.name}</strong> starts in <strong>${timeUntil}</strong>!</p>` +
                    `<p><a href="https://cfbfantasy.app/draft/${league.$id}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Draft</a></p>` +
                    `<p>Good luck!<br>CFB Fantasy Team</p>`
            };
            
            notifications.push(notification);
            console.log(`Queued reminder for ${user.email} - League: ${league.name}`);
          }
        } catch (error) {
          console.error(`Error processing user ${roster.userId}:`, error);
        }
      }
    }
    
    // Send all notifications
    // Note: In production, you'd use Appwrite Messaging or an email service
    console.log(`Prepared ${notifications.length} draft reminders`);
    
    // Store notifications in a collection for processing
    // or integrate with your email service here
    
    return res.json({
      success: true,
      message: `Processed ${leagues.length} leagues, prepared ${notifications.length} reminders`,
      notifications: notifications.map(n => ({ to: n.to, subject: n.subject }))
    });
    
  } catch (error) {
    console.error('Draft reminder error:', error);
    return res.json({
      success: false,
      error: error.message
    }, 500);
  }
};
