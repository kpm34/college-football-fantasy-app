# PWA Testing Guide - College Football Fantasy

## 🎉 PWA Features Now Live!

Your College Football Fantasy app is now a Progressive Web App! Here's how to test the new features:

## 📱 Testing on Mobile (Recommended)

### iPhone/iPad (Safari)
1. Visit https://cfbfantasy.app on Safari
2. Tap the share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "CFB Fantasy" and tap "Add"
5. Open from your home screen - it runs full screen!

### Android (Chrome)
1. Visit https://cfbfantasy.app on Chrome
2. You'll see an install banner after 30 seconds
3. Tap "Install App"
4. Or tap the menu (3 dots) → "Add to Home screen"
5. Launch from home screen

## 💻 Testing on Desktop

### Chrome/Edge
1. Visit https://cfbfantasy.app
2. Look for the install icon in the address bar
3. Or wait 30 seconds for the install prompt
4. Click "Install" 
5. App opens in its own window!

## 🧪 Features to Test

### 1. Install Experience
- [ ] Install prompt appears after 30 seconds
- [ ] App installs successfully
- [ ] Launches from home screen/desktop
- [ ] No browser UI when launched

### 2. Offline Mode
1. Install the app
2. Turn on airplane mode
3. Try to navigate - you should see the offline page
4. Previously visited pages should still work
5. Turn internet back on - app should recover

### 3. App-Like Feel
- [ ] Theme color matches app branding (#8C1818)
- [ ] Splash screen shows on mobile
- [ ] Status bar styled correctly
- [ ] Smooth navigation without browser refreshes

### 4. Caching
1. Visit a few pages (dashboard, league, roster)
2. Check Network tab in DevTools
3. Refresh - static assets should say "(from cache)"
4. API calls cache for offline fallback

## 🔍 Debugging

### Chrome DevTools
1. Open https://cfbfantasy.app
2. Right-click → Inspect → Application tab
3. Check:
   - **Manifest**: Should show all app info
   - **Service Workers**: Should show "Activated"
   - **Cache Storage**: Should list cached assets
   - **Storage**: Check quota usage

### Lighthouse PWA Audit
1. Open DevTools → Lighthouse tab
2. Check only "Progressive Web App"
3. Run audit
4. Should score 90+ for PWA

## 📊 What's Working

✅ **Installable** - Add to home screen on all platforms
✅ **Offline Page** - Custom offline experience
✅ **Service Worker** - Caching and offline support
✅ **App Manifest** - Full PWA configuration
✅ **HTTPS** - Secure connection required for PWA
✅ **Responsive** - Works on all screen sizes

## 🚀 Coming Soon

- Push Notifications (draft alerts, score updates)
- Background Sync (queue actions offline)
- More offline features (view cached rosters)
- App shortcuts (quick actions from home screen)

## ⚠️ Known Limitations

- **iOS**: No push notifications (Apple limitation)
- **iOS**: No install prompt (must use share → add to home)
- **Icons**: Currently SVG placeholders (PNG coming soon)

## 🐛 Troubleshooting

### Install prompt not showing?
- Already installed? Check your apps
- Using iOS? Use Share → Add to Home Screen
- In incognito? Doesn't work there
- Already dismissed? Wait 7 days

### Service Worker not updating?
1. DevTools → Application → Service Workers
2. Check "Update on reload"
3. Click "Unregister" and refresh

### Offline not working?
1. Check if Service Worker is active
2. Clear cache and reinstall
3. Make sure you visited pages while online first

## 📱 Share Your Experience!

Found an issue or have feedback? Let us know!

The PWA makes CFB Fantasy feel like a real app - enjoy the faster loads, offline access, and one-tap launch from your home screen! 🏈
