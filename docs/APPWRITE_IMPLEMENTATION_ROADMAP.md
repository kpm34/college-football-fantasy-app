# 🚀 Appwrite Implementation Roadmap

## 🎯 Quick Impact Features (Do This Week!)

### 1. Enable Realtime Draft Updates (2-3 hours)
**Impact**: Transform draft experience with live updates

#### Step 1: Update Draft Room Component
```typescript
// app/draft/[leagueId]/draft-room/page.tsx
import { useEffect, useState } from 'react';
import { client, REALTIME_CHANNELS, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export default function DraftRoom() {
  const [draftPicks, setDraftPicks] = useState([]);
  const [currentPick, setCurrentPick] = useState(null);

  useEffect(() => {
    // Subscribe to draft picks
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
      (response) => {
        console.log('Realtime update:', response);
        
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          // New pick made
          const newPick = response.payload;
          setDraftPicks(prev => [...prev, newPick]);
          
          // Show notification
          if (newPick.userId !== currentUserId) {
            showNotification(`${newPick.teamName} selected ${newPick.playerName}!`);
          }
          
          // Update current pick
          setCurrentPick(prev => ({
            round: prev.round,
            pick: prev.pick + 1
          }));
        }
      }
    );

    return () => unsubscribe();
  }, [leagueId]);

  // Make a pick (will trigger realtime for all users)
  const makePick = async (playerId) => {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_PICKS,
      ID.unique(),
      {
        leagueId,
        teamId: currentTeamId,
        playerId,
        round: currentPick.round,
        pick: currentPick.pick,
        timestamp: new Date().toISOString()
      }
    );
  };
}
```

#### Step 2: Add Sound Effects
```typescript
// lib/draft-sounds.ts
export const playDraftSound = () => {
  const audio = new Audio('/sounds/draft-pick.mp3');
  audio.play().catch(e => console.log('Audio play failed:', e));
};

export const playYourTurnSound = () => {
  const audio = new Audio('/sounds/your-turn.mp3');
  audio.play().catch(e => console.log('Audio play failed:', e));
};
```

#### Step 3: Update Draft Board
```typescript
// components/draft/DraftBoard.tsx
useEffect(() => {
  const unsubscribe = client.subscribe(
    [`databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`,
     `databases.${DATABASE_ID}.collections.${COLLECTIONS.PLAYERS}.documents`],
    (response) => {
      // Update board in real-time
      refetchDraftData();
    }
  );
  
  return () => unsubscribe();
}, []);
```

### 2. Add Team Logo Storage (3-4 hours)
**Impact**: Visual customization increases engagement

#### Step 1: Create Storage Bucket (Appwrite Console)
```javascript
// Or via API/SDK
const storage = new Storage(client);
await storage.createBucket(
  'team-logos',
  'Team Logos',
  [Permission.read(Role.any())],
  true,
  5000000, // 5MB max
  ['image/png', 'image/jpeg', 'image/webp'],
  undefined,
  true,
  true
);
```

#### Step 2: Add Upload Component
```typescript
// components/TeamLogoUpload.tsx
import { storage } from '@/lib/appwrite';
import { ID } from 'appwrite';

export function TeamLogoUpload({ teamId, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Delete old logo if exists
      if (currentLogoId) {
        await storage.deleteFile('team-logos', currentLogoId);
      }

      // Upload new logo
      const response = await storage.createFile(
        'team-logos',
        ID.unique(),
        file
      );

      // Update team with logo ID
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        teamId,
        { logoId: response.$id }
      );

      // Get preview URL
      const logoUrl = storage.getFilePreview(
        'team-logos',
        response.$id,
        200, // width
        200, // height
        'center', // gravity
        100 // quality
      );

      onUpload(logoUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="logo-upload"
      />
      <label
        htmlFor="logo-upload"
        className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        {uploading ? 'Uploading...' : 'Upload Team Logo'}
      </label>
    </div>
  );
}
```

#### Step 3: Display Logos
```typescript
// components/TeamCard.tsx
export function TeamCard({ team }) {
  const logoUrl = team.logoId 
    ? storage.getFilePreview('team-logos', team.logoId, 100, 100)
    : '/default-team-logo.png';

  return (
    <div className="team-card">
      <img 
        src={logoUrl} 
        alt={`${team.name} logo`}
        className="w-20 h-20 rounded-full"
      />
      <h3>{team.name}</h3>
    </div>
  );
}
```

### 3. Email Notifications (4-5 hours)
**Impact**: Keep users engaged between sessions

#### Step 1: Configure Email Provider (Appwrite Console)
```
1. Go to Messaging → Providers
2. Add SendGrid/Mailgun/SMTP
3. Configure with your credentials
```

#### Step 2: Create Notification Function
```typescript
// app/api/notifications/send/route.ts
import { Client, Messaging, ID } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const messaging = new Messaging(client);

export async function POST(request: Request) {
  const { type, userId, data } = await request.json();

  // Get user email
  const user = await users.get(userId);
  
  switch (type) {
    case 'draft-reminder':
      await messaging.createEmail(
        ID.unique(),
        'Your Draft Starts in 1 Hour! 🏈',
        `Don't miss your draft at ${data.draftTime}`,
        [], // topics
        [user.email], // users
        [], // targets
        undefined, // cc
        undefined, // bcc
        undefined, // attachments
        false, // draft
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #5E2B8A;">Draft Starting Soon!</h1>
          <p>Your fantasy draft for <strong>${data.leagueName}</strong> starts in 1 hour.</p>
          <a href="${data.draftLink}" style="display: inline-block; background: #5E2B8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Draft Room</a>
        </div>
        `
      );
      break;

    case 'trade-offer':
      await messaging.createEmail(
        ID.unique(),
        'New Trade Offer! 💱',
        `You have a new trade offer in ${data.leagueName}`,
        [],
        [user.email],
        [],
        undefined,
        undefined,
        undefined,
        false,
        `
        <div style="font-family: Arial, sans-serif;">
          <h2>Trade Offer from ${data.fromTeam}</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>You Get:</strong> ${data.playersReceived.join(', ')}</p>
            <p><strong>You Give:</strong> ${data.playersGiven.join(', ')}</p>
          </div>
          <a href="${data.tradeLink}" style="display: inline-block; margin-top: 20px; background: #5E2B8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Trade</a>
        </div>
        `
      );
      break;
  }

  return Response.json({ success: true });
}
```

#### Step 3: Create Email Topics
```typescript
// scripts/setup-email-topics.js
const messaging = new Messaging(client);

// Create topics for different notification types
await messaging.createTopic(
  ID.unique(),
  'draft-reminders',
  'Draft Reminders'
);

await messaging.createTopic(
  ID.unique(),
  'trade-notifications',
  'Trade Notifications'
);

await messaging.createTopic(
  ID.unique(),
  'weekly-updates',
  'Weekly Updates'
);

// Subscribe users to topics
await messaging.createSubscriber(
  'draft-reminders',
  userId,
  targetId
);
```

## 📅 Week 2: Core Enhancements

### 4. Convert Cron Jobs to Appwrite Functions
**Impact**: Better reliability and scalability

#### Create Weekly Scoring Function
```javascript
// functions/weekly-scoring/index.js
const { Client, Databases, Query } = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    log('Starting weekly scoring calculation...');
    
    // Get current week
    const currentWeek = await getCurrentWeek();
    
    // Get all leagues
    const leagues = await databases.listDocuments(
      DATABASE_ID,
      'leagues',
      [Query.equal('status', 'active')]
    );

    for (const league of leagues.documents) {
      await processLeagueScoring(league, currentWeek);
    }

    return res.json({
      success: true,
      message: `Processed ${leagues.total} leagues for week ${currentWeek}`
    });
  } catch (e) {
    error('Weekly scoring failed: ' + e.message);
    return res.json({ success: false, error: e.message }, 500);
  }
};
```

#### Schedule Function (Appwrite Console)
```
1. Functions → Create Function
2. Name: weekly-scoring
3. Runtime: Node.js 18
4. Schedule: 0 6 * * 2 (Every Tuesday at 6 AM)
5. Deploy the function
```

### 5. Implement Document-Level Security
**Impact**: Better data protection

```typescript
// When creating team rosters
await databases.createDocument(
  DATABASE_ID,
  COLLECTIONS.ROSTERS,
  ID.unique(),
  rosterData,
  [
    Permission.read(Role.users()), // All users can read
    Permission.update(Role.user(ownerId)), // Only owner can update
    Permission.update(Role.team('league-admins', 'commissioner')), // Commissioners can update
    Permission.delete(Role.user(ownerId)) // Only owner can delete
  ]
);
```

## 📊 Week 3: Advanced Features

### 6. Live Scoring with Realtime
```typescript
// app/scoreboard/page.tsx
useEffect(() => {
  // Subscribe to game updates
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.games.documents`,
    (response) => {
      if (response.payload.status === 'in_progress') {
        updateLiveScores(response.payload);
      }
    }
  );

  return () => unsubscribe();
}, []);
```

### 7. Auction Draft with Realtime Bidding
```typescript
// Subscribe to bids
client.subscribe(
  `databases.${DATABASE_ID}.collections.auction_bids.documents`,
  (response) => {
    const bid = response.payload;
    setCurrentBid(bid.amount);
    setHighBidder(bid.teamName);
    resetTimer(10); // 10 second timer
  }
);
```

## 🔧 Utility Scripts

### Migrate to Appwrite Functions
```bash
# scripts/migrate-to-functions.sh
#!/bin/bash

# Create functions
appwrite functions create \
  --functionId=weekly-scoring \
  --name="Weekly Scoring" \
  --runtime="node-18.0"

appwrite functions create \
  --functionId=trade-processor \
  --name="Trade Processor" \
  --runtime="node-18.0"

# Deploy
appwrite deploy function
```

### Setup Storage Buckets
```javascript
// scripts/setup-storage.js
const storage = new Storage(client);

const buckets = [
  { id: 'team-logos', name: 'Team Logos', maxSize: 5000000 },
  { id: 'league-trophies', name: 'League Trophies', maxSize: 10000000 },
  { id: 'user-avatars', name: 'User Avatars', maxSize: 2000000 },
  { id: 'draft-exports', name: 'Draft Exports', maxSize: 50000000 }
];

for (const bucket of buckets) {
  await storage.createBucket(
    bucket.id,
    bucket.name,
    [Permission.read(Role.any())],
    true,
    bucket.maxSize,
    ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    undefined,
    true,
    true
  );
  console.log(`Created bucket: ${bucket.name}`);
}
```

## 🎯 Success Metrics

### Week 1 Goals
- [ ] Realtime draft working
- [ ] Team logos uploading
- [ ] First email sent

### Week 2 Goals
- [ ] Functions deployed
- [ ] Security enhanced
- [ ] Scoring automated

### Week 3 Goals
- [ ] Live scoring active
- [ ] Auction draft working
- [ ] Full realtime integration

## 🆘 Common Issues & Solutions

### Realtime Not Working
```typescript
// Check if client is properly initialized
console.log('Subscribed channels:', client.channels);

// Ensure proper permissions on collection
await databases.updateCollection(
  DATABASE_ID,
  collectionId,
  name,
  [Permission.read(Role.any())] // Allow realtime subscriptions
);
```

### Storage CORS Issues
```javascript
// Add your domain to allowed origins in Appwrite Console
// Project Settings → Platforms → Add Web Platform
```

### Function Timeouts
```javascript
// Increase timeout in function settings
// Maximum: 900 seconds (15 minutes)
```

## 🚀 Next Steps

1. **Today**: Enable realtime for draft picks
2. **Tomorrow**: Set up team logo storage  
3. **This Week**: Configure email notifications
4. **Next Week**: Migrate cron jobs to functions

Remember: Each feature you implement makes the app more engaging and professional! 🏈
