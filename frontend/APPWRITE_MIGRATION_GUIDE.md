# 🔄 Appwrite Migration Guide: Moving to Kash Organization

## Overview

This guide will help you safely migrate your College Football Fantasy app from your current Appwrite project to the new "Kash" organization while ensuring all data remains secure and nothing is lost.

## 🎯 Migration Goals

- ✅ **Preserve all data** - No data loss during migration
- ✅ **Maintain functionality** - All features work after migration
- ✅ **Update credentials** - New project ID and API keys
- ✅ **Test thoroughly** - Verify everything works
- ✅ **Keep backup** - Old project as safety net

## 📋 Pre-Migration Checklist

### 1. Current Environment Assessment
```bash
# Check current Appwrite configuration
get_current_appwrite_info

# Check migration readiness
check_migration_readiness
```

### 2. Data Backup
```bash
# Create comprehensive backup
generate_migration_scripts scriptType="backup"

# Export all data
generate_migration_scripts scriptType="export"
```

## 🚀 Step-by-Step Migration Process

### Step 1: Create New Project in Kash Organization

1. **Go to Appwrite Console**
   - Visit: https://cloud.appwrite.io/console
   - Navigate to your "Kash" organization

2. **Create New Project**
   - Click "Create Project"
   - Name: `college-football-fantasy-app`
   - Description: `College Football Fantasy App - Power 4 Conferences`

3. **Generate API Key**
   - Go to Project Settings → API Keys
   - Create new API key with full access
   - Copy the Project ID and API Key

### Step 2: Set Up Database Structure

```bash
# Generate setup script
generate_migration_scripts scriptType="setup"
```

**Manual Setup (if needed):**

1. **Create Database**
   - Database ID: `fantasy_football_db`
   - Name: `Fantasy Football Database`

2. **Create Collections**
   - `games` - Game data and scores
   - `rankings` - AP Top 25 rankings
   - `teams` - Power 4 team information
   - `players` - Player data and stats
   - `leagues` - User leagues
   - `rosters` - Team rosters
   - `lineups` - Weekly lineups

### Step 3: Export Data from Current Project

```bash
#!/bin/bash
# Export script for College Football Fantasy App data
echo "📤 Exporting data from current project..."

CURRENT_PROJECT_ID="${process.env.APPWRITE_PROJECT_ID}"
EXPORT_DIR="./data-export-$(date +%Y%m%d-%H%M%S)"

mkdir -p $EXPORT_DIR

# Export specific collections
collections=("games" "rankings" "teams" "players" "leagues" "rosters" "lineups")

for collection in "${collections[@]}"; do
  echo "Exporting collection: $collection"
  curl -X GET "https://cloud.appwrite.io/v1/databases/$CURRENT_PROJECT_ID/collections/$collection/documents" \
    -H "X-Appwrite-Project: $CURRENT_PROJECT_ID" \
    -H "X-Appwrite-Key: ${process.env.APPWRITE_API_KEY}" \
    -o "$EXPORT_DIR/$collection.json"
done

echo "✅ Export completed: $EXPORT_DIR"
```

### Step 4: Import Data to New Project

```bash
#!/bin/bash
# Import script for College Football Fantasy App data
echo "📥 Importing data to new Kash project..."

NEW_PROJECT_ID="YOUR_NEW_PROJECT_ID"
NEW_API_KEY="YOUR_NEW_API_KEY"
IMPORT_DIR="./data-export-$(date +%Y%m%d-%H%M%S)"

# Import collections
collections=("games" "rankings" "teams" "players" "leagues" "rosters" "lineups")

for collection in "${collections[@]}"; do
  echo "Importing collection: $collection"
  if [ -f "$IMPORT_DIR/$collection.json" ]; then
    # Create collection first
    curl -X POST "https://cloud.appwrite.io/v1/databases/$NEW_PROJECT_ID/collections" \
      -H "X-Appwrite-Project: $NEW_PROJECT_ID" \
      -H "X-Appwrite-Key: $NEW_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "collectionId": "'$collection'",
        "name": "'$collection'",
        "permissions": ["read(\"*\")", "write(\"*\")"]
      }'
    
    # Import documents
    jq -c '.documents[]' "$IMPORT_DIR/$collection.json" | while read -r document; do
      curl -X POST "https://cloud.appwrite.io/v1/databases/$NEW_PROJECT_ID/collections/$collection/documents" \
        -H "X-Appwrite-Project: $NEW_PROJECT_ID" \
        -H "X-Appwrite-Key: $NEW_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$document"
    done
  fi
done

echo "✅ Import completed"
```

### Step 5: Update Environment Variables

Use the MCP tool to generate updated environment variables:

```bash
update_env_variables newProjectId="YOUR_NEW_PROJECT_ID" newApiKey="YOUR_NEW_API_KEY"
```

**New Environment Variables:**
```env
# Appwrite Configuration for Kash Organization
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=YOUR_NEW_PROJECT_ID
APPWRITE_API_KEY=YOUR_NEW_API_KEY
APPWRITE_DATABASE_ID=fantasy_football_db

# Vercel Configuration
VERCEL_URL=https://college-football-fantasy-app.vercel.app
VERCEL_ENV=production

# AI Gateway (if using)
AI_GATEWAY_API_KEY=your_ai_gateway_key_here

# Other configurations
NODE_ENV=production
NEXT_PUBLIC_VERCEL_URL=https://college-football-fantasy-app.vercel.app
```

### Step 6: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `college-football-fantasy-app`

2. **Update Environment Variables**
   - Go to Settings → Environment Variables
   - Update the following variables:
     - `APPWRITE_PROJECT_ID` → New Project ID
     - `APPWRITE_API_KEY` → New API Key
     - `APPWRITE_DATABASE_ID` → `fantasy_football_db`

3. **Redeploy**
   - Trigger a new deployment to apply changes

### Step 7: Test All Functionality

```bash
# Test new project
generate_migration_scripts scriptType="test"

# Monitor website features
monitor_page_features features=["team-colors", "conference-showcase", "draft-system"]

# Check website status
get_website_status
```

**Test Checklist:**
- ✅ **Team Colors**: Verify team colors display correctly
- ✅ **Conference Showcase**: Check conference pages load
- ✅ **API Endpoints**: Test all API routes work
- ✅ **Database Connection**: Verify data is accessible
- ✅ **Draft System**: Test draft functionality
- ✅ **Auction System**: Test auction functionality

### Step 8: Verify Data Integrity

```bash
# Compare versions
compare_versions

# Get website snapshot
get_website_snapshot includeHtml=true
```

## 🔒 Safety Measures

### 1. Backup Strategy
- **Before Migration**: Full backup of current project
- **During Migration**: Keep old project as backup
- **After Migration**: Verify all data transferred correctly

### 2. Rollback Plan
If issues occur:
1. Revert environment variables to old project
2. Trigger new Vercel deployment
3. Verify old project still works
4. Debug issues before retrying migration

### 3. Testing Strategy
- **Staging Test**: Test with new project before switching
- **Feature Testing**: Verify all features work
- **Data Validation**: Ensure no data loss
- **Performance Check**: Verify performance is maintained

## 📊 Migration Monitoring

### Real-Time Monitoring
```bash
# Monitor migration progress
get_website_status

# Check feature status
monitor_page_features

# Verify data integrity
get_current_appwrite_info
```

### Success Indicators
- ✅ Website loads without errors
- ✅ All API endpoints return data
- ✅ Team colors display correctly
- ✅ Conference showcase works
- ✅ Draft and auction systems function
- ✅ No console errors
- ✅ Performance maintained

## 🚨 Troubleshooting

### Common Issues

1. **API Key Issues**
   ```bash
   # Check API key permissions
   curl -X GET "https://cloud.appwrite.io/v1/databases" \
     -H "X-Appwrite-Project: YOUR_NEW_PROJECT_ID" \
     -H "X-Appwrite-Key: YOUR_NEW_API_KEY"
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   curl -X GET "https://cloud.appwrite.io/v1/databases/fantasy_football_db/collections" \
     -H "X-Appwrite-Project: YOUR_NEW_PROJECT_ID" \
     -H "X-Appwrite-Key: YOUR_NEW_API_KEY"
   ```

3. **Environment Variable Issues**
   - Check Vercel environment variables are updated
   - Verify deployment completed successfully
   - Clear browser cache and test again

### Rollback Procedure
```bash
# Revert to old project
# Update environment variables back to old project
# Redeploy to Vercel
# Test functionality
# Debug issues before retrying
```

## ✅ Post-Migration Checklist

- [ ] **Data Verification**: All data transferred correctly
- [ ] **Feature Testing**: All features work as expected
- [ ] **Performance Check**: No performance degradation
- [ ] **Error Monitoring**: No new errors in console
- [ ] **User Experience**: Website functions normally
- [ ] **Backup Confirmation**: Old project archived safely

## 📈 Next Steps

After successful migration:

1. **Monitor Performance**: Watch for any performance issues
2. **Update Documentation**: Update any references to old project
3. **Archive Old Project**: Keep as backup for 30 days
4. **Update Team**: Inform team of new project credentials
5. **Plan Future Migrations**: Document process for future use

---

This migration guide ensures a safe, thorough, and well-tested transition to your new Kash organization while preserving all your College Football Fantasy app data and functionality. 