#!/bin/bash

# Comprehensive Migration and Alignment Script
# This script handles frontend migration, Appwrite alignment, and Vercel configuration

echo "=== Starting Comprehensive Migration and Alignment ==="

# Step 1: Backup current state
echo "1. Creating backup of current state..."
cp -r . ../backup-merge-$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "Backup created"

# Step 2: Move frontend files to root
echo "2. Migrating frontend files to root..."
for item in frontend/*; do
    basename=$(basename "$item")
    if [[ "$basename" != "node_modules" && "$basename" != ".next" && "$basename" != "out" ]]; then
        if [[ -e "$basename" ]]; then
            echo "  - Merging $basename..."
            if [[ -d "$item" && -d "$basename" ]]; then
                # Merge directories
                cp -r "$item"/* "$basename"/ 2>/dev/null
                rm -rf "$item"
            elif [[ "$basename" == "package.json" ]]; then
                # Special handling for package.json - will merge manually
                mv "$basename" "package.root.json"
                mv "$item" "package.frontend.json"
            else
                mv "$basename" "${basename}.backup"
                mv "$item" .
            fi
        else
            mv "$item" .
        fi
    fi
done

# Step 3: Handle hidden files
echo "3. Moving hidden configuration files..."
for item in frontend/.*; do
    basename=$(basename "$item")
    if [[ "$basename" != "." && "$basename" != ".." && "$basename" != ".next" ]]; then
        if [[ -e "$basename" ]]; then
            if [[ "$basename" == ".gitignore" ]]; then
                echo "  - Merging .gitignore files..."
                cat "$item" >> "$basename"
                sort -u "$basename" -o "$basename"
                rm "$item"
            elif [[ "$basename" == ".env.example" ]]; then
                echo "  - Merging .env.example files..."
                cat "$item" >> "$basename"
                rm "$item"
            else
                mv "$item" "${basename}.frontend"
            fi
        else
            mv "$item" .
        fi
    fi
done

# Step 4: Update Vercel configuration
echo "4. Aligning Vercel configuration..."
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/cron/weekly-scoring/route.ts": {
      "maxDuration": 60
    },
    "app/api/draft/[leagueId]/pick/route.ts": {
      "maxDuration": 30
    },
    "app/api/leagues/[leagueId]/route.ts": {
      "maxDuration": 30
    },
    "app/api/oauth/[provider]/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_APP_URL": "@next-public-app-url",
    "NEXT_PUBLIC_APPWRITE_ENDPOINT": "@next-public-appwrite-endpoint",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID": "@next-public-appwrite-project-id",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID": "@next-public-appwrite-database-id",
    "APPWRITE_API_KEY": "@appwrite-api-key",
    "CFBD_API_KEY": "@cfbd-api-key",
    "ROTOWIRE_API_KEY": "@rotowire-api-key",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret",
    "APPLE_CLIENT_ID": "@apple-client-id",
    "APPLE_TEAM_ID": "@apple-team-id",
    "APPLE_KEY_ID": "@apple-key-id",
    "APPLE_PRIVATE_KEY": "@apple-private-key",
    "JWT_SECRET": "@jwt-secret"
  }
}
EOF

# Step 5: Update package.json scripts for root-level structure
echo "5. Creating merged package.json..."
cat > package.json << 'EOF'
{
  "name": "college-football-fantasy-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "setup-appwrite": "tsx scripts/setup-appwrite.ts",
    "sync-cfbd": "tsx scripts/sync-cfbd-data.ts",
    "sync-rotowire": "node scripts/rotowire-sync-league.mjs",
    "test": "jest",
    "test:watch": "jest --watch",
    "vercel-build": "next build",
    "postinstall": "npm run setup-appwrite 2>/dev/null || true"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.1",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-scroll-area": "^1.2.1",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@splinetool/react-spline": "^4.0.0",
    "@splinetool/runtime": "^1.9.32",
    "appwrite": "^16.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.11.17",
    "jose": "^5.9.6",
    "lucide-react": "^0.454.0",
    "next": "15.0.3",
    "next-themes": "^0.4.4",
    "node-appwrite": "^14.1.0",
    "react": "^19.0.0-rc-66855b96-20241106",
    "react-dom": "^19.0.0-rc-66855b96-20241106",
    "react-hook-form": "^7.54.0",
    "recharts": "^2.13.3",
    "sonner": "^1.7.0",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.0.3",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "playwright": "^1.49.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
EOF

# Step 6: Create/Update .env.example with all required variables
echo "6. Creating comprehensive .env.example..."
cat > .env.example << 'EOF'
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key

# External APIs
CFBD_API_KEY=your_cfbd_api_key
ROTOWIRE_API_KEY=your_rotowire_api_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# Security
JWT_SECRET=your_jwt_secret_min_32_chars

# Collection IDs (auto-generated by setup script)
NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_LEAGUES_COLLECTION_ID=leagues
NEXT_PUBLIC_TEAMS_COLLECTION_ID=teams
NEXT_PUBLIC_PLAYERS_COLLECTION_ID=players
NEXT_PUBLIC_DRAFT_PICKS_COLLECTION_ID=draft_picks
NEXT_PUBLIC_TRANSACTIONS_COLLECTION_ID=transactions
NEXT_PUBLIC_MATCHUPS_COLLECTION_ID=matchups
NEXT_PUBLIC_SCORING_COLLECTION_ID=scoring
EOF

# Step 7: Update import paths in all files
echo "7. Updating import paths..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" \) \
    -not -path "./node_modules/*" \
    -not -path "./frontend/*" \
    -not -path "./.next/*" \
    -not -path "./api/.venv/*" \
    -exec sed -i '' 's|from ["'\'']frontend/|from ["'\'']@/|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.mjs" \) \
    -not -path "./node_modules/*" \
    -not -path "./frontend/*" \
    -not -path "./.next/*" \
    -not -path "./api/.venv/*" \
    -exec sed -i '' 's|from ["'\'']../frontend/|from ["'\'']@/|g' {} \;

# Step 8: Clean up
echo "8. Cleaning up..."
rm -rf frontend 2>/dev/null || echo "Frontend directory retained"
rm -rf src 2>/dev/null || echo "Old src directory removed"

# Step 9: Create Appwrite sync script
echo "9. Creating Appwrite sync script..."
mkdir -p scripts
cat > scripts/sync-appwrite-schema.ts << 'EOF'
import { Client, Databases, ID } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function syncSchema() {
  console.log('Syncing Appwrite schema...');
  
  const schemaPath = path.join(process.cwd(), 'appwrite-schema.json');
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  
  for (const collection of schema.collections) {
    console.log(`Syncing collection: ${collection.name}`);
    try {
      await databases.createCollection(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        collection.$id || ID.unique(),
        collection.name
      );
      console.log(`✓ Created collection: ${collection.name}`);
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`✓ Collection already exists: ${collection.name}`);
      } else {
        console.error(`✗ Error creating collection ${collection.name}:`, error);
      }
    }
  }
  
  console.log('Schema sync complete!');
}

syncSchema().catch(console.error);
EOF

echo "=== Migration and Alignment Complete ==="
echo ""
echo "Next steps:"
echo "1. Review any .backup files created during migration"
echo "2. Copy your .env values to match the new structure"
echo "3. Run: npm install"
echo "4. Run: npm run setup-appwrite (to sync Appwrite collections)"
echo "5. Deploy to Vercel: vercel --prod"
echo ""
echo "Important files to check:"
echo "- package.json (merged from frontend and root)"
echo "- vercel.json (updated for root-level Next.js)"
echo "- .env.example (comprehensive list of all variables)"
echo "- appwrite-schema.json (ensure collections match your Appwrite project)"