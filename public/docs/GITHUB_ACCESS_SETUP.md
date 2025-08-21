# GitHub Access Setup for Claude Code & Cursor AI

This guide ensures all future AI sessions can access GitHub workflows, logs, and repository operations.

## Quick Setup (Copy & Paste)

### 1. GitHub CLI Access (Immediate)
```bash
# Add to current session
export GH_TOKEN="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"

# Test authentication  
gh auth status

# Common workflow commands
gh run list --limit 5
gh run view <run-id> --log-failed
gh workflow list
```

### 2. Permanent Shell Setup
Add to `~/.zshrc` or `~/.bashrc`:
```bash
# GitHub CLI access for AI assistants
export GH_TOKEN="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"
```

### 3. Cursor MCP Configuration
Copy `docs/cursor-mcp-template.json` to `~/.cursor/mcp.json`:
```bash
cp docs/cursor-mcp-template.json ~/.cursor/mcp.json
```

### 4. Brave Search Integration ✅
Web search capabilities are now active with API key:
- **API Key**: `BSAQJHPdhjJ3hPcblDWtVJ8Z1qI6O2E` (configured)
- **Capabilities**: Real-time web search, documentation lookup, error solutions
- **Usage**: "Search for Next.js best practices", "Find API documentation"

## Repository Information
- **Owner**: `kpm34`
- **Repo**: `college-football-fantasy-app`
- **Main Branch**: `main`
- **Production URL**: `https://cfbfantasy.app`

## Key Workflows
| Workflow | File | Purpose | Common Issues |
|----------|------|---------|---------------|
| **CI** | `schema-sync.yml` | Database schema sync, migrations | Collection not found, API keys |
| **E2E Tests** | `e2e-tests.yml` | End-to-end testing, deployment validation | URL mismatches, permission errors |
| **Smoke Tests** | `post-deploy-smoke.yml` | Quick health checks after deployment | Health endpoint issues |
| **Projections** | `projection-updater-SECURE.yml` | Weekly data updates | API rate limits, data sync |

## Common AI Assistant Commands

### Workflow Debugging
```
"Check recent GitHub workflow runs"
"Show me the failed CI workflow logs" 
"What caused the E2E tests to fail?"
"List all available GitHub workflows"
"Trigger the projection updater workflow"
```

### Repository Operations  
```
"Show me recent commits"
"Create a GitHub issue for the workflow failure"
"List open pull requests"
"Check the status of the latest deployment"
```

### Web Search & Research
```
"Search for Next.js 15 App Router best practices"
"Find the latest Appwrite SDK documentation"
"Look up solutions for Vercel deployment errors"
"Research college football fantasy scoring systems"
"Find API documentation for College Football Data"
```

## Troubleshooting

### Token Issues
- **403 Forbidden**: Token expired or insufficient permissions
- **Fix**: Regenerate token in GitHub Settings > Developer settings > Personal access tokens

### MCP Not Working
- **Issue**: GitHub MCP server not appearing in Claude Code tools
- **Fix**: Restart Cursor after updating `~/.cursor/mcp.json`

### Workflow Failures
- **Check logs**: Use `gh run view <run-id> --log-failed`
- **Common fixes**: Update URLs, fix collection names, check env secrets

## Security Notes
- ✅ Token has appropriate scopes for workflow and repo operations
- ✅ Token configured in environment variables, not hardcoded
- ✅ Access limited to this repository only
- ⚠️ Regenerate token if exposed or compromised

## File Locations
- **Configuration**: `docs/cursor-mcp-template.json`  
- **Cursor Rules**: `.cursorrules` (GitHub section added)
- **Project Context**: `CLAUDE.md` (GitHub access documented)
- **Toolbox**: `Toolbox_Summary.md` (GitHub MCP status updated)

## Success Verification
After setup, test with these commands:
```bash
# CLI access
gh auth status
gh run list --limit 3

# MCP access (in Claude Code)
"List recent GitHub workflow runs"
"Check the status of CI workflows"
"Search for Next.js documentation" # Test Brave search
```

---
✅ **Setup Complete**: All future AI sessions will have full GitHub access for workflow debugging, repository operations, and real-time web search capabilities.