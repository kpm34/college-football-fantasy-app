# Merge Strategy - Local vs GitHub

## Current Situation
- **Local Branch**: Has newer frontend structure moved to root level (no `/frontend` directory)
- **GitHub Remote**: Has 50 commits ahead with OAuth, projections, mock draft features
- **Main Conflict**: Directory structure reorganization

## Key Differences

### 1. Directory Structure
- **Local**: Frontend files moved to root (app/, components/, lib/, etc. at root level)
- **Remote**: Still has frontend/ directory structure

### 2. New Features on Remote (to preserve)
- Server-side OAuth for Google and Apple
- Advanced CFB projection system  
- Mock draft with Appwrite integration
- CFBD projections integration
- Secure server-side authentication

### 3. Files to Clean Up (Local)
- Removed many documentation files (.md files)
- Removed conference rosters PDFs
- Removed old frontend/ directory
- Added new root-level Next.js structure

## Merge Strategy

### Step 1: Create a clean merge branch
```bash
git checkout -b merge-cleanup
git pull origin main
```

### Step 2: Apply directory restructure
- Move all frontend/* files to root
- Update import paths
- Update build scripts

### Step 3: Preserve new features
- Keep OAuth implementations
- Keep projection systems
- Keep mock draft features
- Keep API improvements

### Step 4: Files to handle

#### Keep from Remote (GitHub):
- New API routes for OAuth
- Projection system files
- Mock draft components
- Server-side auth improvements

#### Keep from Local:
- Root-level Next.js structure
- Cleaned up file organization
- Removed unnecessary docs

#### Conflicts to resolve manually:
- package.json (merge dependencies)
- tsconfig.json (update paths)
- next.config.ts (merge configurations)
- Vercel deployment settings

## Next Steps
1. Pull remote changes
2. Apply directory restructure
3. Test locally
4. Update Appwrite collections if needed
5. Update Vercel settings
6. Push merged version