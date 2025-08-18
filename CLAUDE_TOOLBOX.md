# Claude Toolbox – Appwrite MCP Usage

This guide standardizes how to configure and use Appwrite via MCP in Cursor/Claude.

## Setup
1. Install uv (provides `uvx`).
2. Create `~/.cursor/mcp.json` entry:
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
- Provide `APPWRITE_API_KEY` via your shell environment. Do not store secrets in files.

## What the tool can do
- Users: create, read, update, delete; issue JWTs; manage sessions; MFA setup and recovery codes.
- Memberships and logs: list memberships, list activity logs.
- Messaging targets: manage email/SMS/push targets.

## Common requests you can make
- “Create a user test@example.com with password Temp123! and return a JWT.”
- “List 20 most recent users and whether email is verified.”
- “Delete all active sessions for user {id}.”
- “Enable MFA for user {id}, generate recovery codes, and show them.”

## Guardrails
- Dev-time only. Use Appwrite SDK in app code; use MCP for admin ops/testing.
- Never commit keys. Rotate leaked keys immediately.

## Troubleshooting
- If not visible in tools, re-open Cursor and validate JSON in `~/.cursor/mcp.json`.
- Verify endpoint health: `curl https://nyc.cloud.appwrite.io/v1/health`.

