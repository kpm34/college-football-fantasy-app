#!/usr/bin/env node

/**
 * Setup comprehensive MCP tooling for Appwrite and Cursor integration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Setting up comprehensive MCP tooling\n');

const MCP_SERVERS = [
  {
    name: 'appwrite',
    description: 'Appwrite database operations',
    install: 'mcp-server-appwrite',
    type: 'uvx'
  },
  {
    name: 'filesystem', 
    description: 'File system operations',
    install: '@modelcontextprotocol/server-filesystem',
    type: 'npx'
  },
  {
    name: 'memory',
    description: 'Persistent memory across conversations',
    install: '@modelcontextprotocol/server-memory', 
    type: 'npx'
  },
  {
    name: 'git',
    description: 'Git repository operations',
    install: '@modelcontextprotocol/server-git',
    type: 'npx'
  },
  {
    name: 'brave-search',
    description: 'Web search capabilities',
    install: '@modelcontextprotocol/server-brave-search',
    type: 'npx'
  },
  {
    name: 'puppeteer',
    description: 'Web scraping and automation', 
    install: '@modelcontextprotocol/server-puppeteer',
    type: 'npx'
  },
  {
    name: 'sqlite',
    description: 'SQLite database operations',
    install: '@modelcontextprotocol/server-sqlite',
    type: 'npx'
  },
  {
    name: 'github',
    description: 'GitHub repository operations',
    install: '@modelcontextprotocol/server-github',
    type: 'npx'
  }
];

async function testMCPServer(server) {
  try {
    console.log(`🧪 Testing ${server.name}...`);
    
    if (server.type === 'uvx') {
      execSync(`$HOME/.local/bin/uvx ${server.install} --help`, { 
        stdio: 'pipe',
        timeout: 10000 
      });
    } else {
      execSync(`npx -y ${server.install} --help`, { 
        stdio: 'pipe',
        timeout: 10000 
      });
    }
    
    console.log(`   ✅ ${server.name} available`);
    return true;
  } catch (error) {
    console.log(`   ❌ ${server.name} not available: ${error.message.substring(0, 100)}`);
    return false;
  }
}

function generateMCPConfig() {
  const config = {
    mcpServers: {}
  };

  // Appwrite server with authentication
  config.mcpServers.appwrite = {
    command: "$HOME/.local/bin/uvx",
    args: [
      "mcp-server-appwrite",
      "--collections", "games,teams,leagues,college_players,player_stats,rankings,rosters,lineups,auctions,bids,users,activity_log"
    ],
    env: {
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || "standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b",
      APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || "college-football-fantasy-app",
      APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1",
      APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID || "college-football-fantasy"
    }
  };

  // Filesystem server
  config.mcpServers.filesystem = {
    command: "npx",
    args: [
      "-y", 
      "@modelcontextprotocol/server-filesystem",
      "/Users/kashyapmaheshwari/college-football-fantasy-app"
    ]
  };

  // Memory server
  config.mcpServers.memory = {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"]
  };

  // Git server
  config.mcpServers.git = {
    command: "npx",
    args: [
      "-y",
      "@modelcontextprotocol/server-git",
      "--repository", "/Users/kashyapmaheshwari/college-football-fantasy-app"
    ]
  };

  // GitHub server
  config.mcpServers.github = {
    command: "npx", 
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || "your-github-token-here"
    }
  };

  // Web search
  config.mcpServers["brave-search"] = {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: {
      BRAVE_API_KEY: process.env.BRAVE_API_KEY || "your-brave-api-key-here"
    }
  };

  // Web automation
  config.mcpServers.puppeteer = {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"]
  };

  return config;
}

function updateCursorConfig() {
  try {
    const cursorConfigPath = path.join(__dirname, '..', 'cursor.config.json');
    const cursorConfig = JSON.parse(fs.readFileSync(cursorConfigPath, 'utf8'));
    
    cursorConfig.tools.mcp = {
      enabled: true,
      servers: [
        "appwrite - Database operations with full CRUD",
        "filesystem - File system operations", 
        "memory - Persistent memory across sessions",
        "git - Git repository operations",
        "github - GitHub API operations",
        "brave-search - Web search capabilities",
        "puppeteer - Web scraping and automation"
      ],
      authentication: {
        appwrite: "Configured with API key and project credentials",
        github: "Requires GITHUB_TOKEN environment variable",
        braveSearch: "Requires BRAVE_API_KEY environment variable"
      }
    };
    
    fs.writeFileSync(cursorConfigPath, JSON.stringify(cursorConfig, null, 2));
    console.log('✅ Updated cursor.config.json');
    
  } catch (error) {
    console.log(`⚠️  Could not update cursor.config.json: ${error.message}`);
  }
}

function configureAppwriteCLI() {
  try {
    console.log('🔧 Configuring Appwrite CLI with persistent login...');
    
    // Create Appwrite CLI config directory
    const appwriteDir = path.join(require('os').homedir(), '.appwrite');
    if (!fs.existsSync(appwriteDir)) {
      fs.mkdirSync(appwriteDir, { recursive: true });
    }
    
    // Create global config
    const globalConfig = {
      endpoint: process.env.APPWRITE_ENDPOINT,
      projectId: process.env.APPWRITE_PROJECT_ID,
      cookie: "",
      email: "kashpm2002@gmail.com",
      preference: {
        editor: "code",
        ide: "cursor"
      }
    };
    
    fs.writeFileSync(
      path.join(appwriteDir, 'prefs.json'), 
      JSON.stringify(globalConfig, null, 2)
    );
    
    // Set CLI configuration using API key
    execSync(`appwrite client --endpoint "${process.env.APPWRITE_ENDPOINT}" --project-id "${process.env.APPWRITE_PROJECT_ID}" --key "${process.env.APPWRITE_API_KEY}"`, {
      stdio: 'pipe'
    });
    
    console.log('✅ Appwrite CLI configured with persistent credentials');
    
  } catch (error) {
    console.log(`⚠️  Could not configure Appwrite CLI: ${error.message}`);
  }
}

async function main() {
  console.log('📋 Available MCP Servers:\n');
  
  const availableServers = [];
  
  for (const server of MCP_SERVERS) {
    const available = await testMCPServer(server);
    if (available) {
      availableServers.push(server);
    }
  }
  
  console.log(`\n✅ ${availableServers.length}/${MCP_SERVERS.length} servers available\n`);
  
  // Generate comprehensive MCP configuration
  const mcpConfig = generateMCPConfig();
  const configPath = path.join(__dirname, '..', 'docs', 'MCP_CONFIG.json');
  
  fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));
  console.log(`✅ Generated MCP configuration: ${configPath}`);
  
  // Update Cursor configuration  
  updateCursorConfig();
  
  // Configure Appwrite CLI
  configureAppwriteCLI();
  
  console.log('\n🎉 MCP tooling setup complete!');
  console.log('\n🔗 Available tools:');
  console.log('   • Appwrite database operations');
  console.log('   • File system management');
  console.log('   • Git repository operations'); 
  console.log('   • GitHub API integration');
  console.log('   • Web search and scraping');
  console.log('   • Persistent memory');
  
  console.log('\n🔧 Next steps:');
  console.log('   1. Restart Claude Code to load new MCP servers');
  console.log('   2. Set GITHUB_TOKEN and BRAVE_API_KEY if needed');
  console.log('   3. Test tools with: node scripts/test-mcp-tools.js');
}

if (require.main === module) {
  main().catch(console.error);
}