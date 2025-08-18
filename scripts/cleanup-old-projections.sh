#!/bin/bash

# Cleanup Old Fragmented Projection Files
# Run after implementing unified talent-based projections

echo "🧹 Cleaning up old fragmented projection files..."

# Backup old projection files before deletion
BACKUP_DIR="backups/old-projections-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR..."

# Backup old projection functions
if [ -d "functions/project-pro-distributions" ]; then
    cp -r "functions/project-pro-distributions" "$BACKUP_DIR/"
    echo "✅ Backed up project-pro-distributions"
fi

if [ -d "functions/recalc-custom-projection" ]; then
    cp -r "functions/recalc-custom-projection" "$BACKUP_DIR/"
    echo "✅ Backed up recalc-custom-projection"
fi

# Move project-yearly-simple to backup (keep for reference but deprecated)
if [ -d "functions/project-yearly-simple" ]; then
    cp -r "functions/project-yearly-simple" "$BACKUP_DIR/"
    echo "✅ Backed up project-yearly-simple"
fi

echo "🗑️  Removing old projection files..."

# Remove old fragmented projection functions
rm -rf functions/project-pro-distributions
rm -rf functions/recalc-custom-projection

echo "✅ Removed fragmented projection functions"
echo "📁 Backups available in: $BACKUP_DIR"

echo ""
echo "🎯 Migration Complete!"
echo ""
echo "Old System (Fragmented):"
echo "  ❌ functions/project-yearly-simple/"
echo "  ❌ functions/project-pro-distributions/"  
echo "  ❌ functions/recalc-custom-projection/"
echo ""
echo "New System (Unified):"
echo "  ✅ functions/unified-talent-projections/"
echo ""
echo "Key Improvements:"
echo "  🏆 Talent-based scaling with EA ratings, mock drafts, previous stats"
echo "  📰 ESPN+ article analysis integration (with OpenAI)"
echo "  👥 Surrounding talent analysis (offensive line, supporting cast)"
echo "  📊 Enhanced depth chart multipliers"
echo "  🎯 Single source of truth for all projections"
echo ""
echo "Usage: npx ts-node functions/unified-talent-projections/index.ts --season=2025"
echo ""