# ⚡ Quick Deploy Reference

## 🚀 **One-Command Deployment**
```bash
./deploy.sh deploy
```

## 📊 **Check Status**
```bash
./deploy.sh status
```

## 🧹 **Clean Up Old Deployments**
```bash
./deploy.sh clean
```

---

## 🌐 **Your App URLs**

### **Main App**
- **Production**: https://college-football-fantasy.vercel.app
- **Conference Showcase**: https://college-football-fantasy.vercel.app/conference-showcase
- **Test Colors**: https://college-football-fantasy.vercel.app/test-colors

---

## 📋 **Quick Commands**

### **Deploy**
```bash
# Production deployment
npx vercel --prod --yes

# Development deployment  
npx vercel --yes
```

### **Check**
```bash
# List projects
vercel project ls

# List deployments
vercel ls

# List domains
vercel domains ls
```

### **Clean**
```bash
# Remove old deployment
vercel remove --yes [deployment-url]
```

---

## 🏈 **Team Counts**
- **Big Ten**: 18 teams
- **SEC**: 16 teams  
- **Big 12**: 16 teams
- **ACC**: 17 teams

---

## 📚 **Full Documentation**
See `DEPLOYMENT_GUIDE.md` for complete details. 