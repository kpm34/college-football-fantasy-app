# Deployment Checklist

## 🚀 Pre-Deployment Checklist

### ✅ **Data Architecture (CRITICAL)**
- [ ] **Run data conflict resolution script**
  ```bash
  npx ts-node src/scripts/resolve-data-conflicts.ts
  ```
- [ ] **Verify all collections created in Appwrite**
  - [ ] users
  - [ ] players  
  - [ ] player_stats
  - [ ] transactions
  - [ ] draft_picks
  - [ ] id_mappings
- [ ] **Test ID mapping functionality**
- [ ] **Validate data integrity**

### ✅ **Frontend Configuration**
- [ ] **Single package.json** (frontend only)
- [ ] **Vercel configuration** (`vercel.json`)
- [ ] **Next.js configuration** (`frontend/next.config.ts`)
- [ ] **Environment variables** set in Vercel dashboard
- [ ] **All paths updated** to production URLs

### ✅ **Backend Configuration**
- [ ] **API endpoints** configured for production
- [ ] **CORS settings** updated for Vercel domain
- [ ] **Environment variables** configured
- [ ] **Database connections** tested

### ✅ **Static Files**
- [ ] **HTML files** copied to `frontend/public/`
- [ ] **League pages** accessible
- [ ] **Animation playground** working
- [ ] **PWA manifest** and service worker

## 🔧 Deployment Steps

### **Step 1: Resolve Data Conflicts**
```bash
# Run the conflict resolution script
npx ts-node src/scripts/resolve-data-conflicts.ts
```

### **Step 2: Commit Changes**
```bash
git add .
git commit -m "Fix data conflicts and prepare for Vercel deployment"
git push origin main
```

### **Step 3: Deploy to Vercel**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### **Step 4: Configure Environment Variables**
In Vercel Dashboard:
- `NEXT_PUBLIC_API_URL=https://cfbfantasy.app/api`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID=688ccd49002eacc6c020`
- `APPWRITE_API_KEY=your_api_key`
- `NODE_ENV=production`

## 🧪 Post-Deployment Testing

### **Frontend Tests**
- [ ] **Landing page loads** at `https://cfbfantasy.app/`
- [ ] **"Start a League" button** works → `/league/create`
- [ ] **"Join League" button** works → `/league/join`
- [ ] **"Mock Draft" button** works → `/draft/mock`
- [x] **Animation playground** removed (no longer needed)

### **API Tests**
- [ ] **Health check** → `/api/health`
- [ ] **Games endpoint** → `/api/games`
- [ ] **Rankings endpoint** → `/api/rankings`
- [ ] **Teams endpoint** → `/api/teams`

### **Data Flow Tests**
- [ ] **Appwrite collections** accessible
- [ ] **ID mapping** working correctly
- [ ] **Real-time updates** functioning
- [ ] **Draft system** operational

### **Performance Tests**
- [ ] **Page load times** < 3 seconds
- [ ] **API response times** < 100ms
- [ ] **Mobile responsiveness** working
- [ ] **PWA features** functional

## 🚨 Critical Issues to Fix

### **Before Deployment:**
1. **Data conflicts resolved** ✅
2. **Missing collections created** ✅
3. **ID mapping implemented** ✅
4. **Frontend paths updated** ✅
5. **Single package.json** ✅

### **After Deployment:**
1. **Environment variables** configured
2. **API endpoints** tested
3. **Data sync** verified
4. **Real-time features** working

## 📊 Monitoring Setup

### **Vercel Analytics**
- [ ] **Page views** tracking
- [ ] **Performance metrics** monitoring
- [ ] **Error tracking** enabled
- [ ] **Real-time logs** accessible

### **Data Health Monitoring**
- [ ] **Collection completeness** checks
- [ ] **ID mapping accuracy** validation
- [ ] **Sync job success rates** monitoring
- [ ] **API response times** tracking

## 🔄 Rollback Plan

### **If Issues Occur:**
1. **Revert to previous deployment** in Vercel
2. **Check environment variables** are correct
3. **Verify Appwrite collections** exist
4. **Test data integrity** manually
5. **Review error logs** for specific issues

## 📈 Success Metrics

### **Technical Metrics:**
- ✅ **Zero build errors**
- ✅ **All pages load successfully**
- ✅ **API endpoints respond**
- ✅ **Data flows correctly**

### **User Experience Metrics:**
- ✅ **Landing page loads in < 3s**
- ✅ **All buttons navigate correctly**
- ✅ **Draft system functional**
- ✅ **Real-time updates working**

## 🎯 Final Deployment Command

```bash
# Complete deployment sequence
npx ts-node src/scripts/resolve-data-conflicts.ts && \
git add . && \
git commit -m "Ready for production deployment" && \
git push origin main && \
vercel --prod
```

## 🎉 Deployment Complete!

Once all checklist items are verified:
- ✅ **Production URL**: `https://cfbfantasy.app/`
- ✅ **All features working**
- ✅ **Data integrity maintained**
- ✅ **Performance optimized**

Your College Football Fantasy App is now live! 🏈✨