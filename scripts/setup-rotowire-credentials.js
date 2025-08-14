#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

function encrypt(text, key) {
  const algorithm = 'aes-256-gcm';
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

async function main() {
  console.log('🏈 Rotowire Credential Setup\n');
  console.log('This script will help you securely store your Rotowire credentials.\n');
  
  const username = await question('Rotowire username (email): ');
  const password = await question('Rotowire password: ');
  
  // Generate encryption key
  const encryptionKey = generateKey();
  const encryptedPassword = encrypt(password, encryptionKey);
  
  // Create .env.local entries
  const envContent = `
# Rotowire Integration (DO NOT COMMIT!)
ROTOWIRE_USERNAME="${username}"
ROTOWIRE_PASSWORD_ENCRYPTED="${encryptedPassword}"
ROTOWIRE_ENCRYPTION_KEY="${encryptionKey}"
`;

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('\n⚠️  .env.local already exists. Add these lines manually:\n');
    console.log(envContent);
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Credentials saved to .env.local');
  }
  
  console.log('\n🔒 Security Notes:');
  console.log('- Never commit .env.local to git');
  console.log('- Add these same variables to Vercel dashboard');
  console.log('- Rotate credentials periodically');
  console.log('- Use read-only access when possible\n');
  
  rl.close();
}

main().catch(console.error);
