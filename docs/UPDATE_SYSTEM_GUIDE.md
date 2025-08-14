# Documentation Update System Guide

## Overview

This system helps maintain up-to-date project documentation by tracking major edits and reminding you to update key documents.

## Key Documents

1. **PROJECT_UPDATE_TRACKER.md** - Tracks edits and schedules
2. **PROJECT_SUMMARY.md** - High-level project overview (update every 4 edits)
3. **DATA_FLOW.md** - Technical architecture (update every 30 minutes)

## How It Works

### 1. Tracking Major Edits
When you complete a significant feature or fix:
```bash
npm run update:track "Description of what you did"
```

Examples:
```bash
npm run update:track "Added PWA support with offline caching"
npm run update:track "Integrated Rotowire API for player news"
npm run update:track "Implemented AI draft assistant with Claude"
```

### 2. Checking Update Status
Check if any documentation needs updating:
```bash
npm run update:check
```

This shows:
- Current edit count (X/4)
- Time since last data flow update
- Recent major edits
- Active integrations
- Next update times

### 3. Updating Project Summary
After 4 major edits:
```bash
npm run update:summary
```

This resets the counter. You should then manually update `PROJECT_SUMMARY.md` with:
- The 4 recent major edits
- Updated metrics
- New features completed
- Changed priorities

### 4. Updating Data Flow
Every 30 minutes during active development:
```bash
npm run update:dataflow
```

This updates timestamps. You should then review `DATA_FLOW.md` for:
- New API routes
- Database schema changes
- Updated data flow diagrams
- New caching strategies

## What Counts as a Major Edit?

### ✅ Major Edits Include:
- New features (PWA, AI integration, etc.)
- Significant bug fixes affecting multiple files
- New integrations (APIs, services)
- Database schema changes
- Authentication/security updates
- Performance optimizations
- Major UI/UX updates

### ❌ NOT Major Edits:
- Small bug fixes (1-2 files)
- Documentation updates
- Dependency updates
- Code formatting
- Adding comments
- Small UI tweaks

## Reference Documents

When updating documentation, refer to:
- `/docs/INTEGRATIONS_COMPREHENSIVE_GUIDE.md` - All available integrations
- `/docs/IMPLEMENTATION_PRIORITIES_2025.md` - Roadmap and priorities
- `/docs/APPWRITE_COMPREHENSIVE_REVIEW.md` - Appwrite features
- `/docs/VERCEL_COMPREHENSIVE_REVIEW.md` - Vercel features
- `/docs/ZERO_ADDITIONAL_COST_STRATEGY.md` - Cost optimization

## Quick Reference

```bash
# Check status
npm run update:check

# Track a new edit
npm run update:track "Added feature X"

# Update project summary (after 4 edits)
npm run update:summary

# Update data flow (every 30 min)
npm run update:dataflow
```

## Automation Ideas

### VS Code Task
Add to `.vscode/tasks.json`:
```json
{
  "label": "Check Documentation Updates",
  "type": "shell",
  "command": "npm run update:check",
  "problemMatcher": [],
  "group": {
    "kind": "test",
    "isDefault": true
  }
}
```

### Git Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run update:check
```

### Cron Job (Local Development)
```bash
# Add to crontab
*/30 * * * * cd /path/to/project && npm run update:check
```

## Best Practices

1. **Track edits immediately** after completing them
2. **Review references** before updating documentation
3. **Include code examples** in DATA_FLOW.md updates
4. **Update metrics** in PROJECT_SUMMARY.md with real data
5. **Cross-reference** with implementation priorities

## Troubleshooting

### "Invalid Date" Error
Run `npm run update:dataflow` to fix timestamps

### Edit Count Wrong
Manually edit `PROJECT_UPDATE_TRACKER.md` and fix the counter

### Missing References
Ensure all reference documents exist in `/docs` directory

---

Remember: Good documentation helps future you and your team! 📚
