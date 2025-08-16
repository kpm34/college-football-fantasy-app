#!/usr/bin/env node

/**
 * Wrapper script to run other Node.js scripts with fetch support
 * Usage: node scripts/run-with-fetch.js <script-to-run>
 */

// Ensure fetch is available
if (typeof global.fetch === 'undefined') {
  // For Node 18+, fetch should be native
  const nodeVersion = process.versions.node;
  const major = parseInt(nodeVersion.split('.')[0]);
  
  if (major < 18) {
    // Need polyfill for older Node versions
    try {
      const fetch = require('node-fetch');
      global.fetch = fetch;
      global.Headers = fetch.Headers;
      global.Request = fetch.Request;
      global.Response = fetch.Response;
      console.log('✓ node-fetch polyfill loaded');
    } catch (error) {
      console.error('Error: node-fetch is required for Node < 18');
      console.error('Run: npm install node-fetch@2');
      process.exit(1);
    }
  }
}

// Get the script to run from command line arguments
const scriptPath = process.argv[2];

if (!scriptPath) {
  console.error('Usage: node scripts/run-with-fetch.js <script-to-run>');
  process.exit(1);
}

// Run the target script
try {
  require(scriptPath);
} catch (error) {
  console.error(`Error running script: ${error.message}`);
  process.exit(1);
}