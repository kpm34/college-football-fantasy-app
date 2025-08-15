#!/usr/bin/env node

/**
 * Environment Variables Alignment Script
 * Ensures all required environment variables are properly set in Vercel
 */

import { execSync } from 'child_process';

const ENVIRONMENTS = ['production', 'preview', 'development'] as const;

// Define all required environment variables with their properties
const ENV_VARS = {
  // Server-side Appwrite
  APPWRITE_API_KEY: {
    environments: ['production'],
    description: 'Appwrite API key with full access',
    example: 'your-api-key-here'
  },
  APPWRITE_ENDPOINT: {
    environments: ['production'],
    value: 'https://nyc.cloud.appwrite.io/v1',
    description: 'Appwrite endpoint URL'
  },
  APPWRITE_PROJECT_ID: {
    environments: ['production'],
    value: 'college-football-fantasy-app',
    description: 'Appwrite project ID'
  },
  DATABASE_ID: {
    environments: ['production'],
    value: 'college-football-fantasy',
    description: 'Appwrite database ID'
  },

  // Client-side Appwrite
  NEXT_PUBLIC_APPWRITE_ENDPOINT: {
    environments: ENVIRONMENTS,
    value: 'https://nyc.cloud.appwrite.io/v1',
    description: 'Public Appwrite endpoint'
  },
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: {
    environments: ENVIRONMENTS,
    value: 'college-football-fantasy-app',
    description: 'Public Appwrite project ID'
  },
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: {
    environments: ENVIRONMENTS,
    value: 'college-football-fantasy',
    description: 'Public Appwrite database ID'
  },

  // Collection IDs
  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES: {
    environments: ENVIRONMENTS,
    value: 'leagues',
    description: 'Leagues collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS: {
    environments: ENVIRONMENTS,
    value: 'rosters',
    description: 'Rosters collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS: {
    environments: ENVIRONMENTS,
    value: 'college_players',
    description: 'Players collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS: {
    environments: ENVIRONMENTS,
    value: 'draft_picks',
    description: 'Draft picks collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS: {
    environments: ENVIRONMENTS,
    value: 'lineups',
    description: 'Lineups collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS: {
    environments: ENVIRONMENTS,
    value: 'player_projections',
    description: 'Player projections collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_YEARLY: {
    environments: ENVIRONMENTS,
    value: 'projections_yearly',
    description: 'Yearly projections collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_PROJECTIONS_WEEKLY: {
    environments: ENVIRONMENTS,
    value: 'projections_weekly',
    description: 'Weekly projections collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS: {
    environments: ENVIRONMENTS,
    value: 'model_inputs',
    description: 'Model inputs collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_USER_CUSTOM_PROJECTIONS: {
    environments: ENVIRONMENTS,
    value: 'user_custom_projections',
    description: 'User custom projections collection ID'
  },
  NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOG: {
    environments: ENVIRONMENTS,
    value: 'activity_log',
    description: 'Activity log collection ID'
  },

  // External APIs
  CFBD_API_KEY: {
    environments: ['production'],
    description: 'College Football Data API key',
    example: 'your-cfbd-key'
  },

  // Security
  CRON_SECRET: {
    environments: ['production'],
    description: 'Secret for cron job authentication',
    example: 'generate-random-string'
  }
} as const;

type EnvVarConfig = {
  environments: readonly typeof ENVIRONMENTS[number][];
  value?: string;
  description: string;
  example?: string;
};

async function checkExistingVars(): Promise<Set<string>> {
  console.log('📋 Checking existing environment variables...\n');
  
  try {
    const output = execSync('vercel env ls', { encoding: 'utf8' });
    const lines = output.split('\n');
    const existingVars = new Set<string>();
    
    lines.forEach(line => {
      const match = line.match(/^\s*(\w+)\s+/);
      if (match) {
        existingVars.add(match[1]);
      }
    });
    
    return existingVars;
  } catch (error) {
    console.error('❌ Failed to list environment variables. Make sure you are logged in to Vercel.');
    process.exit(1);
  }
}

async function addEnvironmentVariable(
  name: string,
  config: EnvVarConfig,
  existingVars: Set<string>
): Promise<void> {
  if (existingVars.has(name)) {
    console.log(`✅ ${name} - Already exists`);
    return;
  }

  console.log(`\n🔧 Adding ${name}...`);
  console.log(`   Description: ${config.description}`);

  if (config.value) {
    // Has a fixed value, add it directly
    for (const env of config.environments) {
      try {
        execSync(
          `echo "${config.value}" | vercel env add ${name} ${env}`,
          { stdio: 'pipe' }
        );
        console.log(`   ✅ Added to ${env}`);
      } catch (error) {
        console.error(`   ❌ Failed to add to ${env}`);
      }
    }
  } else {
    // Needs manual input
    console.log(`   ⚠️  Requires manual value${config.example ? ` (example: ${config.example})` : ''}`);
    console.log(`   Run: vercel env add ${name} production`);
  }
}

async function createEnvTemplate(): Promise<void> {
  console.log('\n📝 Creating .env.local.template...\n');

  let template = `# College Football Fantasy App - Environment Variables Template
# Created: ${new Date().toISOString()}
# 
# Instructions:
# 1. Copy this file to .env.local
# 2. Fill in all values marked with "REPLACE_ME"
# 3. Never commit .env.local to git

`;

  Object.entries(ENV_VARS).forEach(([name, config]) => {
    template += `# ${config.description}\n`;
    if (config.value) {
      template += `${name}=${config.value}\n`;
    } else {
      template += `${name}=REPLACE_ME${config.example ? ` # Example: ${config.example}` : ''}\n`;
    }
    template += '\n';
  });

  const fs = await import('fs');
  fs.writeFileSync('.env.local.template', template);
  console.log('✅ Created .env.local.template');
}

async function createTypeDefinitions(): Promise<void> {
  console.log('\n📝 Creating environment type definitions...\n');

  let typeDef = `// Auto-generated environment variable types
// Generated: ${new Date().toISOString()}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
`;

  Object.entries(ENV_VARS).forEach(([name]) => {
    typeDef += `      ${name}: string;\n`;
  });

  typeDef += `    }
  }
}

export {};
`;

  const fs = await import('fs');
  const path = await import('path');
  
  // Ensure types directory exists
  const typesDir = path.join(process.cwd(), 'types');
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  fs.writeFileSync(path.join(typesDir, 'env.d.ts'), typeDef);
  console.log('✅ Created types/env.d.ts');
}

async function main() {
  console.log('🔐 Environment Variables Alignment Tool\n');
  console.log('This tool will help ensure all required environment variables are set in Vercel.\n');

  // Check what's already there
  const existingVars = await checkExistingVars();
  console.log(`\nFound ${existingVars.size} existing variables\n`);

  // Process each required variable
  console.log('📊 Processing required variables...\n');
  
  const missingCritical: string[] = [];
  
  for (const [name, config] of Object.entries(ENV_VARS)) {
    if (!existingVars.has(name) && !config.value) {
      missingCritical.push(name);
    }
    await addEnvironmentVariable(name, config as EnvVarConfig, existingVars);
  }

  // Create template files
  await createEnvTemplate();
  await createTypeDefinitions();

  // Summary
  console.log('\n📊 Summary:\n');
  console.log(`Total required variables: ${Object.keys(ENV_VARS).length}`);
  console.log(`Already configured: ${Array.from(existingVars).filter(v => ENV_VARS[v as keyof typeof ENV_VARS]).length}`);
  console.log(`Missing (need manual input): ${missingCritical.length}`);

  if (missingCritical.length > 0) {
    console.log('\n⚠️  Critical variables that need manual configuration:');
    missingCritical.forEach(varName => {
      const config = ENV_VARS[varName as keyof typeof ENV_VARS];
      console.log(`\n   ${varName}`);
      console.log(`   Description: ${config.description}`);
      console.log(`   Command: vercel env add ${varName} production`);
      if (config.example) {
        console.log(`   Example: ${config.example}`);
      }
    });
  }

  console.log('\n✅ Environment alignment check complete!');
  console.log('\nNext steps:');
  console.log('1. Add any missing critical variables using the commands above');
  console.log('2. Copy .env.local.template to .env.local for local development');
  console.log('3. Run "vercel pull" to sync environment variables locally');
  console.log('4. Restart your development server');
}

// Run the script
main().catch(console.error);
