# Vercel Deployment Guide

## 🚀 Deploying to Vercel

Your College Football Fantasy App is now configured for deployment on Vercel at:
**https://college-football-fantasy-app.vercel.app/**

## 📋 Updated Configuration

### ✅ **All Paths Updated**

#### **Main Landing Page Buttons:**
- **"Start a League"** → `https://college-football-fantasy-app.vercel.app/league/create`
- **"Join League"** → `https://college-football-fantasy-app.vercel.app/league/join`
- **"🎯 Mock Draft Now"** → `https://college-football-fantasy-app.vercel.app/draft/mock`
- **"🎯 Mock Draft"** → `https://college-football-fantasy-app.vercel.app/draft/test`

#### **API Endpoints:**
- **Base URL**: `https://college-football-fantasy-app.vercel.app/api`
- **Health Check**: `https://college-football-fantasy-app.vercel.app/api/health`
- **Games**: `https://college-football-fantasy-app.vercel.app/api/games`
- **Rankings**: `https://college-football-fantasy-app.vercel.app/api/rankings`
- **Teams**: `https://college-football-fantasy-app.vercel.app/api/teams`

## 🔧 Vercel Configuration

### **vercel.json**
```json
{
  "version": 2,
  "name": "college-football-fantasy-app",
  "builds": [
    {
      "src": "frontend/**/*",
      "use": "@vercel/static"
    },
    {
      "src": "src/api/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/src/api/server.ts"
    },
    {
      "src": "/league/(.*)",
      "dest": "/frontend/league/$1.html"
    },
    {
      "src": "/draft/(.*)",
      "dest": "/frontend/league/$1.html"
    },
    {
      "src": "/animation-playground",
      "dest": "/frontend/animation-playground.html"
    }
  ]
}
```

## 🌐 Environment Variables

### **Required for Production:**
```bash
NEXT_PUBLIC_API_URL=https://college-football-fantasy-app.vercel.app/api
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=688ccd49002eacc6c020
NODE_ENV=production
```

### **Optional:**
```bash
APPWRITE_API_KEY=your_appwrite_api_key
CFBD_API_KEY=your_cfbd_api_key
```

## 📁 File Structure for Vercel

```
college-football-fantasy-app/
├── vercel.json                    # Vercel configuration
├── frontend/                      # Static files
│   ├── index.html                 # Main landing page
│   ├── animation-playground.html  # Animation testing
│   ├── league/                    # League pages
│   │   ├── start-league.html
│   │   ├── join-league.html
│   │   └── mock-draft.html
│   └── public/                    # Static assets
│       ├── manifest.json
│       └── service-worker.js
└── src/
    └── api/
        └── server.ts              # API server
```

## 🚀 Deployment Steps

### **1. Connect to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **2. Set Environment Variables**
In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables listed above

### **3. Configure Custom Domain (Optional)**
1. Go to Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain

## 🔗 Available Routes

### **Main Pages:**
- `/` - Landing page
- `/league/create` - Start a new league
- `/league/join` - Join existing league
- `/draft/mock` - Mock draft simulator
- `/animation-playground` - Animation testing

### **API Endpoints:**
- `/api/health` - Health check
- `/api/games` - Get games data
- `/api/rankings` - Get AP rankings
- `/api/teams` - Get team data

### **Static Assets:**
- `/manifest.json` - PWA manifest
- `/service-worker.js` - Service worker

## 🎯 Testing Your Deployment

### **1. Test Landing Page**
Visit: `https://college-football-fantasy-app.vercel.app/`

### **2. Test All Buttons**
- Click "Start a League" → Should go to `/league/create`
- Click "Join League" → Should go to `/league/join`
- Click "Mock Draft" → Should go to `/draft/mock`
- Click "Animation Playground" → Should go to `/animation-playground`

### **3. Test API Endpoints**
```bash
curl https://college-football-fantasy-app.vercel.app/api/health
curl https://college-football-fantasy-app.vercel.app/api/games
curl https://college-football-fantasy-app.vercel.app/api/rankings
```

### **4. Test PWA Features**
- Check if manifest loads: `/manifest.json`
- Check if service worker loads: `/service-worker.js`
- Test offline functionality

## 🔧 Troubleshooting

### **Common Issues:**

1. **404 Errors**
   - Check `vercel.json` routing configuration
   - Verify file paths are correct
   - Check Vercel build logs

2. **API Not Working**
   - Verify environment variables are set
   - Check API server logs
   - Test API endpoints directly

3. **Static Files Not Loading**
   - Check file permissions
   - Verify file paths in `vercel.json`
   - Check build output

4. **CORS Issues**
   - Verify CORS configuration in `server.ts`
   - Check if Vercel domain is in allowed origins

### **Debug Commands:**
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## 📊 Monitoring

### **Vercel Analytics:**
- Page views and performance
- API response times
- Error rates
- User behavior

### **Custom Monitoring:**
- API health checks
- Error logging
- Performance metrics

## 🎉 Success Checklist

- [ ] Landing page loads correctly
- [ ] All buttons navigate to correct pages
- [ ] API endpoints respond properly
- [ ] PWA features work (manifest, service worker)
- [ ] Animations work in playground
- [ ] League pages load correctly
- [ ] Mock draft page works
- [ ] Mobile responsiveness
- [ ] Performance is acceptable

## 🔄 Continuous Deployment

### **Automatic Deployments:**
- Push to main branch → Automatic deployment
- Pull requests → Preview deployments
- Environment variables → Secure and encrypted

### **Manual Deployments:**
```bash
vercel --prod
```

Your College Football Fantasy App is now ready for production on Vercel! 🏈✨ 