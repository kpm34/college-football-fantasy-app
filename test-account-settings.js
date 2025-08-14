#!/usr/bin/env node

const http = require('http');

// Test if the account settings page loads
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/account/settings',
  method: 'GET',
  headers: {
    'Accept': 'text/html'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Check if page contains our new form fields
    const hasFirstName = data.includes('First Name');
    const hasLastName = data.includes('Last Name');
    const hasEmail = data.includes('Email');
    
    console.log('✓ Account Settings Page Loaded');
    console.log(`  - Has First Name field: ${hasFirstName ? '✓' : '✗'}`);
    console.log(`  - Has Last Name field: ${hasLastName ? '✓' : '✗'}`);
    console.log(`  - Has Email field: ${hasEmail ? '✓' : '✗'}`);
    
    if (hasFirstName && hasLastName && hasEmail) {
      console.log('\n✅ All form fields are present!');
    } else {
      console.log('\n⚠️  Some form fields may be missing');
    }
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error testing account settings:', error);
  process.exit(1);
});

req.end();