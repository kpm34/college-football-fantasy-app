#!/usr/bin/env tsx
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function setupFreshCronSecret() {
  console.log('🔐 SETTING UP FRESH CRON SECRET\n');
  console.log('=' .repeat(60));
  
  // Generate a new secure secret
  const newSecret = randomBytes(32).toString('hex');
  console.log('✅ Generated new secret:', newSecret.substring(0, 10) + '...');
  
  // Step 1: Update .env.local
  console.log('\n📝 Updating .env.local...');
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Remove old CRON_SECRET entries
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => !line.startsWith('CRON_SECRET'));
  
  // Add new CRON_SECRET
  filteredLines.push(`CRON_SECRET="${newSecret}"`);
  
  fs.writeFileSync(envPath, filteredLines.join('\n'));
  console.log('✅ Updated .env.local with new secret');
  
  // Step 2: Remove old secret from Vercel
  console.log('\n🗑️  Removing old CRON_SECRET from Vercel...');
  try {
    execSync('vercel env rm CRON_SECRET production --yes', { stdio: 'inherit' });
    console.log('✅ Removed old secret from production');
  } catch (e) {
    console.log('⚠️  No existing secret to remove or already removed');
  }
  
  try {
    execSync('vercel env rm CRON_SECRET preview --yes', { stdio: 'inherit' });
    console.log('✅ Removed old secret from preview');
  } catch (e) {
    console.log('⚠️  No existing secret to remove or already removed');
  }
  
  try {
    execSync('vercel env rm CRON_SECRET development --yes', { stdio: 'inherit' });
    console.log('✅ Removed old secret from development');
  } catch (e) {
    console.log('⚠️  No existing secret to remove or already removed');
  }
  
  // Step 3: Add new secret to Vercel
  console.log('\n📤 Adding new CRON_SECRET to Vercel...');
  
  // Create a temporary file with the secret value
  const tempFile = path.join(process.cwd(), '.temp-cron-secret');
  fs.writeFileSync(tempFile, newSecret);
  
  try {
    // Add to all environments
    execSync(`cat ${tempFile} | vercel env add CRON_SECRET production`, { stdio: 'inherit' });
    console.log('✅ Added to production');
    
    execSync(`cat ${tempFile} | vercel env add CRON_SECRET preview`, { stdio: 'inherit' });
    console.log('✅ Added to preview');
    
    execSync(`cat ${tempFile} | vercel env add CRON_SECRET development`, { stdio: 'inherit' });
    console.log('✅ Added to development');
  } catch (e) {
    console.error('❌ Error adding secret:', e);
  } finally {
    // Clean up temp file
    fs.unlinkSync(tempFile);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ CRON SECRET SETUP COMPLETE!\n');
  console.log('Next steps:');
  console.log('1. Deploy to apply the new secret: vercel --prod --force');
  console.log('2. Test the cron endpoint manually:');
  console.log(`   curl -H "Authorization: Bearer ${newSecret}" https://cfbfantasy.app/api/cron/start-drafts`);
  console.log('\n⚠️  Note: Vercel\'s automatic cron execution should work without the secret');
  console.log('   The secret is only needed for manual triggering');
}

setupFreshCronSecret().catch(console.error);
