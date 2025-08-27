# Scripts Directory

This directory contains utility scripts for managing the College Football Fantasy App database schema and data.

## Available Scripts

### Schema Management

#### `fetch-appwrite-schema.ts`
Fetches the current schema from the live Appwrite database and saves it to `schema/appwrite-live-schema.json`.
```bash
npx tsx scripts/fetch-appwrite-schema.ts
```

#### `compare-schema-to-live.ts`
Compares the SSOT (Single Source of Truth) schema with the live Appwrite schema to identify differences.
```bash
npx tsx scripts/compare-schema-to-live.ts
```

#### `analyze-schema-updates.ts`
Analyzes schema changes and generates a report of required updates.
```bash
npx tsx scripts/analyze-schema-updates.ts
```

#### `analyze-draft-collections.ts`
Analyzes the draft-related collections for consistency and completeness.
```bash
npx tsx scripts/analyze-draft-collections.ts
```

#### `update-schema-table.ts`
Updates the schema table CSV file with the latest schema information.
```bash
npx tsx scripts/update-schema-table.ts
```

### Database Operations

#### `migrate-remaining-attributes.ts`
Migrates remaining attributes between collections when schema changes are made.
```bash
npx tsx scripts/migrate-remaining-attributes.ts
```

#### `update-appwrite-indexes.ts`
Updates Appwrite database indexes based on the current schema requirements.
```bash
npx tsx scripts/update-appwrite-indexes.ts
```

#### `update-index-references.ts`
Updates index references in the database to match schema changes.
```bash
npx tsx scripts/update-index-references.ts
```

### Utilities

#### `extract-schedule-to-json.ts`
Extracts game schedule data and saves it to JSON format for easier processing.
```bash
npx tsx scripts/extract-schedule-to-json.ts
```

#### `setup-fresh-cron-secret.ts`
Sets up or refreshes the CRON secret for scheduled jobs.
```bash
npx tsx scripts/setup-fresh-cron-secret.ts
```

## Usage Guidelines

1. **Always backup data** before running migration or update scripts
2. **Test in development** before running scripts in production
3. **Check schema differences** using `compare-schema-to-live.ts` before making changes
4. **Document changes** when adding new scripts

## Script Conventions

- Use TypeScript (`.ts` extension)
- Include error handling and logging
- Add comments explaining the script's purpose
- Use environment variables from `.env.local`
- Follow the existing naming convention: `action-target-description.ts`

## Cleanup History

On August 26, 2025, we removed 40+ single-use, temporary, and outdated scripts that were used for:
- One-time data migrations
- Debugging specific issues
- Testing functionality
- Fixing specific user data
- Adding individual attributes

The remaining scripts are general-purpose utilities that may be needed for ongoing maintenance.
