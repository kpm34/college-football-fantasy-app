# Vercel Environment Variables Setup

## Rotowire Integration Variables

Add these environment variables to your Vercel dashboard:

### 1. Go to Vercel Dashboard
- Navigate to your project settings
- Click on "Environment Variables" tab

### 2. Add Rotowire Variables

```bash
# Rotowire Username
ROTOWIRE_USERNAME="kashpm2002@gmail.com"

# Encrypted Password (keep this secure!)
ROTOWIRE_PASSWORD_ENCRYPTED="1eae963c008bcfb06244479b10624aa6:e515a145ac1d4032159867f3653f2fb9:d08ca9ab2786a54cac"

# Encryption Key (keep this secure!)
ROTOWIRE_ENCRYPTION_KEY="6504df254dada38bb3beaa7719156924d277db36a0c3ad8953f5bcf569e3f92f"
```

### 3. Variable Scopes
- Set all variables for: Production, Preview, and Development environments

### 4. Security Notes
- Never commit these values to git
- Rotate credentials periodically
- Use read-only access when possible
- Keep encryption key separate from encrypted data

### 5. Testing
After adding variables:
1. Redeploy your application
2. Test the endpoint: `GET /api/rotowire/news`
3. Check the Rotowire news component in the locker room

### 6. Troubleshooting
- If authentication fails, verify credentials are correct
- Check Vercel function logs for errors
- Ensure all three environment variables are set
- Test locally first with .env.local file
