# Cursor Commands (Schema & Env)

- Generate everything from SSOT:
  - npm run generate:all
- Sync Appwrite schema from SSOT (simple):
  - npx tsx scripts/sync-appwrite-simple.ts
- Seed Appwrite database (collections/attributes/indexes):
  - node schema/generators/seed-appwrite.ts
- Validate SSOT integrity + guardrails:
  - npx tsx scripts/guards/validate-ssot-integrity.ts
  - npx tsx scripts/guards/forbid-legacy-collections.ts

Notes:
- Required attributes cannot have defaults in Appwrite; make optional and default-in-code or always supply values.