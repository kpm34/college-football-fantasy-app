#!/usr/bin/env node

/**
 * MCP Setup Verification Script
 * Tests that all MCP servers are properly configured and can connect
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

class MCPVerifier {
  constructor() {
    this.mcpConfigPath = path.join(os.homedir(), '.cursor', 'mcp.json');
    this.projectRoot = process.cwd();
  }

  async verifyConfig() {
    console.log('🔍 MCP Configuration Verification');
    console.log('================================');

    try {
      // Check if MCP config exists
      const configData = await fs.readFile(this.mcpConfigPath, 'utf-8');
      const config = JSON.parse(configData);
      
      console.log('✅ MCP config file found:', this.mcpConfigPath);
      console.log('📍 Configured servers:', Object.keys(config.mcpServers).join(', '));

      return config;
    } catch (error) {
      console.error('❌ MCP config file not found or invalid:', error.message);
      return null;
    }
  }

  async verifyEnvironment() {
    console.log('\n🌍 Environment Variables Check');
    console.log('==============================');

    try {
      // Check .env.local for Appwrite key
      const envPath = path.join(this.projectRoot, '.env.local');
      const envData = await fs.readFile(envPath, 'utf-8');
      
      const hasAppwriteKey = envData.includes('APPWRITE_API_KEY=');
      const hasEndpoint = envData.includes('APPWRITE_ENDPOINT=');
      const hasProjectId = envData.includes('APPWRITE_PROJECT_ID=');
      
      console.log('✅ .env.local file found');
      console.log('📍 APPWRITE_API_KEY:', hasAppwriteKey ? '✅ Present' : '❌ Missing');
      console.log('📍 APPWRITE_ENDPOINT:', hasEndpoint ? '✅ Present' : '❌ Missing');
      console.log('📍 APPWRITE_PROJECT_ID:', hasProjectId ? '✅ Present' : '❌ Missing');

      return hasAppwriteKey && hasEndpoint && hasProjectId;
    } catch (error) {
      console.error('❌ .env.local file not found:', error.message);
      return false;
    }
  }

  async verifyDependencies() {
    console.log('\n📦 Dependencies Check');
    console.log('====================');

    const dependencies = [
      { cmd: 'uvx --version', name: 'uvx (for Appwrite MCP)' },
      { cmd: 'npx --version', name: 'npx (for other MCP servers)' }
    ];

    const results = [];

    for (const dep of dependencies) {
      try {
        await execAsync(dep.cmd);
        console.log(`✅ ${dep.name}: Available`);
        results.push(true);
      } catch (error) {
        console.log(`❌ ${dep.name}: Not available`);
        results.push(false);
      }
    }

    return results.every(result => result);
  }

  async testAppwriteConnection() {
    console.log('\n🔗 Appwrite Connection Test');
    console.log('===========================');

    try {
      // Test if we can reach Appwrite endpoint
      const { stdout } = await execAsync('curl -s -o /dev/null -w "%{http_code}" https://nyc.cloud.appwrite.io/v1/health');
      
      if (stdout.trim() === '200') {
        console.log('✅ Appwrite endpoint reachable');
        return true;
      } else {
        console.log('❌ Appwrite endpoint not reachable, status:', stdout.trim());
        return false;
      }
    } catch (error) {
      console.log('❌ Failed to test Appwrite connection:', error.message);
      return false;
    }
  }

  async generateReport() {
    console.log('\n📊 MCP Setup Report');
    console.log('==================');

    const config = await this.verifyConfig();
    const envValid = await this.verifyEnvironment();
    const depsValid = await this.verifyDependencies();
    const connectionValid = await this.testAppwriteConnection();

    const allValid = config && envValid && depsValid && connectionValid;

    console.log('\n🎯 Summary:');
    console.log('- MCP Configuration:', config ? '✅' : '❌');
    console.log('- Environment Variables:', envValid ? '✅' : '❌');
    console.log('- Dependencies:', depsValid ? '✅' : '❌');
    console.log('- Appwrite Connection:', connectionValid ? '✅' : '❌');

    if (allValid) {
      console.log('\n🎉 All MCP components are properly configured!');
      console.log('🚀 Ready for Claude Code with MCP Appwrite access');
    } else {
      console.log('\n⚠️  Some issues found. Please fix the above items.');
    }

    return allValid;
  }

  async run() {
    console.log('🧰 MCP Setup Verification Tool');
    console.log('==============================\n');

    const isValid = await this.generateReport();
    
    process.exit(isValid ? 0 : 1);
  }
}

// Run verification
const verifier = new MCPVerifier();
verifier.run().catch(console.error);