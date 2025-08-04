# 🚀 Kash Organization Migration Guide

## 📋 **Migration Overview**

This guide will help you migrate your College Football Fantasy App from your current Appwrite project to your new "Kash" organization.

---

## 🎯 **Step 1: Create New Kash Project**

### **1.1 Create New Project**
1. Go to [Appwrite Cloud](https://cloud.appwrite.io)
2. Sign in to your Kash organization
3. Create a new project named **"College Football Fantasy"**
4. Note down your new **Project ID**

### **1.2 Get New API Keys**
1. In your new Kash project, go to **Settings**
2. Copy your new **Project ID**
3. Go to **API Keys** and create a new API key with these scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `documents.read`
   - `documents.write`
   - `users.read`
   - `users.write`
   - `teams.read`
   - `teams.write`

---

## 🗄️ **Step 2: Create Database Structure**

### **2.1 Create Database**
1. Go to **Databases** in your Kash project
2. Create a new database named `college-football-fantasy`

### **2.2 Create Collections**

#### **teams Collection**
```json
{
  "school": "string (required)",
  "mascot": "string",
  "abbreviation": "string",
  "conference": "string (required)",
  "conferenceId": "integer",
  "color": "string",
  "altColor": "string",
  "logo": "url",
  "power_4": "boolean",
  "lastUpdated": "datetime"
}
```

#### **games Collection**
```json
{
  "season": "integer (required)",
  "week": "integer (required)",
  "seasonType": "string (required)",
  "startDate": "datetime (required)",
  "homeTeam": "string (required)",
  "homeConference": "string",
  "homePoints": "integer (default: 0)",
  "awayTeam": "string (required)",
  "awayConference": "string",
  "awayPoints": "integer (default: 0)",
  "status": "string (required)",
  "period": "integer",
  "clock": "string",
  "isConferenceGame": "boolean",
  "isEligible": "boolean",
  "lastUpdated": "datetime"
}
```

#### **rankings Collection**
```json
{
  "season": "integer (required)",
  "week": "integer (required)",
  "poll": "string (required)",
  "rankings": "string[] (required)",
  "lastUpdated": "datetime"
}
```

#### **players Collection**
```json
{
  "name": "string (required)",
  "school": "string (required)",
  "position": "string (required)",
  "conference": "string (required)",
  "espnId": "string",
  "cfbdId": "string",
  "projections": "string (JSON)",
  "stats": "string (JSON)",
  "lastUpdated": "datetime"
}
```

#### **leagues Collection**
```json
{
  "name": "string (required)",
  "commissioner": "string (required)",
  "season": "integer (required)",
  "scoringType": "string (default: PPR)",
  "maxTeams": "integer (default: 12)",
  "draftDate": "datetime",
  "status": "string (default: pre-draft)",
  "lastUpdated": "datetime"
}
```

#### **rosters Collection**
```json
{
  "leagueId": "string (required)",
  "teamId": "string (required)",
  "ownerId": "string (required)",
  "players": "string[] (JSON array)",
  "lastUpdated": "datetime"
}
```

---

## 🔄 **Step 3: Data Migration**

### **3.1 Export Current Data**
```bash
# Run this script to export current data
node src/scripts/export-current-data.js
```

### **3.2 Import to Kash**
```bash
# Run this script to import to Kash
node src/scripts/import-to-kash.js
```

---

## ⚙️ **Step 4: Update Environment Variables**

### **4.1 Backup Current Variables**
```bash
# Backup current .env
cp .env .env.backup
```

### **4.2 Update .env File**
```env
# New Kash Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_new_kash_project_id
APPWRITE_API_KEY=your_new_kash_api_key

# Keep other variables
CFBD_API_KEY=your_cfbd_key
```

---

## 🧪 **Step 5: Test Migration**

### **5.1 Test Database Connection**
```bash
# Test Kash connection
node src/scripts/test-kash-connection.js
```

### **5.2 Verify Data**
1. Check teams collection has all Power 4 teams
2. Verify games data is intact
3. Confirm rankings are current
4. Test player data access

---

## 🚀 **Step 6: Deploy Updated App**

### **6.1 Update Configuration**
```bash
# Update Appwrite config
nano src/config/appwrite.config.ts
```

### **6.2 Deploy to Production**
```bash
# Deploy with new Kash config
./deploy.sh deploy
```

---

## 📊 **Migration Checklist**

### **Pre-Migration**
- [ ] Create Kash organization project
- [ ] Set up new API keys
- [ ] Create database structure
- [ ] Backup current data
- [ ] Test Kash connection

### **During Migration**
- [ ] Export current data
- [ ] Import to Kash
- [ ] Verify data integrity
- [ ] Update environment variables
- [ ] Test all functionality

### **Post-Migration**
- [ ] Deploy updated app
- [ ] Test production deployment
- [ ] Verify all features work
- [ ] Monitor for errors
- [ ] Update documentation

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Connection Errors**
```bash
# Check Kash credentials
echo $APPWRITE_PROJECT_ID
echo $APPWRITE_API_KEY
```

#### **Data Import Errors**
```bash
# Check collection permissions
# Verify API key scopes
# Test individual collections
```

#### **Deployment Issues**
```bash
# Clear Vercel cache
vercel --force

# Check environment variables
vercel env ls
```

---

## 📞 **Support Commands**

### **Test Kash Connection**
```bash
node -e "
const { Client, Databases } = require('node-appwrite');
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
databases.listCollections(process.env.APPWRITE_PROJECT_ID, 'college-football-fantasy')
  .then(collections => console.log('✅ Kash connection successful:', collections.collections.length, 'collections'))
  .catch(err => console.error('❌ Kash connection failed:', err));
"
```

### **Verify Data Migration**
```bash
# Check teams count
node -e "
const { Client, Databases } = require('node-appwrite');
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
databases.listDocuments(process.env.APPWRITE_PROJECT_ID, 'college-football-fantasy', 'teams')
  .then(docs => console.log('Teams in Kash:', docs.documents.length))
  .catch(err => console.error('Error:', err));
"
```

---

## 🎯 **Success Criteria**

### **Migration Complete When:**
- [ ] All collections created in Kash
- [ ] All data migrated successfully
- [ ] App connects to Kash without errors
- [ ] Production deployment works
- [ ] All features functional
- [ ] No data loss

---

**Next Steps:**
1. Create your Kash project
2. Follow the migration steps
3. Test thoroughly
4. Deploy to production

**Need Help?** Check the troubleshooting section or run the support commands. 