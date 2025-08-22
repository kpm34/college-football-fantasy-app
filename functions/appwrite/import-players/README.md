# import-players (Appwrite Function)

- Trigger: manual or HTTP webhook
- Env: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID
- Input: { season: number, conference?: string }
- Output: { ok: boolean, imported: number }

Local test:
```bash
npx tsx functions/appwrite/import-players/local.ts
```
