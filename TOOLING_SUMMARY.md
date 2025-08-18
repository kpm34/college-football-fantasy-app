# Tooling Summary (MCP + Appwrite)

- Appwrite MCP server is configured in `~/.cursor/mcp.json` using `uvx mcp-server-appwrite --users`.
- Do not store `APPWRITE_API_KEY` in files. Provide via shell environment.
- Reference example (no secrets) lives in `docs/MCP_CONFIG.json`.
- Use MCP for dev-time admin tasks (users, sessions, MFA, logs). Use SDK/REST for runtime.

Quick example config:
```json
{
  "mcpServers": {
    "appwrite": {
      "command": "uvx",
      "args": ["mcp-server-appwrite", "--users"],
      "env": {
        "APPWRITE_ENDPOINT": "https://nyc.cloud.appwrite.io/v1",
        "APPWRITE_PROJECT_ID": "college-football-fantasy-app",
        "APPWRITE_DATABASE_ID": "college-football-fantasy"
      },
      "envFile": "/Users/kashyapmaheshwari/college-football-fantasy-app/.env.local"
    }
  }
}
```

Common actions to ask the assistant:
- List recent users and email verification status
- Create a user and issue a JWT
- Invalidate all sessions for a user
- Generate and fetch MFA recovery codes
