# 🤖 Claude Code Toolbox - MCP Integration Guide

## Quick Setup

### 1. Configure MCP in Cursor
Create or update `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "appwrite": {
      "command": "/Users/kashyapmaheshwari/.local/bin/uvx",
      "args": ["mcp-server-appwrite", "--users"],
      "env": {
        "APPWRITE_ENDPOINT": "https://nyc.cloud.appwrite.io/v1",
        "APPWRITE_PROJECT_ID": "college-football-fantasy-app",
        "APPWRITE_DATABASE_ID": "college-football-fantasy",
        "APPWRITE_API_KEY": ""
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/kashyapmaheshwari/college-football-fantasy-app"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "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"
      }
    }
  }
}
```

### 2. Environment Setup
The `APPWRITE_API_KEY` is loaded from `.env.local` automatically.

### 3. Restart Cursor
After updating MCP configuration, restart Cursor for changes to take effect.

## 🛠️ Available MCP Tools

### Appwrite Operations
- **Users**: Create, read, update, delete users
- **Sessions**: Issue JWTs, manage sessions, invalidate tokens
- **MFA**: Enable/disable, generate recovery codes
- **Logs**: View activity logs and memberships
- **Messaging**: Manage email/SMS/push targets

### File System Operations
- Read/write files within project directory
- List directory contents
- Search for files by pattern
- Create/delete files and directories

### GitHub Operations
- List/create issues and pull requests
- View workflow runs and logs
- Manage repository settings
- Check commit history

### Memory Operations
- Store persistent data across sessions
- Retrieve stored information
- Useful for context retention

## 📝 Common MCP Commands

### User Management
```javascript
// Create user with JWT
"Create a user test@example.com with password Temp123! and return a JWT"

// List users
"List 20 most recent users and show email verification status"

// Session management
"Delete all active sessions for user {id}"

// MFA operations
"Enable MFA for user {id} and generate recovery codes"
```

### Database Operations
```javascript
// List collections
"Show all collections in the college-football-fantasy database"

// Query documents
"List all leagues with status 'active'"

// Create document
"Create a new league with name 'Test League' and 12 teams"

// Update document
"Update league {id} to set draft status to 'completed'"
```

### File Operations
```javascript
// Read files
"Read the contents of app/api/leagues/create/route.ts"

// Search code
"Find all files that import from lib/appwrite"

// Edit files
"Update the import path in components/League.tsx"

// Create files
"Create a new API route at app/api/test/route.ts"
```

### GitHub Operations
```javascript
// Check workflows
"Show recent GitHub workflow runs"

// View issues
"List open issues in the repository"

// Check PRs
"Show pull requests awaiting review"
```

## 🚀 Project-Specific Commands

### Appwrite Database
- **Endpoint**: `https://nyc.cloud.appwrite.io/v1`
- **Project ID**: `college-football-fantasy-app`
- **Database ID**: `college-football-fantasy`

### Collections Available
- `leagues` - Fantasy leagues
- `rosters` - Team rosters
- `college_players` - Player database
- `player_stats` - Weekly stats
- `games` - Game schedule/scores
- `rankings` - AP Top 25
- `auctions` - Auction drafts
- `bids` - Auction bid history
- `lineups` - Weekly lineups
- `users` - User accounts
- `activity_log` - User activities

### Common Tasks
```javascript
// Draft operations
"Show all players available for draft with position QB"

// League management
"Create a new league with snake draft and 12 teams"

// Data sync
"Check the latest game scores from the games collection"

// User operations
"Create a test user for development"
```

## ⚙️ Configuration Files

### Project MCP Config
Location: `/Users/kashyapmaheshwari/college-football-fantasy-app/.mcp.json`

### Required Environment Variables
In `.env.local`:
```bash
APPWRITE_API_KEY=standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891
```

## 🔧 Troubleshooting

### MCP Server Not Visible
1. Restart Cursor completely
2. Check `~/.cursor/mcp.json` formatting
3. Verify uvx is installed: `which uvx`
4. Test connection: `curl https://nyc.cloud.appwrite.io/v1/health`

### Appwrite Operations Failing
1. Check API key in `.env.local`
2. Verify project ID and database ID
3. Ensure collections exist in Appwrite console
4. Check network connectivity

### File Operations Limited
- MCP filesystem only works within allowed directories
- Default is project root: `/Users/kashyapmaheshwari/college-football-fantasy-app`

## 🎯 Best Practices

### Development Workflow
1. Use MCP for admin operations during development
2. Use SDK/API for production code
3. Never commit API keys
4. Rotate keys if exposed

### When to Use MCP
✅ Creating test users  
✅ Debugging database issues  
✅ Managing sessions during testing  
✅ Quick data operations  
✅ File system operations  

### When NOT to Use MCP
❌ Production runtime operations  
❌ High-frequency operations  
❌ Sensitive production data  
❌ Automated workflows  

## 📚 Additional Resources

### Documentation
- [MCP Protocol Docs](https://modelcontextprotocol.com)
- [Appwrite Docs](https://appwrite.io/docs)
- [Cursor MCP Setup](https://docs.cursor.com/mcp)

### Project Files
- Schema: `schema/zod-schema.ts`
- Types: `types/database.types.ts`
- API Routes: `app/api/`
- Components: `components/`

---

**Note**: This toolbox is for Claude Code integration in Cursor. For regular Cursor AI features, see `TOOLBOX_CURSOR.md`
