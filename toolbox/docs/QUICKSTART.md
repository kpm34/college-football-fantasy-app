# Toolbox Quickstart

- Install with pnpm inside `toolbox/`
- Run `pnpm -w build`
- Use CLI: `node toolbox/packages/cli/bin/toolbox.js doctor`

## Appwrite MCP Integration (Cursor/Claude)

1) Configure `~/.cursor/mcp.json`:
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
      }
    }
  }
}
```
Provide `APPWRITE_API_KEY` via your shell environment. Do not commit secrets.

2) Ask the assistant to perform admin tasks (dev-time only):
- Create users, issue JWTs, rotate sessions, manage MFA, list logs/memberships.

3) Troubleshoot:
- Re-open Cursor if the server isn’t visible.
- Validate JSON in `~/.cursor/mcp.json`.
