# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **Environment Variables**: Have all required API keys ready

## Deployment Steps

### 1. Install Vercel CLI (Recommended)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
# From the college-football-fantasy-app directory
vercel

# Or for production deployment
vercel --prod
```

### 4. First-Time Setup Prompts
When deploying for the first time, Vercel will ask:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No** (unless you already created one)
- Project name? **college-football-fantasy-app** (or your choice)
- Directory? **./** (current directory)
- Override settings? **No**

### 5. Configure Environment Variables

#### Option A: Via Vercel Dashboard
1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=default
CFBD_API_KEY=your-cfbd-api-key
REDIS_URL=redis://default:password@endpoint.upstash.io:port
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

#### Option B: Via CLI
```bash
# Add each environment variable
vercel env add APPWRITE_ENDPOINT
vercel env add APPWRITE_PROJECT_ID
# ... repeat for all variables
```

### 6. Verify Python Functions
Vercel automatically detects Python files in `/api` directory. Ensure:
- `api/requirements.txt` exists with dependencies
- Python files use correct handler format
- Functions are using Python 3.9 runtime (configured in vercel.json)

### 7. Verify Cron Job
The rankings refresh cron job is configured to run:
- Every Tuesday at 6:00 AM UTC
- Path: `/api/rankings_refresh`
- Check Vercel dashboard → Functions → Cron Jobs

## Project Structure for Vercel

```
college-football-fantasy-app/
├── api/                    # Serverless Functions
│   ├── eligibility.py     # Player eligibility API
│   ├── rankings_refresh.py # AP Top-25 updater (cron)
│   └── requirements.txt   # Python dependencies
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── vercel.json           # Vercel configuration
├── .vercelignore         # Files to ignore
└── .env.example          # Environment template
```

## Deployment Configuration

### vercel.json Settings
- **Build**: Runs `npm install && npm run build` in frontend/
- **Output**: Uses frontend/.next directory
- **Framework**: Next.js
- **Region**: iad1 (US East)
- **Functions**: Python 3.9 runtime, 10s timeout
- **Cron**: Weekly rankings update

## Post-Deployment Checklist

- [ ] Frontend loads at your-app.vercel.app
- [ ] Test `/api/eligibility/123456/1` endpoint
- [ ] Verify environment variables are set
- [ ] Check function logs in Vercel dashboard
- [ ] Confirm cron job is scheduled
- [ ] Test real-time features (if Appwrite is configured)

## Troubleshooting

### Frontend Not Building
- Check `frontend/package.json` exists
- Verify Next.js build succeeds locally: `cd frontend && npm run build`

### API Functions Not Working
- Check Python syntax is valid
- Verify requirements.txt includes all dependencies
- Check function logs in Vercel dashboard
- Test locally: `vercel dev`

### Environment Variables Not Loading
- Ensure variables are set for correct environment (Production/Preview/Development)
- NEXT_PUBLIC_ variables need rebuild after changes
- Non-public variables are only available server-side

### Cron Job Not Running
- Check timezone (runs in UTC)
- Verify function works when called directly
- Check cron job logs in Vercel dashboard

## Local Development

```bash
# Install dependencies
cd frontend && npm install

# Run development server
vercel dev

# This will:
# - Start Next.js on port 3000
# - Run API functions on same port
# - Load environment variables from .env.local
```

## Production Deployment

```bash
# Deploy to production
vercel --prod

# Or via Git integration
git push origin main  # Auto-deploys if connected
```

## Custom Domain

1. Go to Settings → Domains in Vercel dashboard
2. Add your domain (e.g., collegefootballfantasy.com)
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

## Monitoring

- **Functions**: Monitor at vercel.com/[your-project]/functions
- **Analytics**: Enable Web Analytics in project settings
- **Logs**: Real-time logs available in dashboard
- **Alerts**: Set up notifications for function errors

## Cost Optimization

- Functions have 10s timeout (adjust if needed)
- Cron jobs count toward function executions
- Use ISR (Incremental Static Regeneration) for data pages
- Enable Edge Functions for better performance

## Security Notes

- Never commit `.env` files
- Use Vercel environment variables for secrets
- API routes are publicly accessible (add authentication if needed)
- CORS is handled automatically for same-origin requests