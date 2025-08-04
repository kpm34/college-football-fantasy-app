# 🚀 College Football Fantasy App - Deployment Guide

## 📍 **Current Production URL**
**https://college-football-fantasy.vercel.app**

---

## 🎯 **Quick Deploy Commands**

### **Standard Deployment**
```bash
# From project root directory
npx vercel --prod --yes
```

### **Development Deployment**
```bash
# For testing changes
npx vercel --yes
```

---

## 🧹 **Domain Cleanup Commands**

### **List All Deployments**
```bash
vercel ls
```

### **Remove Old Deployments**
```bash
# Remove specific deployments
vercel remove --yes [deployment-url]

# Example:
vercel remove --yes https://college-football-fantasy-abc123-kpm34s-projects.vercel.app
```

### **List Projects**
```bash
vercel project ls
```

---

## 🔧 **Project Management**

### **Current Project Status**
- **Project Name**: `college-football-fantasy-app`
- **Production URL**: `https://college-football-fantasy.vercel.app`
- **Node Version**: 22.x
- **Framework**: Next.js 15.4.5

### **Project Structure**
```
college-football-fantasy-app/
├── frontend/                 # Main Next.js app
├── src/                     # Backend services
├── api/                     # Python APIs
└── workers/                 # Live scoring workers
```

---

## 📋 **Pre-Deployment Checklist**

### ✅ **Before Deploying**
1. **Test locally**: `cd frontend && npm run dev`
2. **Check for errors**: `npm run build`
3. **Verify team colors**: Visit `/test-colors` page
4. **Test conference pages**: Visit `/conference-showcase` and `/conference-showcase-2`

### ✅ **After Deploying**
1. **Verify main page**: https://college-football-fantasy.vercel.app
2. **Test conference showcase**: https://college-football-fantasy.vercel.app/conference-showcase
3. **Check team colors**: All teams should show proper colors
4. **Verify responsive design**: Test on mobile/tablet

---

## 🏈 **Conference Team Counts**

### **Big Ten (18 teams)**
- Michigan, Ohio State, Penn State, Michigan State
- Indiana, Maryland, Rutgers, UCLA, Washington
- Oregon, USC, Wisconsin, Iowa, Minnesota
- Nebraska, Northwestern, Purdue, Illinois

### **SEC (16 teams)**
- Georgia, Alabama, LSU, Texas, Florida
- Tennessee, Kentucky, South Carolina, Missouri
- Auburn, Ole Miss, Mississippi State, Arkansas
- Vanderbilt, Texas A&M

### **Big 12 (16 teams)**
- Texas, Oklahoma State, Kansas State, TCU
- Baylor, Texas Tech, West Virginia, Iowa State
- Cincinnati, Houston, UCF, BYU
- Arizona, Arizona State, Colorado, Utah

### **ACC (17 teams)**
- Florida State, Clemson, Miami, Louisville
- North Carolina, Virginia Tech, Duke, Wake Forest
- Boston College, NC State, Virginia, Georgia Tech
- Pittsburgh, Syracuse, California, Stanford, SMU

---

## 🔄 **Troubleshooting**

### **Common Issues**

#### **Build Errors**
```bash
# Clear cache and rebuild
rm -rf frontend/.next
cd frontend && npm run build
```

#### **Domain Issues**
```bash
# Check current domains
vercel domains ls

# Add custom domain
vercel domains add your-domain.vercel.app
```

#### **Deployment Failures**
```bash
# Check deployment status
vercel ls

# Remove failed deployments
vercel remove --yes [failed-deployment-url]
```

---

## 📱 **Testing Checklist**

### **Desktop Testing**
- [ ] Home page loads correctly
- [ ] Conference showcase pages display all teams
- [ ] Team colors are showing properly
- [ ] Navigation works between pages
- [ ] Responsive design works

### **Mobile Testing**
- [ ] Grid layout adapts to mobile
- [ ] Touch interactions work
- [ ] Text is readable on small screens
- [ ] Navigation is accessible

### **Performance Testing**
- [ ] Page load times are acceptable
- [ ] Images load properly
- [ ] No console errors
- [ ] Smooth animations

---

## 🎨 **Team Colors System**

### **Color Mapping**
- **Primary colors**: Team's main color
- **Secondary colors**: Accent color for text/borders
- **Fallback**: Default colors if team not found

### **Testing Colors**
- Visit: `/test-colors` page
- Check console logs for color matching
- Verify all teams have proper colors

---

## 📊 **Build Information**

### **Current Build Stats**
- **Total Routes**: 24
- **Static Pages**: 8
- **Dynamic Pages**: 16
- **Bundle Size**: ~99.6 kB shared
- **Build Time**: ~24 seconds

### **Key Routes**
- `/` - Home page
- `/conference-showcase` - Big Ten & SEC
- `/conference-showcase-2` - Big 12 & ACC
- `/test-colors` - Color testing page
- `/league/create` - League creation
- `/draft/[leagueId]` - Draft system

---

## 🔐 **Environment Variables**

### **Required Variables**
```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Optional APIs
CFBD_API_KEY=your-cfbd-key
```

---

## 📞 **Support Commands**

### **Vercel CLI Help**
```bash
# General help
vercel --help

# Project info
vercel project ls

# Deployment info
vercel ls

# Domain info
vercel domains ls
```

### **Local Development**
```bash
# Start development server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Check for issues
cd frontend && npm run lint
```

---

## 🎯 **Quick Reference**

### **One-Command Deployment**
```bash
npx vercel --prod --yes
```

### **Check Status**
```bash
vercel project ls
```

### **Clean Up Old Deployments**
```bash
vercel ls
vercel remove --yes [old-deployment-url]
```

---

**Last Updated**: August 3, 2025  
**Current Version**: Conference showcase with all Power 4 teams  
**Production URL**: https://college-football-fantasy.vercel.app 