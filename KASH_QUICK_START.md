# ⚡ Kash Migration - Quick Start

## 🚀 **One-Command Migration**
```bash
./migrate-to-kash.sh
```

## 📋 **Prerequisites (5 minutes)**

### **1. Create Kash Project**
1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Sign in to your **Kash** organization
3. Create new project: **"College Football Fantasy"**
4. Copy your **Project ID**

### **2. Get API Key**
1. In your Kash project → **Settings** → Copy **Project ID**
2. Go to **API Keys** → Create new key with these scopes:
   - `databases.read`, `databases.write`
   - `collections.read`, `collections.write`
   - `documents.read`, `documents.write`
   - `users.read`, `users.write`
   - `teams.read`, `teams.write`

### **3. Set Environment Variables**
```bash
export NEW_APPWRITE_PROJECT_ID=your_kash_project_id
export NEW_APPWRITE_API_KEY=your_kash_api_key
```

## 🗄️ **Create Database (2 minutes)**

### **1. Create Database**
- Go to **Databases** in Kash project
- Create database: `college-football-fantasy`

### **2. Create Collections**
Run this script to create all collections:
```bash
node src/scripts/setup-kash-database.js
```

## 🔄 **Run Migration**
```bash
./migrate-to-kash.sh
```

## ✅ **What Happens**
1. ✅ Tests Kash connection
2. ✅ Exports current data
3. ✅ Imports to Kash
4. ✅ Updates environment variables
5. ✅ Deploys to production

## 🌐 **Your App URLs**
- **Production**: https://college-football-fantasy.vercel.app
- **Conference Showcase**: https://college-football-fantasy.vercel.app/conference-showcase

## 📞 **Support**

### **Test Kash Connection**
```bash
node src/scripts/test-kash-connection.js
```

### **Manual Steps**
```bash
# Export current data
node src/scripts/export-current-data.js

# Import to Kash
node src/scripts/import-to-kash.js

# Deploy to production
./deploy.sh deploy
```

### **Check Migration Status**
```bash
./migrate-to-kash.sh help
```

---

**Total Time**: ~10 minutes  
**Risk Level**: Low (automatic backup)  
**Data Safety**: 100% (exports before migration) 