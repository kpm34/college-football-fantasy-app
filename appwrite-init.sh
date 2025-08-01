#!/bin/bash

# Appwrite CLI Setup Script
echo "🏈 College Football Fantasy App - Appwrite Setup"
echo "================================================"

# First, login to Appwrite
echo ""
echo "Step 1: Login to Appwrite"
echo "Run: appwrite login"
echo ""

# After login, init the project
echo "Step 2: Initialize the project"
echo "Run: appwrite init project"
echo "  - Select 'Create a new Appwrite project'"
echo "  - Name: College Football Fantasy App"
echo "  - ID: college-football-fantasy (or auto-generate)"
echo ""

# Create collections
echo "Step 3: Create database and collections"
echo ""
echo "First create the database:"
echo "appwrite databases create \\"
echo "  --databaseId 'college-football-fantasy' \\"
echo "  --name 'College Football Fantasy Database'"
echo ""

# Create games collection
echo "Create games collection:"
echo "appwrite databases createCollection \\"
echo "  --databaseId 'college-football-fantasy' \\"
echo "  --collectionId 'games' \\"
echo "  --name 'Games' \\"
echo "  --permissions 'read(\"any\")'"

# Add games attributes
echo ""
echo "Add games attributes:"
echo "appwrite databases createIntegerAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'season' --required true"
echo "appwrite databases createIntegerAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'week' --required true"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'seasonType' --size 20 --required true"
echo "appwrite databases createDatetimeAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'startDate' --required true"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'homeTeam' --size 100 --required true"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'homeConference' --size 20 --required false"
echo "appwrite databases createIntegerAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'homePoints' --required false --default 0"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'awayTeam' --size 100 --required true"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'awayConference' --size 20 --required false"
echo "appwrite databases createIntegerAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'awayPoints' --required false --default 0"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'status' --size 20 --required true"
echo "appwrite databases createIntegerAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'period' --required false --default 0"
echo "appwrite databases createStringAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'clock' --size 10 --required false"
echo "appwrite databases createBooleanAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'isConferenceGame' --required false --default false"
echo "appwrite databases createDatetimeAttribute --databaseId 'college-football-fantasy' --collectionId 'games' --key 'lastUpdated' --required false"

echo ""
echo "To run these commands automatically, make this script executable:"
echo "chmod +x appwrite-init.sh"
echo "./appwrite-init.sh"