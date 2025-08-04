# 🧹 Test & Demo Files Cleanup Analysis

## 📊 Summary

Found **18 test/demo files** and **10 backup/old files** that can potentially be removed from your project.

## 🗂️ Test & Demo Files Analysis

### **Files Safe to Remove (High Confidence)**

#### **1. Duplicate Mock Draft Files**
- `./frontend/league/mock-draft.html` (23KB, Aug 1)
- `./frontend/public/league/mock-draft.html` (23KB, Aug 1)
- **Status**: Duplicate files, likely old mockups
- **Action**: Remove both (duplicates)

#### **2. Test Scripts (Development/Setup)**
- `./src/scripts/test-api-appwrite.ts` (2KB, Aug 1)
- `./src/scripts/test-appwrite-connection.ts` (3KB, Aug 2)
- `./src/scripts/test-all-apis.ts` (5.7KB, Aug 2)
- `./src/scripts/test-bigten-setup.ts` (7.2KB, Aug 2)
- `./src/scripts/test-bigten-mock.ts` (8.7KB, Aug 2)
- `./src/scripts/test-rotowire.ts` (2.9KB, Aug 2)
- `./src/scripts/test-player-data-collection.ts` (3.8KB, Aug 2)
- **Status**: Development setup and testing scripts
- **Action**: Remove (functionality now integrated)

#### **3. Test Players Script**
- `./src/scripts/add-test-players.ts` (5.8KB, Aug 2)
- **Status**: Test data population script
- **Action**: Remove (test data no longer needed)

#### **4. Frontend Test Integration**
- `./frontend/test-appwrite-integration.ts` (2.3KB, Aug 2)
- **Status**: Frontend integration test
- **Action**: Remove (integration now working)

#### **5. API Test Files**
- `./api/test_eligibility.py` (2.2KB, Aug 1)
- `./test_rankings_api.py` (3.3KB, Aug 1)
- `./test_rankings_refresh_local.py` (3KB, Aug 1)
- `./test_scoring.py` (13KB, Aug 1)
- **Status**: API testing scripts
- **Action**: Remove (APIs now functional)

#### **6. Service Test File**
- `./src/test-services.ts` (5.5KB, Aug 1)
- **Status**: Service testing file
- **Action**: Remove (services now integrated)

#### **7. Mock Data Script**
- `./src/scripts/seed-mock-big12-data.py` (10.6KB, Aug 2)
- **Status**: Mock data seeding script
- **Action**: Remove (real data now available)

### **Files to Review (Medium Confidence)**

#### **1. Nodemon Configuration**
- `./nodemon.json` (159B, Aug 1)
- **Status**: Development server configuration
- **Action**: Review - may still be needed for development

## 🗂️ Backup & Old Files Analysis

### **Environment Backup Files**
- `./.env.backup.20250802_223053`
- `./.env.backup.20250802_223108`
- `./.env.backup.before_fix`
- `./.env.backup.final`
- **Status**: Environment variable backups
- **Action**: Remove (environment now stable)

### **Next.js Cache Files**
- `./frontend/.next/cache/webpack/client-development-fallback/index.pack.gz.old`
- `./frontend/.next/cache/webpack/client-development/index.pack.gz.old`
- `./frontend/.next/cache/webpack/client-production/index.pack.old`
- `./frontend/.next/cache/webpack/server-development/index.pack.gz.old`
- `./frontend/.next/cache/webpack/server-production/index.pack.old`
- **Status**: Old webpack cache files
- **Action**: Remove (cache will regenerate)

## 📈 Impact Analysis

### **Space Savings**
- **Test/Demo Files**: ~85KB
- **Backup Files**: ~50KB
- **Cache Files**: ~200KB
- **Total Potential Savings**: ~335KB

### **Files to Remove (High Priority)**
```bash
# Test and demo files
rm ./frontend/league/mock-draft.html
rm ./frontend/public/league/mock-draft.html
rm ./src/scripts/test-api-appwrite.ts
rm ./src/scripts/test-appwrite-connection.ts
rm ./src/scripts/test-all-apis.ts
rm ./src/scripts/test-bigten-setup.ts
rm ./src/scripts/test-bigten-mock.ts
rm ./src/scripts/test-rotowire.ts
rm ./src/scripts/test-player-data-collection.ts
rm ./src/scripts/add-test-players.ts
rm ./frontend/test-appwrite-integration.ts
rm ./api/test_eligibility.py
rm ./test_rankings_api.py
rm ./test_rankings_refresh_local.py
rm ./test_scoring.py
rm ./src/test-services.ts
rm ./src/scripts/seed-mock-big12-data.py

# Backup files
rm ./.env.backup.*
rm ./frontend/.next/cache/webpack/*/*.old
```

### **Files to Review**
```bash
# Review these files before removal
ls -la ./nodemon.json
```

## 🚀 Cleanup Script

### **Safe Removal Script**
```bash
#!/bin/bash
echo "🧹 Starting test and demo file cleanup..."

# Create backup directory
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

echo "📦 Creating backup..."
# Backup files before removal
find . -type f \( -name "*test*" -o -name "*spec*" -o -name "*mock*" -o -name "*demo*" \) \
  -not -path "./node_modules/*" \
  -not -path "./frontend/node_modules/*" \
  -not -path "./src/node_modules/*" \
  -exec cp --parents {} $BACKUP_DIR \;

echo "🗑️ Removing test and demo files..."
# Remove test and demo files
find . -type f \( -name "*test*" -o -name "*spec*" -o -name "*mock*" -o -name "*demo*" \) \
  -not -path "./node_modules/*" \
  -not -path "./frontend/node_modules/*" \
  -not -path "./src/node_modules/*" \
  -delete

echo "🗑️ Removing backup files..."
# Remove backup files
find . -type f \( -name "*backup*" -o -name "*old*" \) \
  -not -path "./node_modules/*" \
  -not -path "./frontend/node_modules/*" \
  -not -path "./src/node_modules/*" \
  -delete

echo "✅ Cleanup completed! Backup saved to: $BACKUP_DIR"
```

### **Conservative Removal Script**
```bash
#!/bin/bash
echo "🧹 Starting conservative cleanup..."

# Only remove specific files that are definitely safe
SAFE_TO_REMOVE=(
  "./frontend/league/mock-draft.html"
  "./frontend/public/league/mock-draft.html"
  "./src/scripts/test-api-appwrite.ts"
  "./src/scripts/test-appwrite-connection.ts"
  "./src/scripts/test-all-apis.ts"
  "./src/scripts/test-bigten-setup.ts"
  "./src/scripts/test-bigten-mock.ts"
  "./src/scripts/test-rotowire.ts"
  "./src/scripts/test-player-data-collection.ts"
  "./src/scripts/add-test-players.ts"
  "./frontend/test-appwrite-integration.ts"
  "./api/test_eligibility.py"
  "./test_rankings_api.py"
  "./test_rankings_refresh_local.py"
  "./test_scoring.py"
  "./src/test-services.ts"
  "./src/scripts/seed-mock-big12-data.py"
)

# Create backup
BACKUP_DIR="./conservative-cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

echo "📦 Backing up files..."
for file in "${SAFE_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    cp --parents "$file" "$BACKUP_DIR"
    echo "Backed up: $file"
  fi
done

echo "🗑️ Removing files..."
for file in "${SAFE_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "Removed: $file"
  fi
done

echo "✅ Conservative cleanup completed! Backup saved to: $BACKUP_DIR"
```

## ✅ Recommendations

### **Immediate Actions**
1. **Remove all test/demo files** (17 files, ~85KB)
2. **Remove environment backup files** (4 files, ~50KB)
3. **Remove old cache files** (5 files, ~200KB)
4. **Review nodemon.json** before removal

### **Safety Measures**
1. **Create backup** before removal
2. **Test functionality** after cleanup
3. **Keep backup** for 30 days
4. **Monitor for issues** after removal

### **Expected Benefits**
- **Reduced clutter** in project structure
- **Faster searches** and navigation
- **Cleaner git history** (if committed)
- **Reduced confusion** for new developers
- **Smaller project size** (~335KB savings)

## 🎯 Next Steps

1. **Review the analysis** above
2. **Choose cleanup approach** (safe vs conservative)
3. **Run cleanup script** of your choice
4. **Test application** functionality
5. **Verify no issues** arise
6. **Remove backup** after 30 days if no issues

This cleanup will significantly reduce project clutter while maintaining all essential functionality. 