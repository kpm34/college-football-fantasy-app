#!/usr/bin/env node

/**
 * Fix for "fetch is not defined" error in Node.js
 * This script adds fetch globally if it's not available
 */

// Check Node version
const nodeVersion = process.versions.node;
const major = parseInt(nodeVersion.split('.')[0]);

console.log(`Node.js version: ${nodeVersion}`);

// Node 18+ has native fetch, but sometimes it needs to be enabled
if (major >= 18) {
  // Native fetch should be available
  if (typeof global.fetch === 'undefined') {
    console.log('Native fetch not found, despite Node 18+. This might be a configuration issue.');
    console.log('Try running with: node --experimental-fetch your-script.js');
  } else {
    console.log('✓ Native fetch is available');
  }
} else {
  // Node < 18 needs a polyfill
  console.log('Node version < 18 detected. Installing node-fetch polyfill...');
  
  try {
    const fetch = require('node-fetch');
    if (!global.fetch) {
      global.fetch = fetch;
      global.Headers = fetch.Headers;
      global.Request = fetch.Request;
      global.Response = fetch.Response;
    }
    console.log('✓ node-fetch polyfill installed');
  } catch (error) {
    console.log('node-fetch not installed. Run: npm install node-fetch@2');
  }
}

// Test fetch
if (typeof global.fetch !== 'undefined') {
  console.log('\n✅ Fetch is now available globally');
  console.log('\nYou can now use fetch() in your scripts.');
} else {
  console.log('\n❌ Fetch is still not available');
  console.log('\nTry one of these solutions:');
  console.log('1. Update to Node.js 18 or later: nvm install 18');
  console.log('2. Install node-fetch: npm install node-fetch@2');
  console.log('3. Use axios instead: npm install axios');
}

// Export for use in other scripts
module.exports = {
  setupFetch: function() {
    if (typeof global.fetch === 'undefined') {
      try {
        const fetch = require('node-fetch');
        global.fetch = fetch;
        global.Headers = fetch.Headers;
        global.Request = fetch.Request;
        global.Response = fetch.Response;
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  }
};