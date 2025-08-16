# Fix for "fetch is not defined" Error

## Quick Solutions

### Solution 1: Update Node.js (Recommended)
```bash
# Check your Node version
node --version

# If less than 18, update using nvm:
nvm install 20
nvm use 20
nvm alias default 20
```

### Solution 2: Use the fetch fix script
```bash
# Run this before your script
node scripts/fix-fetch.js

# Or wrap your script execution
node scripts/run-with-fetch.js <your-script>
```

### Solution 3: Install node-fetch polyfill
```bash
# Install node-fetch v2 (for CommonJS compatibility)
npm install node-fetch@2

# Then add to the top of your script:
# const fetch = require('node-fetch');
# global.fetch = fetch;
```

### Solution 4: Use tsx instead of node
```bash
# tsx handles modern features better
npx tsx your-script.ts

# Or install globally
npm install -g tsx
tsx your-script.ts
```

### Solution 5: For Next.js API routes
If the error is in Next.js API routes, ensure you're running:
```bash
npm run dev
# NOT node directly on the API files
```

## Common Scenarios

### Running Appwrite scripts
```bash
# Instead of:
node scripts/appwrite-user-enhancements.ts

# Use:
npx tsx scripts/appwrite-user-enhancements.ts
# Or:
npm run enhance:appwrite
```

### Running migration scripts
```bash
# Use the npm scripts defined in package.json:
npm run migrate:auth-users
npm run migrate:commissioner
```

### Running sync scripts
```bash
# Use npm scripts:
npm run schema:sync
npm run schema:pull
```

## Environment-specific fix

Add this to the top of any script that needs fetch:
```javascript
// For TypeScript files (.ts)
if (typeof global.fetch === 'undefined') {
  const fetch = require('node-fetch');
  global.fetch = fetch as any;
  global.Headers = fetch.Headers as any;
  global.Request = fetch.Request as any;
  global.Response = fetch.Response as any;
}

// For JavaScript files (.js)
if (typeof global.fetch === 'undefined') {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
  global.Request = fetch.Request;
  global.Response = fetch.Response;
}
```

## Permanent Fix for Desktop Setup

On your desktop, ensure you have:
1. Node.js 18+ installed
2. Run scripts using `npm run` commands, not direct `node`
3. Use `tsx` for TypeScript files instead of `node`

## Test if fetch is working:
```bash
# Run this test
node -e "console.log(typeof fetch !== 'undefined' ? '✅ Fetch is available' : '❌ Fetch not found')"
```

If you're still having issues, the error might be from:
- A specific library that needs updating
- Running scripts in the wrong directory
- Missing environment variables

## Debug the exact error:
```bash
# Add this to find where the error occurs
NODE_OPTIONS='--trace-warnings' npm run <your-command>
```