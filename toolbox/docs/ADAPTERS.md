# Toolbox Adapters

Implement per-project mapping in your app repo if needed.

## Appwrite MCP Adapter Notes
- Use MCP for dev-time admin flows only (users, sessions, MFA).
- Application code should use the Appwrite SDK (server runtime) or REST (Edge), not MCP.
