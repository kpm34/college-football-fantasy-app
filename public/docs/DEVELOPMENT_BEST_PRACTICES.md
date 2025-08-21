# Development Best Practices - College Football Fantasy App

## 🚨 Preventing Page Reversion Issues

### The Problem
When fixing multiple pages in sequence, earlier fixes sometimes revert to old versions. This happens because:
1. Changes aren't being committed incrementally
2. Multiple developers/sessions working on the same files
3. Vercel deployments from different commit states

### The Solution: Incremental Development Workflow

## ✅ Recommended Workflow

### 1. **Always Start Fresh**
```bash
git pull origin main
git status  # Ensure clean working tree
```

### 2. **Work on One Feature/Page at a Time**
```bash
# Before starting any work
git checkout -b feature/fix-locker-room  # Create feature branch

# Make your changes
# Test locally if possible

# Commit immediately after fixing
git add -A
git commit -m "fix: Update locker room UI"

# Push and merge
git push origin feature/fix-locker-room
# Then merge via GitHub PR or:
git checkout main
git merge feature/fix-locker-room
git push origin main
```

### 3. **For Multiple Page Fixes in One Session**
```bash
# Fix Page 1
git add app/path/to/page1.tsx
git commit -m "fix: Update page 1"

# Fix Page 2  
git add app/path/to/page2.tsx
git commit -m "fix: Update page 2"

# Push all commits together
git push origin main
```

## 🔍 Debugging Reversions

If a page reverts to an old version:

### 1. **Check File History**
```bash
# See what changed in a specific file
git log -p app/league/[leagueId]/locker-room/page.tsx

# See who changed what and when
git blame app/league/[leagueId]/locker-room/page.tsx
```

### 2. **Compare with Production**
```bash
# Check what's deployed
curl https://cfbfantasy.app/_next/static/chunks/[chunk-id].js

# Compare with local
git diff origin/main app/league/[leagueId]/locker-room/page.tsx
```

### 3. **Restore Lost Changes**
```bash
# Find the commit with the correct version
git log --oneline app/league/[leagueId]/locker-room/page.tsx

# Cherry-pick that specific commit
git cherry-pick [commit-hash]
```

## 🛡️ Prevention Strategies

### 1. **Use Feature Branches**
Never work directly on main. Always:
```bash
git checkout -b feature/description
# work...
git push origin feature/description
# Create PR, review, then merge
```

### 2. **Atomic Commits**
- One fix = one commit
- Clear commit messages
- Test before committing

### 3. **Regular Syncing**
```bash
# At start of each work session
git pull origin main

# Before making changes
git status
```

### 4. **Verify Deployments**
After pushing:
1. Check Vercel dashboard
2. Verify the deployed commit hash
3. Test the live site

## 📋 Quick Reference Checklist

Before starting work:
- [ ] `git pull origin main`
- [ ] `git status` (ensure clean)
- [ ] Create feature branch

After making changes:
- [ ] Test locally
- [ ] Commit with clear message
- [ ] Push to origin
- [ ] Verify deployment

## 🚀 Emergency Recovery

If production is broken:
```bash
# Find last known good commit
git log --oneline -20

# Revert to that commit
git revert [bad-commit-hash]
git push origin main

# Or force deploy specific commit in Vercel
vercel --prod --force
```

## 💡 Pro Tips

1. **Use VS Code Git Graph** extension to visualize branches
2. **Set up GitHub protection** for main branch
3. **Use Vercel preview deployments** for testing
4. **Keep commits small** - easier to revert if needed
5. **Document major changes** in commit messages

---

Remember: The key is to commit early, commit often, and always sync before starting new work!
