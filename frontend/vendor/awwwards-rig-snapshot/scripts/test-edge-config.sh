#!/bin/bash

# Edge Config Testing Script
# Tests different flag combinations via API

VERCEL_TOKEN="ykcr79NGZJJ5qWEDoVzwq9iL"
TEAM_ID="team_j4yFeTsDmfSG0cCl7dwn2w3b"
EDGE_CONFIG_ID="ecfg_0ohdp3ndbocrcm0zrptgv0fow6wh"

echo "🧪 Edge Config Testing Script"
echo "============================"
echo ""

# Function to update a flag
update_flag() {
  local key=$1
  local value=$2
  
  echo "Setting $key = $value..."
  
  curl -sS -X PATCH "https://api.vercel.com/v1/edge-config/$EDGE_CONFIG_ID/items?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"items\":[{\"operation\":\"upsert\",\"key\":\"$key\",\"value\":$value}]}" > /dev/null
  
  echo "✅ Updated"
}

# Menu
echo "Choose a test scenario:"
echo "1. Static Hero (disable 3D)"
echo "2. Low Performance Mode"
echo "3. Maintenance Mode ON"
echo "4. Chat Disabled"
echo "5. Reset to Defaults"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo "📱 Setting Static Hero..."
    update_flag "heroVariant" '"static"'
    update_flag "enableWebGL" "false"
    ;;
  2)
    echo "🔋 Setting Low Performance Mode..."
    update_flag "webglQuality" '"low"'
    update_flag "enablePostProcessing" "false"
    update_flag "maxDPR" "1"
    ;;
  3)
    echo "🚧 Enabling Maintenance Mode..."
    update_flag "maintenanceMode" "true"
    ;;
  4)
    echo "🔇 Disabling Chat..."
    update_flag "chatEnabled" "false"
    ;;
  5)
    echo "♻️ Resetting to Defaults..."
    update_flag "heroVariant" '"3d"'
    update_flag "enableWebGL" "true"
    update_flag "webglQuality" '"high"'
    update_flag "enablePostProcessing" "true"
    update_flag "maxDPR" "2"
    update_flag "maintenanceMode" "false"
    update_flag "chatEnabled" "true"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🔄 Changes will propagate in ~300ms"
echo "📊 Check current flags: http://localhost:3000/api/edge-config"