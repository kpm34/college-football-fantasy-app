#!/usr/bin/env tsx
/**
 * Schema Documentation Generator
 * 
 * Automatically generates comprehensive documentation from the SSOT schema
 * Outputs markdown documentation with collection details, types, and relationships
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
// Use TS SSOT directly
import { COLLECTIONS, SCHEMA_REGISTRY } from '../../../schema/zod-schema';

interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  constraints: string[];
  description?: string;
}

interface CollectionInfo {
  name: string;
  key: string;
  fields: FieldInfo[];
  relationships: string[];
  description?: string;
  notes?: string[];
}

function extractZodFieldInfo(schema: z.ZodTypeAny, fieldName: string): FieldInfo {
  const constraints: string[] = [];
  let type = 'unknown';
  let required = true;

  if (schema instanceof z.ZodString) {
    type = 'string';
    if (schema._def.checks) {
      schema._def.checks.forEach(check => {
        if (check.kind === 'min') constraints.push(`min: ${check.value}`);
        if (check.kind === 'max') constraints.push(`max: ${check.value}`);
        if (check.kind === 'email') constraints.push('email format');
        if (check.kind === 'url') constraints.push('URL format');
      });
    }
  } else if (schema instanceof z.ZodNumber) {
    type = 'number';
    if (schema._def.checks) {
      schema._def.checks.forEach(check => {
        if (check.kind === 'min') constraints.push(`min: ${check.value}`);
        if (check.kind === 'max') constraints.push(`max: ${check.value}`);
        if (check.kind === 'int') constraints.push('integer');
      });
    }
  } else if (schema instanceof z.ZodBoolean) {
    type = 'boolean';
  } else if (schema instanceof z.ZodDate) {
    type = 'date';
  } else if (schema instanceof z.ZodEnum) {
    type = `enum: ${schema._def.values.join(' | ')}`;
  } else if (schema instanceof z.ZodOptional) {
    required = false;
    const innerInfo = extractZodFieldInfo(schema._def.innerType, fieldName);
    type = innerInfo.type;
    constraints.push(...innerInfo.constraints);
  } else if (schema instanceof z.ZodDefault) {
    const defaultValue = schema._def.defaultValue();
    const innerInfo = extractZodFieldInfo(schema._def.innerType, fieldName);
    type = innerInfo.type;
    constraints.push(...innerInfo.constraints);
    constraints.push(`default: ${JSON.stringify(defaultValue)}`);
  }

  return {
    name: fieldName,
    type,
    required,
    constraints
  };
}

function analyzeSchema(schema: z.ZodObject<any>): FieldInfo[] {
  const fields: FieldInfo[] = [];
  const shape = schema._def.shape();

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const fieldInfo = extractZodFieldInfo(fieldSchema as z.ZodTypeAny, fieldName);
    fields.push(fieldInfo);
  }

  return fields;
}

function detectRelationships(collectionName: string, fields: FieldInfo[]): string[] {
  const relationships: string[] = [];
  
  // Common relationship patterns
  const relationshipPatterns = [
    { field: 'userId', target: 'users' },
    { field: 'leagueId', target: 'leagues' },
    { field: 'playerId', target: 'college_players' },
    { field: 'gameId', target: 'games' },
    { field: 'rosterId', target: 'fantasy_teams' },
    { field: 'auctionId', target: 'auctions' },
    { field: 'commissioner', target: 'users' },
    { field: 'team', target: 'teams' }
  ];

  fields.forEach(field => {
    relationshipPatterns.forEach(pattern => {
      if (field.name === pattern.field) {
        relationships.push(`${field.name} → ${pattern.target}`);
      }
    });

    // Detect foreign key patterns
    if (field.name.endsWith('Id') && field.type === 'string') {
      const targetCollection = field.name.replace('Id', '').toLowerCase() + 's';
      if (Object.values(COLLECTIONS).includes(targetCollection as any)) {
        relationships.push(`${field.name} → ${targetCollection}`);
      }
    }
  });

  return [...new Set(relationships)]; // Remove duplicates
}

// Human-readable collection purposes and special notes
const PURPOSE_MAP: Record<string, string> = {
  clients: 'User profiles tied to Appwrite Auth (authUserId). Stores displayName, email, avatar, timestamps.',
  leagues: 'League configuration and metadata. Draft-specific state now lives in drafts.* collections.',
  league_memberships: 'Normalized membership records per user per league (role, status, joinedAt).',
  fantasy_teams: 'Fantasy teams per league. Created for each member; stores teamName, ownerAuthUserId, record, logo.',
  drafts: 'Authoritative draft room configuration and status (order, rounds, timers, participants).',
  draft_states: 'Append-only or rolling draft state snapshots for recovery/observability (status, on-clock, deadline).',
  draft_events: 'Immutable event log (pick/autopick/undo/pause/resume) for audit and UI streams.',
  auctions: 'Auction draft sessions and current bidding state.',
  bids: 'Auction bid history linked to auctions.',
  lineups: 'Weekly starting lineups and bench for a roster/team in a league.',
  matchups: 'Head-to-head matchups per week with scores and status.',
  player_stats: 'Per-game or aggregated player statistics used for scoring and projections.',
  projections: 'Projection outputs, inputs, and computed fantasy points (weekly/yearly).',
  model_runs: 'Model run metadata for reproducibility (versions, metrics, status).',
  college_players: 'Player master dataset (name, position, team, conference, eligibility).',
  games: 'Schedule and results, including kickoff time and status.',
  rankings: 'Poll rankings (AP/Coaches) for eligibility and display.',
  invites: 'Invite codes/tokens to join leagues with optional expiration and email.',
  activity_log: 'Operational audit trail of actions in the system.',
  meshy_jobs: '3D/asset generation jobs and status tracking.',
  migrations: 'Applied schema/data migrations.'
};

const NOTES_MAP: Record<string, string[]> = {
  league_memberships: [
    'When a user creates or joins a league, a corresponding fantasy_teams document is created for them.',
    'commissionerAuthUserId (in leagues) is also represented as role=COMMISSIONER in league_memberships.'
  ],
  leagues: [
    'Draft order in leagues is deprecated; drafts.draftOrder is the source of truth.',
    'selectedConference and gameMode are immutable after creation.'
  ],
  drafts: [
    'One draft per league. Use drafts for timer, order, and status; do not rely on leagues for draft state.'
  ],
  fantasy_teams: [
    'ownerAuthUserId links back to clients.authUserId.',
    'teamName is required and shown across draft UIs (recent picks/order).'
  ],
  draft_states: [
    'draftId corresponds to the leagueId (one draft per league).'
  ],
  draft_events: [
    'Used for real-time feeds and audit; do not mutate existing events.'
  ]
};

function generateCollectionDocs(): CollectionInfo[] {
  const collections: CollectionInfo[] = [];

  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    const schema = SCHEMA_REGISTRY[collectionName as keyof typeof SCHEMA_REGISTRY];
    
    if (schema && schema instanceof z.ZodObject) {
      const fields = analyzeSchema(schema);
      const relationships = detectRelationships(collectionName, fields);
      const description = PURPOSE_MAP[collectionName] || undefined;
      const notes = NOTES_MAP[collectionName] || undefined;

      collections.push({
        name: collectionName,
        key,
        fields,
        relationships,
        description,
        notes
      });
    }
  }

  return collections;
}

function generateMarkdown(collections: CollectionInfo[]): string {
  const timestamp = new Date().toISOString();
  
  let markdown = `# Schema Documentation

**Generated from SSOT**: \`schema/zod-schema.ts\`  
**Generated at**: ${timestamp}  
**Collections**: ${collections.length}

This documentation is automatically generated from the Single Source of Truth schema.

---

## Table of Contents

${collections.map(col => `- [${col.name}](#${col.name.replace(/_/g, '')})`).join('\n')}

---

`;

  // Generate collection documentation
  collections.forEach(collection => {
    markdown += `## ${collection.name}

**Key**: \`${collection.key}\`  
**Fields**: ${collection.fields.length}

${collection.description ? `**Purpose**: ${collection.description}\n\n` : ''}

${collection.notes && collection.notes.length > 0 ? `**Notes**:\n${collection.notes.map(n => `- ${n}`).join('\n')}\n\n` : ''}

${collection.name === 'league_memberships' ? `**Data Flow**:\n- Create/Join League → create \`league_memberships\` (role, status, joinedAt)\n- Create/Join League → create \`fantasy_teams\` with \`ownerAuthUserId\` and \`teamName\`\n- Commissioner is represented by \`commissionerAuthUserId\` in \`leagues\` and role=COMMISSIONER in \`league_memberships\`\n\n` : ''}

### Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
`;

    collection.fields.forEach(field => {
      const constraints = field.constraints.length > 0 ? field.constraints.join(', ') : '-';
      markdown += `| \`${field.name}\` | ${field.type} | ${field.required ? '✅' : '❌'} | ${constraints} |\n`;
    });

    if (collection.relationships.length > 0) {
      markdown += `\n### Relationships

`;
      collection.relationships.forEach(rel => {
        markdown += `- ${rel}\n`;
      });
    }

    markdown += '\n---\n\n';
  });

  // Add schema statistics
  markdown += `## Schema Statistics

- **Total Collections**: ${collections.length}
- **Total Fields**: ${collections.reduce((sum, col) => sum + col.fields.length, 0)}
- **Total Relationships**: ${collections.reduce((sum, col) => sum + col.relationships.length, 0)}
- **Required Fields**: ${collections.reduce((sum, col) => sum + col.fields.filter(f => f.required).length, 0)}
- **Optional Fields**: ${collections.reduce((sum, col) => sum + col.fields.filter(f => !f.required).length, 0)}

### Field Type Distribution

`;

  // Calculate field type distribution
  const typeDistribution: Record<string, number> = {};
  collections.forEach(col => {
    col.fields.forEach(field => {
      const baseType = field.type.split(':')[0];
      typeDistribution[baseType] = (typeDistribution[baseType] || 0) + 1;
    });
  });

  Object.entries(typeDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      markdown += `- **${type}**: ${count} fields\n`;
    });

  markdown += `\n---

## SSOT Benefits

✅ **Single Source of Truth**: All schemas defined in one place  
✅ **Type Safety**: Automatic TypeScript type generation  
✅ **Runtime Validation**: Built-in data validation functions  
✅ **Build Guards**: Automatic drift detection and validation  
✅ **Documentation**: Auto-generated documentation (this file)

---

*This documentation is automatically updated when the schema changes.*
`;

  return markdown;
}

function main() {
  console.log('📚 Schema Documentation Generator');
  console.log('=================================');
  
  try {
    // Generate collection information
    const collections = generateCollectionDocs();
    console.log(`📊 Analyzed ${collections.length} collections`);

    // Generate markdown documentation
    const markdown = generateMarkdown(collections);
    
    // Ensure docs directory exists
    const docsDir = join(process.cwd(), 'docs');
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    // Write documentation
    const outputPath = join(docsDir, 'SCHEMA_DOCUMENTATION.md');
    writeFileSync(outputPath, markdown, 'utf-8');

    console.log(`✅ Documentation generated: ${outputPath}`);
    console.log(`📋 Total fields documented: ${collections.reduce((sum, col) => sum + col.fields.length, 0)}`);
    console.log(`🔗 Total relationships mapped: ${collections.reduce((sum, col) => sum + col.relationships.length, 0)}`);
    
  } catch (error: any) {
    console.error('❌ Documentation generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateCollectionDocs, generateMarkdown };