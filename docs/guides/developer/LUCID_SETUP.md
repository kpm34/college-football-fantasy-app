# Lucid Integration Setup - College Football Fantasy App

## Current Status: ✅ Credentials Configured

### OAuth Credentials (Active)
- **Client ID**: `isbAfTFU6lzGzC32Z5eHtilaUG8EyT4Uhupn9aLO`
- **Client Secret**: `TNH3CWDK4K8i_t94kAENFZUc-OerWma1UNxm15dyDoSz5-nnTmoiW6TiNa-9yABYxCzGt-kX5-ckJ_Kk9Mez`

### Configured Redirect URIs
- **Development**: `http://localhost:3001/api/lucid/callback`
- **Production**: `https://cfbfantasy.app/api/lucid/callback`

### Configured Embedding Domains
- **Development**: `http://localhost:3001`
- **Production**: `https://cfbfantasy.app`

## 3) Environment Variables
✅ Already added to `.env.local`. Add to Vercel Project Settings → Environment Variables:
```
LUCID_CLIENT_ID=
LUCID_CLIENT_SECRET=
LUCID_REDIRECT_URI=http://localhost:3001/api/lucid/oauth/callback
# Future optional:
LUCID_WEBHOOK_SECRET=
```

## 4) OAuth Flow (to implement later)
- Start URL: `/api/lucid/oauth/start` → redirect to Lucid authorize with scopes/state
- Callback: `/api/lucid/oauth/callback` → exchange code→access token, store server-side (encrypted)
- Token storage: Appwrite collection `integrations` (server-only), keyed by `authUserId`, provider=`lucid`
- Token refresh: background server action or on-demand with refresh_token flow

## 5) Basic Capabilities (for later phases)
- Document listing: search or list documents in folders (owner/team)
- Export: PNG/SVG/PDF export of pages for embedding into admin UI
- Data-link: optional—sync CSV/Sheets to diagram data (future)
- Embedding: use public share links or exported assets; avoid heavy live iframes in draft room

## 6) Security & Compliance
- Never expose tokens client-side; keep all calls server-side (API routes/functions)
- Rotate credentials if leaked; limit scopes to read/export only
- Log integration errors with context (without tokens)

## 7) Minimal API Route Plan (skeleton)
- `GET /api/lucid/me` → verify token, return account info (server)
- `GET /api/lucid/docs` → list docs (filter by folder/owner)
- `GET /api/lucid/export?doc=...&page=...&fmt=svg` → stream exported asset
- `GET /api/lucid/health` → simple ping to validate credentials/scopes

## 8) Admin UX Plan (reference-only)
- Admin dashboard: "Lucid" card with buttons: Connect (OAuth), List Docs, Export, Health
- Caching: cache exports in Vercel KV or object store; invalidate via admin action

## 9) Rollout Checklist
- [ ] API access approved
- [ ] OAuth app created (Client ID/Secret)
- [ ] Env vars added to Vercel
- [ ] Callback routes reserved (no-op placeholder ok)
- [ ] Token storage model finalized (Appwrite collection + encryption)
- [ ] Access policy confirmed (admin-only)

## References
- Lucid Developer Docs: https://developer.lucid.co/docs/welcome
- Example extensions: https://github.com/lucidsoftware/sample-lucid-extensions
- OAuth 2.0 overview: Authorization Code + Refresh Token
