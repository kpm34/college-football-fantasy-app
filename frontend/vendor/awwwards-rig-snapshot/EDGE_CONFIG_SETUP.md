# Edge Config Setup Guide

## Quick Start

### 1. Run Setup Script
```bash
./scripts/setup-edge-config.sh
```

### 2. Manual Setup (if script fails)

#### Create Edge Config Store
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: `awwwards-rig`
3. Navigate to **Storage** → **Create Database** → **Edge Config**
4. Name it: `app-config`
5. Click **Connect to Project**

#### Add Initial Flags
Copy from `/MEMORY/edge-config-template.json`:
```json
{
  "enableWebGL": true,
  "heroVariant": "3d",
  "chatEnabled": true,
  "webglQuality": "high",
  "maintenanceMode": false
}
```

#### Pull Environment Variables
```bash
# Pull for local development
vercel env pull .env.local

# Optional: Pull other environments
vercel env pull .env.preview.local --environment=preview
vercel env pull .env.production.local --environment=production
```

### 3. Verify Setup
```bash
# Start dev server
npm run dev

# Test Edge Config API
curl http://localhost:3000/api/edge-config
```

## Troubleshooting

### EDGE_CONFIG not found
If you see "EDGE_CONFIG environment variable is missing":

1. Ensure Edge Config is created in Vercel Dashboard
2. Check it's connected to your project
3. Run: `vercel env pull .env.local`
4. Restart your dev server

### Connection errors
If Edge Config can't connect:

1. Verify the connection string format:
   ```
   EDGE_CONFIG=https://edge-config.vercel.com/<token>?<params>
   ```
2. Check network connectivity
3. Ensure you're logged into Vercel CLI: `vercel login`

## Usage

### In React Components
```typescript
import { useFeatureFlags } from '@/lib/feature-flags'

function MyComponent() {
  const { flags, loading } = useFeatureFlags()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      WebGL: {flags?.enableWebGL ? 'Enabled' : 'Disabled'}
    </div>
  )
}
```

### In API Routes
```typescript
import { getFlag } from '@/lib/feature-flags'

export async function GET() {
  const isEnabled = await getFlag('chatEnabled')
  
  if (!isEnabled) {
    return new Response('Chat disabled', { status: 503 })
  }
  
  // ... rest of API logic
}
```

### In Middleware
```typescript
import { getFlag } from '@/lib/feature-flags'

export async function middleware(request: NextRequest) {
  const maintenanceMode = await getFlag('maintenanceMode')
  
  if (maintenanceMode) {
    return new Response('Maintenance', { status: 503 })
  }
  
  return NextResponse.next()
}
```

## Feature Flag Reference

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `enableWebGL` | boolean | true | Enable/disable 3D graphics |
| `heroVariant` | string | "3d" | Hero section variant (3d/static/video) |
| `chatEnabled` | boolean | true | Enable/disable AI chat |
| `webglQuality` | string | "high" | Graphics quality (low/medium/high/ultra) |
| `maintenanceMode` | boolean | false | Site-wide maintenance mode |
| `apiRateLimitMultiplier` | number | 1 | Rate limit multiplier |

## Live Updates

Changes to Edge Config propagate globally in ~300ms without deployment:

1. Go to Vercel Dashboard → Storage → Edge Config
2. Edit values directly in the UI
3. Changes apply immediately to all environments

## Environment-Specific Configs

Create different Edge Config stores for each environment:

- `app-config-dev` for development
- `app-config-preview` for preview
- `app-config-prod` for production

Then set different `EDGE_CONFIG` values per environment in Vercel.