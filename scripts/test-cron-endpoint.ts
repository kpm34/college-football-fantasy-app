#!/usr/bin/env tsx
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testCronEndpoint() {
  console.log('🔍 TESTING CRON ENDPOINT\n');
  console.log('=' .repeat(60));
  
  const baseUrl = 'https://cfbfantasy.app';
  const endpoint = '/api/cron/start-drafts';
  
  // Test 1: Without any auth
  console.log('\n1️⃣ Test without auth:');
  try {
    const res1 = await fetch(`${baseUrl}${endpoint}`);
    console.log('   Status:', res1.status, res1.statusText);
    if (res1.status === 200) {
      const data = await res1.json();
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    console.log('   Error:', e.message);
  }
  
  // Test 2: With CRON_SECRET from env
  console.log('\n2️⃣ Test with CRON_SECRET:');
  const cronSecret = process.env.CRON_SECRET?.replace(/\\n/g, '').trim();
  console.log('   Secret (first 10 chars):', cronSecret?.substring(0, 10) + '...');
  
  try {
    const res2 = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });
    console.log('   Status:', res2.status, res2.statusText);
    if (res2.status === 200) {
      const data = await res2.json();
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    console.log('   Error:', e.message);
  }
  
  // Test 3: Simulate Vercel cron header
  console.log('\n3️⃣ Test with x-vercel-cron header:');
  try {
    const res3 = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'x-vercel-cron': '1'
      }
    });
    console.log('   Status:', res3.status, res3.statusText);
    console.log('   Note: This should fail from outside Vercel');
  } catch (e: any) {
    console.log('   Error:', e.message);
  }
  
  // Test 4: Check if cron is actually configured
  console.log('\n4️⃣ Vercel Cron Configuration:');
  console.log('   According to vercel.json:');
  console.log('   - Path: /api/cron/start-drafts');
  console.log('   - Schedule: * * * * * (every minute)');
  console.log('   - Should run automatically every minute');
  
  console.log('\n💡 DIAGNOSIS:');
  console.log('=' .repeat(60));
  console.log(`
If the cron is not running automatically, possible issues:
1. CRON_SECRET mismatch between local and Vercel
2. Cron jobs might be disabled on the Vercel project
3. The deployment might not have the cron configuration
4. Vercel might be rate-limiting the cron execution

To fix:
1. Redeploy with: vercel --prod --force
2. Check Vercel dashboard for cron job status
3. Ensure CRON_SECRET matches on Vercel: vercel env pull
4. Check if cron jobs are enabled for your plan
`);
}

testCronEndpoint();
