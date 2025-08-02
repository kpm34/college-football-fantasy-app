# Vercel Token Deployment Guide

## Getting Your Vercel Token

1. **Go to Vercel Tokens Page**
   - Visit: https://vercel.com/account/tokens
   - Log in with your Vercel account

2. **Create New Token**
   - Click "Create Token"
   - Give it a name: "college-football-fantasy-deployment"
   - Set expiration (optional, but recommended for security)
   - Select scope: "Full Account" (for personal projects)
   - Click "Create"

3. **Copy Your Token**
   - Copy the token immediately (you won't see it again)
   - Store it securely

## Using the Token

### Method 1: Direct Command
```bash
./deploy-with-token.sh your-vercel-token-here
```

### Method 2: Environment Variable
```bash
export VERCEL_TOKEN="your-vercel-token-here"
./deploy-with-token.sh
```

### Method 3: .env.local File
Create `.env.local` in project root:
```
VERCEL_TOKEN=your-vercel-token-here
```

Then run:
```bash
source .env.local
./deploy-with-token.sh
```

## Deployment Commands

### Preview Deployment
```bash
vercel --token YOUR_TOKEN --yes
```

### Production Deployment
```bash
vercel --token YOUR_TOKEN --prod --yes
```

### With Team Account
```bash
vercel --token YOUR_TOKEN --scope TEAM_ID --yes
```

## Environment Variables Setup

After deployment, set these in Vercel Dashboard:

1. Go to: https://vercel.com/[your-username]/college-football-fantasy-app/settings/environment-variables

2. Add these variables:
   ```
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_DATABASE_ID=default
   CFBD_API_KEY=rEyNJxUagogtNdrndiKGMNjV03gRaVWr+hcTYDKbFXhzVR3V8WoCeUxo+h6S8okK
   REDIS_URL=redis://default:password@endpoint.upstash.io:port
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   ```

3. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Manual Token Deployment

If the script doesn't work, use these manual commands:

```bash
# 1. Navigate to project root
cd /Users/kashyapmaheshwari/college-football-fantasy-app

# 2. Install dependencies
cd frontend && npm install && cd ..

# 3. Deploy to preview
vercel --token YOUR_TOKEN --yes --name college-football-fantasy-app

# 4. Deploy to production
vercel --token YOUR_TOKEN --prod --yes --name college-football-fantasy-app
```

## Security Best Practices

1. **Never commit tokens** to Git
2. **Use expiring tokens** when possible
3. **Rotate tokens** regularly
4. **Use different tokens** for CI/CD vs manual deployments
5. **Revoke tokens** when no longer needed

## Troubleshooting

### "Invalid token" error
- Check token hasn't expired
- Ensure no extra spaces when copying
- Verify token has correct permissions

### "Project not found" error
- First deployment creates the project
- Use `--name` flag to specify project name

### Build failures
- Check `frontend/package.json` exists
- Verify Next.js builds locally: `cd frontend && npm run build`
- Check function syntax in `/api` directory

## CI/CD Integration

For GitHub Actions, add token as secret:
1. Go to repo Settings → Secrets → Actions
2. Add `VERCEL_TOKEN` secret
3. Use in workflow:
   ```yaml
   - name: Deploy to Vercel
     run: vercel --token ${{ secrets.VERCEL_TOKEN }} --prod --yes
   ```