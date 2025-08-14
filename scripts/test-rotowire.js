#!/usr/bin/env node

const { config } = require('dotenv');
config({ path: '.env.local' });

// Test Rotowire authentication setup
async function testRotowireAuth() {
  console.log('🏈 Testing Rotowire Integration Setup\n');
  
  // Check environment variables
  const username = process.env.ROTOWIRE_USERNAME;
  const encryptedPassword = process.env.ROTOWIRE_PASSWORD_ENCRYPTED;
  const encryptionKey = process.env.ROTOWIRE_ENCRYPTION_KEY;
  
  console.log('✓ Username:', username ? '✅ Set' : '❌ Missing');
  console.log('✓ Encrypted Password:', encryptedPassword ? '✅ Set' : '❌ Missing');
  console.log('✓ Encryption Key:', encryptionKey ? '✅ Set' : '❌ Missing');
  
  if (!username || !encryptedPassword || !encryptionKey) {
    console.log('\n❌ Missing required environment variables!');
    console.log('\nPlease add these to your .env.local file:');
    console.log('ROTOWIRE_USERNAME="your-email"');
    console.log('ROTOWIRE_PASSWORD_ENCRYPTED="encrypted-password"');
    console.log('ROTOWIRE_ENCRYPTION_KEY="encryption-key"');
    console.log('\nRun: npm run setup:rotowire to set these up');
    return;
  }
  
  // Test decryption
  try {
    const crypto = require('crypto');
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const keyBuffer = Buffer.from(encryptionKey, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log('\n✅ Decryption successful!');
    console.log('✓ Credentials are properly encrypted');
    
  } catch (error) {
    console.log('\n❌ Decryption failed:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Add these same environment variables to Vercel dashboard');
  console.log('2. Test the API endpoint: GET /api/rotowire/news');
  console.log('3. Check the Rotowire news component in the locker room');
}

testRotowireAuth().catch(console.error);
