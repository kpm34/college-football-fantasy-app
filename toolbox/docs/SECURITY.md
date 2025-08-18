# Toolbox Security

- No secrets committed.
- CLI never modifies .env; only reads presence.

## MCP Security Notes
- Never put `APPWRITE_API_KEY` in repo files or in `docs/MCP_CONFIG.json`.
- Prefer shell environment for secrets. If you include an `env` block in `~/.cursor/mcp.json`, keep the key value blank or placeholder and set the real value in your shell.
- Rotate any exposed keys immediately in Appwrite Console.
