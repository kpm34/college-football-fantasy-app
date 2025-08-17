/**
 * Environment Variable Generator
 * 
 * Generates environment variable configurations from the canonical schema
 */

import { SCHEMA, ENV_VARS } from '../schema';
import fs from 'fs';
import path from 'path';

export function generateEnvTemplate(): string {
  let envContent = `# AUTO-GENERATED ENVIRONMENT TEMPLATE
# Generated from schema/schema.ts - Do not edit manually
# Run 'npm run generate:env' to regenerate

# =====================================
# 🗄️ APPWRITE DATABASE
# =====================================
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=college-football-fantasy-app
APPWRITE_API_KEY=your-api-key-here
APPWRITE_DATABASE_ID=college-football-fantasy
DATABASE_ID=college-football-fantasy

# Frontend Public Variables (same as above)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# =====================================
# 📊 COLLECTION NAMES (Auto-generated from Schema)
# =====================================
`;

  // Generate collection environment variables from schema
  for (const [envVarName, collectionId] of Object.entries(ENV_VARS)) {
    const collection = SCHEMA[collectionId];
    envContent += `${envVarName}=${collectionId}  # ${collection.description}\n`;
  }

  envContent += `
# =====================================
# 🏈 SPORTS DATA APIs
# =====================================
CFBD_API_KEY=your-cfbd-api-key-here
CFBD_API_KEY_BACKUP=your-backup-cfbd-key-here

# =====================================
# ⚡ AI GATEWAY
# =====================================
AI_GATEWAY_API_KEY=your-ai-gateway-key
AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1/ai

# =====================================
# 🔧 DEVELOPMENT SETTINGS
# =====================================
SEASON_YEAR=2025
NEXT_DISABLE_FAST_REFRESH=true
SKIP_ENV_VALIDATION=true

# =====================================
# 📊 OPTIONAL SERVICES
# =====================================
# ODDS_API_KEY=your-odds-api-key-here
# ROTOWIRE_API_KEY=your-rotowire-key-here
# INNGEST_EVENT_KEY=your-inngest-event-key-here
# INNGEST_SIGNING_KEY=your-inngest-signing-key-here
# EDGE_CONFIG=your-edge-config-here
`;

  return envContent;
}

export function generateVercelEnvScript(): string {
  let scriptContent = `#!/bin/bash

# AUTO-GENERATED VERCEL ENVIRONMENT SETUP
# Generated from schema/schema.ts
# Sets up all collection environment variables in Vercel

echo "🌍 Setting up Vercel environment variables from schema..."

# Remove old/deprecated variables first
echo "🗑️ Removing deprecated variables..."
`;

  // List of deprecated variables to remove
  const deprecatedVars = [
    'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_SESSIONS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTION_BIDS', 
    'NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING',
    'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS' // Use COLLEGE_PLAYERS instead
  ];

  for (const deprecatedVar of deprecatedVars) {
    scriptContent += `vercel env rm ${deprecatedVar} production --yes 2>/dev/null || true\n`;
    scriptContent += `vercel env rm ${deprecatedVar} preview --yes 2>/dev/null || true\n`;  
    scriptContent += `vercel env rm ${deprecatedVar} development --yes 2>/dev/null || true\n`;
  }

  scriptContent += `\necho "✨ Adding modern schema variables..."
`;

  // Add modern collection variables
  for (const [envVarName, collectionId] of Object.entries(ENV_VARS)) {
    scriptContent += `
echo "Setting ${envVarName}=${collectionId}"
echo "${collectionId}" | vercel env add ${envVarName} production
echo "${collectionId}" | vercel env add ${envVarName} preview  
echo "${collectionId}" | vercel env add ${envVarName} development
`;
  }

  scriptContent += `
echo "✅ Vercel environment variables updated successfully!"
echo "📋 Variables set:"
`;

  for (const [envVarName, collectionId] of Object.entries(ENV_VARS)) {
    scriptContent += `echo "  ${envVarName}=${collectionId}"\n`;
  }

  scriptContent += `
echo ""
echo "💡 Next steps:"
echo "1. Deploy to apply changes: vercel --prod"
echo "2. Verify variables: vercel env ls"
`;

  return scriptContent;
}

export function writeEnvFiles(): void {
  // Write .env template
  const envTemplate = generateEnvTemplate();
  const envPath = path.join(process.cwd(), '.env.template.generated');
  fs.writeFileSync(envPath, envTemplate);
  console.log(`✅ Generated environment template: ${envPath}`);
  
  // Write Vercel setup script
  const vercelScript = generateVercelEnvScript();
  const scriptPath = path.join(process.cwd(), 'scripts', 'setup-vercel-env.sh');
  fs.writeFileSync(scriptPath, vercelScript, { mode: 0o755 });
  console.log(`✅ Generated Vercel setup script: ${scriptPath}`);
}

// CLI support
if (require.main === module) {
  writeEnvFiles();
}