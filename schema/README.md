# College Football Fantasy - Schema Management

This directory contains the **Single Source of Truth** for all database schemas, types, and validation rules.

## 🎯 Schema-First Architecture

All database structures, TypeScript types, and validation logic are defined here using Zod schemas, then automatically synchronized to Appwrite.

## 📁 Files Overview

### Core Schema Files
- **`schema.ts`** - Comprehensive schema definitions with full Appwrite metadata
- **`zod-schema.ts`** - Zod-first type definitions and validation utilities  
- **`zod-collections.ts`** - Simplified Zod schemas (your preferred pattern)

### Validation & Sync
- **`../core/validation/schema-enforcer.ts`** - Runtime validation and data transformation
- **`../scripts/sync-appwrite-schema.ts`** - Comprehensive schema sync (from schema.ts)
- **`../scripts/sync-appwrite-simple.ts`** - Simple schema sync (from zod-collections.ts)

## 🚀 Quick Commands

```bash
# Validate all schemas are consistent
npm run schema:validate

# Sync schema to Appwrite (comprehensive)
npm run schema:sync-ssot

# Sync schema to Appwrite (simple - from zod-collections.ts)
npx tsx scripts/sync-appwrite-simple.ts

# Traditional Appwrite CLI sync
npm run schema:sync
```

## 🔄 Data Flow

```
Schema Definition → Validation → Database → TypeScript Types
       ↓              ↓            ↓           ↓
   schema.ts    →  Zod Rules  →  Appwrite  →  Inferred Types
```

## ✅ Schema Compliance

The system enforces that all data mutations go through:

1. **Schema Validation** - Data must match canonical schema
2. **Data Transformation** - Automatic conversion (JSON strings, etc.)  
3. **Database Operation** - Clean, validated data stored
4. **Cache Invalidation** - Related caches cleared

## 🛠 Adding New Collections

### Method 1: Comprehensive (Recommended for Production)

1. Add collection to `schema.ts` with full metadata:
   ```typescript
   export const SCHEMA = {
     my_new_collection: {
       id: 'my_new_collection',
       name: 'My New Collection',
       attributes: [
         { key: 'name', type: 'string', required: true, size: 100 }
       ],
       indexes: [
         { key: 'name_idx', type: 'fulltext', attributes: ['name'] }
       ],
       permissions: { read: ['any'], write: ['role:user'] }
     }
   }
   ```

2. Run sync: `npm run schema:sync-ssot`

### Method 2: Simple (For Rapid Prototyping)

1. Add to `zod-collections.ts`:
   ```typescript
   export const MyNewCollection = z.object({
     name: z.string().min(1)
   });
   
   export const COLLECTIONS = {
     my_new_collection: MyNewCollection
   };
   ```

2. Add to `sync-appwrite-simple.ts` and run: `npx tsx scripts/sync-appwrite-simple.ts`

## 🔒 Validation Benefits

- **Type Safety**: All DB operations validated against schema
- **Data Integrity**: Prevents field type mismatches  
- **Developer Experience**: Clear validation errors
- **Single Source**: Schema drives everything
- **CI Integration**: Automatic validation in GitHub Actions

## 🚨 Important Notes

- **Always run validation** before deploying schema changes
- **The schema is the source of truth** - not the database
- **All repositories automatically validate** data against schemas
- **Changes to schema files trigger CI validation**

## 📋 CI/CD Integration

The `.github/workflows/schema-sync.yml` workflow:
- ✅ Validates schema compliance on all PRs
- 🔄 Syncs to Appwrite on main branch changes
- 💬 Comments on PRs with sync status

Your Appwrite database schema is now **always in sync** with your codebase! 🎉