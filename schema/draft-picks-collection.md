# Draft Picks Collection (Manual Documentation)

## Collection Details

- **Collection Name**: Draft Picks
- **Collection ID**: `draft_picks`
- **Database**: college-football-fantasy

## Attributes (from screenshot)

| Field              | Type     | Required | Size | Notes                  |
| ------------------ | -------- | -------- | ---- | ---------------------- |
| `$id`              | string   | -        | 64   | System field           |
| `leagueId`         | string   | ✅       | 64   | Links to league        |
| `draftId`          | string   | ✅       | 64   | Links to draft         |
| `playerId`         | string   | ✅       | 64   | Links to player        |
| `authUserId`       | string   | ✅       | 64   | User who made the pick |
| `fantasyTeamId`    | string   | ❌       | 64   | Links to fantasy team  |
| `round`            | integer  | ✅       | -    | Draft round number     |
| `pick`             | integer  | ✅       | -    | Pick number in round   |
| `overallPick`      | integer  | ✅       | -    | Overall pick number    |
| `timestamp`        | datetime | ✅       | -    | When pick was made     |
| `playerName`       | string   | ✅       | 100  | Player's name          |
| `playerPosition`   | string   | ✅       | 10   | Position (QB, RB, etc) |
| `playerTeam`       | string   | ✅       | 50   | College team           |
| `playerConference` | string   | ❌       | 50   | Conference             |
| `teamName`         | string   | ✅       | 100  | Fantasy team name      |

## Why It's Not Showing in API

The `draft_picks` collection exists in the Appwrite Console but is not returned by the API. Possible reasons:

1. **Different Database**: It might be in a different database than `college-football-fantasy`
2. **Permissions**: The API key might not have read permissions for this collection
3. **Collection Status**: It might be disabled or in a different state
4. **Recent Creation**: It might have been created after our API key was generated

## Action Items

1. Check if there are multiple databases in Appwrite
2. Verify API key permissions include `databases.read` for all collections
3. Check collection permissions in Appwrite Console
4. Consider regenerating the API key with full permissions

## Temporary Solution

For now, we've manually added the `draft_picks` collection to our schema files based on the screenshot. This ensures our code can reference it correctly even though the API doesn't return it.
