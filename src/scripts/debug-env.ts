#!/usr/bin/env ts-node
/**
 * Debug environment variables loading
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

console.log('🔍 Debugging environment variables...');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('\n📁 Current directory:', __dirname);
console.log('📁 .env file path:', path.resolve(__dirname, '../../.env'));

console.log('\n🔧 Environment variables:');
console.log('APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT);
console.log('APPWRITE_PROJECT_ID:', process.env.APPWRITE_PROJECT_ID);
console.log('APPWRITE_API_KEY length:', process.env.APPWRITE_API_KEY?.length || 0);
console.log('APPWRITE_API_KEY starts with:', process.env.APPWRITE_API_KEY?.substring(0, 20) || 'undefined');

// Check if the .env file exists
import * as fs from 'fs';
const envPath = path.resolve(__dirname, '../../.env');
console.log('\n📄 .env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('📄 .env file content (first 500 chars):');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content.substring(0, 500));
} 