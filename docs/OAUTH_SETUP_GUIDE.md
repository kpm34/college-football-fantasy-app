# OAuth Setup Guide for College Football Fantasy App

## Prerequisites
- Admin access to Appwrite Console
- Google Cloud Console account
- Apple Developer account (for Apple Sign-In)

## Step 1: Access Appwrite Console

1. Navigate to: https://nyc.cloud.appwrite.io
2. Login with your admin credentials
3. Select project: `college-football-fantasy-app`

## Step 2: Enable Google OAuth

### In Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**:
   - Go to APIs & Services → Library
   - Search for "Google+ API"
   - Click Enable

4. Create OAuth 2.0 Credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: Web application
   - Name: College Football Fantasy App

5. Configure Authorized Redirect URIs:
   ```
   https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app
   https://cfbfantasy.app/api/auth/oauth/callback
   https://collegefootballfantasy.app/api/auth/oauth/callback
   https://college-football-fantasy-app.vercel.app/api/auth/oauth/callback
   ```

6. Save and copy:
   - Client ID
   - Client Secret

### In Appwrite Console:

1. Navigate to **Auth** → **Settings** → **OAuth2 Providers**
2. Click on **Google** provider
3. Toggle **Enable** to ON
4. Enter:
   - **App ID**: [Your Google Client ID]
   - **App Secret**: [Your Google Client Secret]
5. Click **Update**

## Step 3: Enable Apple OAuth

### In Apple Developer Portal:

1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to Certificates, Identifiers & Profiles

3. Create App ID:
   - Click Identifiers → Add (+)
   - Select App IDs → Continue
   - Select App → Continue
   - Description: College Football Fantasy App
   - Bundle ID: app.cfbfantasy
   - Enable "Sign in with Apple" capability
   - Register

4. Create Service ID:
   - Click Identifiers → Add (+)
   - Select Services IDs → Continue
   - Description: College Football Fantasy Web
   - Identifier: app.cfbfantasy.web
   - Register
   - Click on the Service ID
   - Enable "Sign in with Apple"
   - Configure domains:
     - Primary domain: cfbfantasy.app
     - Return URLs:
       ```
       https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/apple/college-football-fantasy-app
       https://cfbfantasy.app/api/auth/oauth/callback
       https://collegefootballfantasy.app/api/auth/oauth/callback
       ```

5. Create Key:
   - Go to Keys → Add (+)
   - Key Name: College Football Fantasy Auth
   - Enable "Sign in with Apple"
   - Configure → Select your App ID
   - Register and Download the key file (.p8)
   - Note the Key ID

### In Appwrite Console:

1. Navigate to **Auth** → **Settings** → **OAuth2 Providers**
2. Click on **Apple** provider
3. Toggle **Enable** to ON
4. Enter:
   - **App ID**: [Your Service ID, e.g., app.cfbfantasy.web]
   - **App Secret**: [Contents of your .p8 key file]
   - **Team ID**: [Your Apple Team ID - found in Membership]
   - **Key ID**: [Your Key ID from step 5]
5. Click **Update**

## Step 4: Update Environment Variables

Add to your `.env.local`:

```bash
# OAuth Configuration
NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE=true
NEXT_PUBLIC_ENABLE_OAUTH_APPLE=true

# Optional: Store for reference (DO NOT commit)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_SERVICE_ID=app.cfbfantasy.web
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
```

## Step 5: Test OAuth Flow

1. Deploy changes:
   ```bash
   git add .
   git commit -m "Enable OAuth authentication"
   git push origin main
   vercel --prod
   ```

2. Test Google OAuth:
   - Go to https://cfbfantasy.app/login
   - Click "Sign in with Google"
   - Complete Google authentication
   - Verify redirect to dashboard

3. Test Apple OAuth:
   - Go to https://cfbfantasy.app/login
   - Click "Sign in with Apple"
   - Complete Apple authentication
   - Verify redirect to dashboard

## Troubleshooting

### Google OAuth Issues:
- Verify redirect URIs match exactly (including trailing slashes)
- Check Google+ API is enabled
- Ensure client ID and secret are correct
- Check browser console for errors

### Apple OAuth Issues:
- Verify Service ID matches configuration
- Ensure .p8 key content is properly formatted
- Check Team ID and Key ID are correct
- Verify domains are verified in Apple Developer

### General Issues:
- Clear browser cookies and cache
- Check Appwrite logs for errors
- Verify environment variables are set
- Ensure Appwrite session cookies are being set

## Security Notes

1. **Never commit OAuth secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** OAuth credentials
4. **Monitor** OAuth usage in provider dashboards
5. **Implement rate limiting** on OAuth endpoints

## Support

For issues with OAuth setup:
1. Check Appwrite documentation: https://appwrite.io/docs/client/account#accountCreateOAuth2Session
2. Review provider documentation (Google/Apple)
3. Check application logs in Vercel dashboard
4. Contact Appwrite support if needed
