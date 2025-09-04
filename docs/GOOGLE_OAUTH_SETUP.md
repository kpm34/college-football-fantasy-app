# Google OAuth Setup Guide

## Overview
This guide provides step-by-step instructions for configuring Google OAuth with Appwrite for the College Football Fantasy App.

## Prerequisites
- Google Cloud Console access
- Appwrite Console access
- Environment variables configured

## Step 1: Google Cloud Console Configuration

### 1.1 OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure:
   - **User Type**: External
   - **App Name**: College Football Fantasy App
   - **Support Email**: Your email
   - **App Domain**: https://cfbfantasy.app
   - **Authorized Domains**: cfbfantasy.app
   - **Scopes**: email, profile (minimum required)

### 1.2 OAuth 2.0 Client ID
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure:
   - **Application Type**: Web application
   - **Name**: CFB Fantasy App - Production

### 1.3 Authorized Redirect URIs
Add these exact URIs (CRITICAL - must match exactly):
```
https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google
http://localhost:3001/dashboard
http://localhost:3001/login
https://cfbfantasy.app/dashboard
https://cfbfantasy.app/login
```

## Step 2: Appwrite Console Configuration

### 2.1 Enable Google OAuth Provider
1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select project: **college-football-fantasy-app**
3. Navigate to **Auth** → **Settings** → **OAuth2 Providers**
4. Click on **Google**
5. Enable the provider

### 2.2 Add Google Credentials
From your Google OAuth client, copy and paste:
- **App ID**: Your OAuth 2.0 Client ID
- **App Secret**: Your OAuth 2.0 Client Secret

### 2.3 Verify Redirect URI
Appwrite should show:
```
https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google
```
This MUST be in your Google Console redirect URIs.

## Step 3: Application Implementation

### 3.1 Environment Variables
Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy
```

### 3.2 OAuth Flow
The app uses a simplified OAuth flow:
1. User clicks "Continue with Google" button
2. `GoogleAuthButton` component calls `account.createOAuth2Session()`
3. User is redirected to Google for authentication
4. After success, Google redirects to Appwrite
5. Appwrite creates session and redirects to dashboard
6. Session is automatically available via cookies

### 3.3 Component Usage
```tsx
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

// In your login page:
<GoogleAuthButton />
```

## Step 4: Testing

### 4.1 Local Testing
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:3001/login
3. Click "Continue with Google"
4. Complete Google authentication
5. Verify redirect to dashboard

### 4.2 Production Testing
1. Deploy to Vercel: `vercel --prod`
2. Navigate to https://cfbfantasy.app/login
3. Test OAuth flow
4. Verify session persistence

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error
- **Cause**: URI in request doesn't match Google Console
- **Fix**: Add exact URI to Google Console redirect URIs
- **Note**: URIs are case-sensitive and must match protocol (http/https)

#### 2. "Invalid project ID" Error
- **Cause**: Mismatch between client project ID and Appwrite
- **Fix**: Verify `NEXT_PUBLIC_APPWRITE_PROJECT_ID` matches Appwrite project

#### 3. Session Not Persisting
- **Cause**: Cookie domain issues
- **Fix**: Ensure `sameSite` and `secure` settings match environment

#### 4. "OAuth provider not configured" Error
- **Cause**: Google OAuth not enabled in Appwrite
- **Fix**: Enable in Appwrite Console → Auth → OAuth2 Providers

### Debug Commands
```bash
# Test OAuth configuration
node ops/test-google-oauth-simple.js

# Check environment variables
npm run env:check

# View Appwrite logs (if self-hosted)
docker logs appwrite
```

## Security Notes
1. **Never** commit OAuth secrets to git
2. Use environment variables for all sensitive data
3. Ensure production uses HTTPS only
4. Regularly rotate OAuth client secrets
5. Monitor OAuth consent screen for suspicious activity

## Production Checklist
- [ ] Google OAuth consent screen published (not in test mode)
- [ ] All production URLs in redirect URIs
- [ ] Environment variables set in Vercel
- [ ] HTTPS enforced on all URLs
- [ ] Error handling for OAuth failures
- [ ] User feedback for authentication states
- [ ] Session expiry handling

## Support
For issues:
1. Check Appwrite logs in console
2. Review browser console for errors
3. Verify all URLs match exactly
4. Test with incognito/private browsing
5. Clear cookies and try again

---
Last Updated: January 2025