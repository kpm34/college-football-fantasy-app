# OAuth Setup Guide for College Football Fantasy App

## Overview
This guide explains how to set up OAuth providers (Google and Apple) in your Appwrite console.

## Prerequisites
- Access to Appwrite Console
- Google Cloud Console account (for Google OAuth)
- Apple Developer account (for Apple Sign In)

## Setting up Google OAuth

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click Enable

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: College Football Fantasy App
   - **Authorized JavaScript origins**:
     ```
     https://cfbfantasy.app
     https://www.cfbfantasy.app
     https://collegefootballfantasy.app
     https://www.collegefootballfantasy.app
     https://nyc.cloud.appwrite.io
     ```
   - **Authorized redirect URIs**:
     ```
     https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app
     ```

5. Save and copy:
   - Client ID
   - Client Secret

### 3. Configure in Appwrite Console
1. Go to your Appwrite Console
2. Navigate to "Auth" > "Settings" > "OAuth2 Providers"
3. Enable Google provider
4. Enter:
   - **App ID**: Your Google Client ID
   - **App Secret**: Your Google Client Secret
5. Save

## Setting up Apple Sign In

### 1. Apple Developer Setup
1. Go to [Apple Developer](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create an App ID:
   - Click "Identifiers" > "+"
   - Select "App IDs" > "Continue"
   - Select "App" > "Continue"
   - Configure:
     - **Description**: College Football Fantasy
     - **Bundle ID**: app.cfbfantasy
     - Enable "Sign In with Apple"
   - Register

### 2. Create Service ID
1. Click "Identifiers" > "+"
2. Select "Services IDs" > "Continue"
3. Configure:
   - **Description**: College Football Fantasy Web
   - **Identifier**: app.cfbfantasy.web
4. Register
5. Click on the created Service ID
6. Enable "Sign In with Apple"
7. Click "Configure"
8. Configure Web Authentication:
   - **Primary App ID**: Select your App ID
   - **Domains and Subdomains**:
     ```
     cfbfantasy.app
     www.cfbfantasy.app
     collegefootballfantasy.app
     www.collegefootballfantasy.app
     nyc.cloud.appwrite.io
     ```
   - **Return URLs**:
     ```
     https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/apple/college-football-fantasy-app
     ```
9. Save

### 3. Create Private Key
1. Go to "Keys" > "+"
2. Configure:
   - **Key Name**: College Football Fantasy Auth Key
   - Enable "Sign In with Apple"
   - Select your Primary App ID
3. Continue > Register
4. Download the key file (.p8)
5. Note the Key ID

### 4. Configure in Appwrite Console
1. Go to your Appwrite Console
2. Navigate to "Auth" > "Settings" > "OAuth2 Providers"
3. Enable Apple provider
4. Enter:
   - **App ID**: Your Service ID (e.g., app.cfbfantasy.web)
   - **App Secret**: Generate using your Team ID, Key ID, and Private Key
   - **Team ID**: Found in Apple Developer account
   - **Key ID**: From the key you created
   - **P8 File**: Contents of your downloaded .p8 file
5. Save

## Testing OAuth

### Local Testing
For local development, you'll need to:
1. Use ngrok or similar to create HTTPS tunnel
2. Add the ngrok URL to OAuth provider settings
3. Update Appwrite platform settings

### Production Testing
1. Ensure all domains are added to Appwrite platform settings
2. Test login flow:
   - Click "Continue with Google/Apple"
   - Complete OAuth provider login
   - Verify redirect back to app
   - Check user is logged in

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Verify the redirect URI matches exactly in provider console
   - Check Appwrite project ID in the URI

2. **"Origin not allowed" error**
   - Add all domains to OAuth provider's authorized origins
   - Update Appwrite platform settings

3. **Session not persisting after OAuth**
   - Check cookies are being set properly
   - Verify domain settings in production

### Debug Checklist
- [ ] OAuth provider enabled in Appwrite Console
- [ ] Client ID/Secret correctly configured
- [ ] All domains added to provider's authorized list
- [ ] Appwrite platform settings include all domains
- [ ] HTTPS is used in production
- [ ] Cookies have correct domain/path settings

## Security Notes
- Never commit OAuth credentials to git
- Use environment variables for sensitive data
- Regularly rotate OAuth secrets
- Monitor OAuth usage in provider consoles
