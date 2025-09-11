#!/usr/bin/env tsx
/**
 * Generate API Routing Maps
 * Analyzes Next.js routes, API handlers, and Appwrite functions
 * Creates comprehensive diagrams showing data flow
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

const ROOT = process.cwd()

interface Route {
  type: 'page' | 'api' | 'action' | 'function'
  path: string
  file: string
  method?: string
  collections?: string[]
  externalAPIs?: string[]
}

interface ExternalProvider {
  name: string
  modules: string[]
  collections: string[]
  endpoints: string[]
}

// Collection name patterns to detect in code
const COLLECTION_PATTERNS = [
  'leagues',
  'league_memberships', 
  'fantasy_teams',
  'clients',
  'schools',
  'college_players',
  'player_stats',
  'games',
  'rankings',
  'projections',
  'model_runs',
  'model_versions',
  'drafts',
  'draft_states',
  'draft_events',
  'roster_slots',
  'lineups',
  'matchups',
  'transactions',
  'auctions',
  'bids',
  'invites',
  'activity_log'
]

// External API patterns
const EXTERNAL_API_PATTERNS = {
  CFBD: ['collegefootballdata.com', 'cfbd', 'CFBD_API'],
  ESPN: ['espn.com', 'ESPN_API', 'espn/'],
  Rotowire: ['rotowire.com', 'ROTOWIRE', 'rotowire/'],
  Meshy: ['meshy.ai', 'MESHY_API', 'meshy/'],
  Google: ['google.com/auth', 'googleapis', 'OAuth2'],
  Weather: ['weather.gov', 'openweathermap', 'weather/'],
  Runway: ['runwayml.com', 'RUNWAY_API', 'runway/'],
  Anthropic: ['anthropic.com', 'ANTHROPIC', 'claude'],
  OpenAI: ['openai.com', 'OPENAI', 'gpt']
}

async function findRoutes(): Promise<Route[]> {
  const routes: Route[] = []
  
  // Find Next.js pages
  const pages = await glob('app/**/page.tsx', { cwd: ROOT })
  for (const page of pages) {
    const content = fs.readFileSync(path.join(ROOT, page), 'utf-8')
    const routePath = page
      .replace('app/', '/')
      .replace('/page.tsx', '')
      .replace(/\[([^\]]+)\]/g, ':$1')
    
    routes.push({
      type: 'page',
      path: routePath === '/page.tsx' ? '/' : routePath,
      file: page,
      collections: detectCollections(content),
      externalAPIs: detectExternalAPIs(content)
    })
  }
  
  // Find API routes
  const apiRoutes = await glob('app/api/**/route.ts', { cwd: ROOT })
  for (const api of apiRoutes) {
    const content = fs.readFileSync(path.join(ROOT, api), 'utf-8')
    const routePath = api
      .replace('app/', '/')
      .replace('/route.ts', '')
      .replace(/\[([^\]]+)\]/g, ':$1')
    
    // Detect HTTP methods
    const methods = []
    if (content.includes('export async function GET')) methods.push('GET')
    if (content.includes('export async function POST')) methods.push('POST')
    if (content.includes('export async function PUT')) methods.push('PUT')
    if (content.includes('export async function DELETE')) methods.push('DELETE')
    if (content.includes('export async function PATCH')) methods.push('PATCH')
    
    for (const method of methods) {
      routes.push({
        type: 'api',
        path: routePath,
        file: api,
        method,
        collections: detectCollections(content),
        externalAPIs: detectExternalAPIs(content)
      })
    }
  }
  
  // Find server actions
  const actions = await glob('app/**/*.ts?(x)', { cwd: ROOT })
  for (const action of actions) {
    const content = fs.readFileSync(path.join(ROOT, action), 'utf-8')
    if (content.includes('"use server"') || content.includes("'use server'")) {
      // Extract function names
      const functionMatches = content.matchAll(/export\s+async\s+function\s+(\w+)/g)
      for (const match of functionMatches) {
        routes.push({
          type: 'action',
          path: `action:${match[1]}`,
          file: action,
          collections: detectCollections(content),
          externalAPIs: detectExternalAPIs(content)
        })
      }
    }
  }
  
  // Find Appwrite functions
  const functions = await glob('functions/appwrite/**/index.ts', { cwd: ROOT })
  for (const func of functions) {
    const content = fs.readFileSync(path.join(ROOT, func), 'utf-8')
    const funcName = func.split('/')[2] // functions/appwrite/[name]/index.ts
    
    routes.push({
      type: 'function',
      path: `function:${funcName}`,
      file: func,
      collections: detectCollections(content),
      externalAPIs: detectExternalAPIs(content)
    })
  }
  
  return routes
}

function detectCollections(content: string): string[] {
  const found = new Set<string>()
  
  // Detect Appwrite SDK calls
  const patterns = [
    /databases\.createDocument\([^,]+,\s*['"`](\w+)['"`]/g,
    /databases\.listDocuments\([^,]+,\s*['"`](\w+)['"`]/g,
    /databases\.getDocument\([^,]+,\s*['"`](\w+)['"`]/g,
    /databases\.updateDocument\([^,]+,\s*['"`](\w+)['"`]/g,
    /databases\.deleteDocument\([^,]+,\s*['"`](\w+)['"`]/g,
    /COLLECTION_(\w+)/g,
    /collection:\s*['"`](\w+)['"`]/g
  ]
  
  for (const pattern of patterns) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const collection = match[1].toLowerCase()
      if (COLLECTION_PATTERNS.includes(collection)) {
        found.add(collection)
      }
    }
  }
  
  // Also check for collection name strings
  for (const collection of COLLECTION_PATTERNS) {
    if (content.includes(`'${collection}'`) || 
        content.includes(`"${collection}"`) ||
        content.includes(`\`${collection}\``)) {
      found.add(collection)
    }
  }
  
  return Array.from(found)
}

function detectExternalAPIs(content: string): string[] {
  const found = new Set<string>()
  
  for (const [api, patterns] of Object.entries(EXTERNAL_API_PATTERNS)) {
    for (const pattern of patterns) {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        found.add(api)
        break
      }
    }
  }
  
  return Array.from(found)
}

function generateRoutesMarkdown(routes: Route[]): string {
  let md = '# API Routes Map\n\n'
  md += '## Overview\n'
  md += `Total routes analyzed: ${routes.length}\n\n`
  
  // Mermaid diagram
  md += '## Data Flow Diagram\n\n'
  md += '```mermaid\n'
  md += 'graph LR\n'
  md += '  subgraph "Frontend"\n'
  
  // Pages
  const pages = routes.filter(r => r.type === 'page')
  pages.forEach((page, i) => {
    md += `    P${i}[${page.path}]\n`
  })
  
  md += '  end\n\n'
  md += '  subgraph "API Layer"\n'
  
  // API routes
  const apis = routes.filter(r => r.type === 'api')
  apis.forEach((api, i) => {
    md += `    A${i}[${api.method} ${api.path}]\n`
  })
  
  md += '  end\n\n'
  md += '  subgraph "Server Actions"\n'
  
  // Server actions
  const actions = routes.filter(r => r.type === 'action')
  actions.forEach((action, i) => {
    md += `    SA${i}[${action.path}]\n`
  })
  
  md += '  end\n\n'
  md += '  subgraph "Appwrite Functions"\n'
  
  // Functions
  const functions = routes.filter(r => r.type === 'function')
  functions.forEach((func, i) => {
    md += `    F${i}[${func.path}]\n`
  })
  
  md += '  end\n\n'
  md += '  subgraph "Data Layer"\n'
  
  // Collections
  const allCollections = new Set<string>()
  routes.forEach(r => r.collections?.forEach(c => allCollections.add(c)))
  Array.from(allCollections).forEach((col, i) => {
    md += `    C${i}[${col}]\n`
  })
  
  md += '  end\n\n'
  
  // Add connections
  pages.forEach((page, pi) => {
    apis.forEach((api, ai) => {
      if (page.file.includes(api.path.split('/').pop() || '')) {
        md += `  P${pi} --> A${ai}\n`
      }
    })
  })
  
  // Connect APIs to collections
  apis.forEach((api, ai) => {
    api.collections?.forEach(col => {
      const ci = Array.from(allCollections).indexOf(col)
      if (ci >= 0) {
        md += `  A${ai} --> C${ci}\n`
      }
    })
  })
  
  md += '```\n\n'
  
  // Routes table
  md += '## Routes Detail\n\n'
  md += '| Type | Path | Method | Collections | External APIs | File |\n'
  md += '|------|------|--------|-------------|---------------|------|\n'
  
  routes.forEach(route => {
    md += `| ${route.type} | ${route.path} | ${route.method || '-'} | ${route.collections?.join(', ') || '-'} | ${route.externalAPIs?.join(', ') || '-'} | ${route.file} |\n`
  })
  
  return md
}

function generateExternalProvidersMarkdown(routes: Route[]): string {
  let md = '# External Providers Map\n\n'
  
  const providers: Record<string, ExternalProvider> = {}
  
  // Build provider data
  routes.forEach(route => {
    route.externalAPIs?.forEach(api => {
      if (!providers[api]) {
        providers[api] = {
          name: api,
          modules: [],
          collections: [],
          endpoints: []
        }
      }
      
      if (!providers[api].modules.includes(route.file)) {
        providers[api].modules.push(route.file)
      }
      
      route.collections?.forEach(col => {
        if (!providers[api].collections.includes(col)) {
          providers[api].collections.push(col)
        }
      })
    })
  })
  
  md += '## Provider Overview\n\n'
  md += '```mermaid\n'
  md += 'graph TB\n'
  
  Object.entries(providers).forEach(([name, provider]) => {
    md += `  ${name}[${name}]\n`
    provider.modules.forEach((mod, i) => {
      const modName = mod.split('/').pop()?.replace('.ts', '').replace('.tsx', '')
      md += `  ${name} --> M${name}${i}[${modName}]\n`
    })
    provider.collections.forEach((col, i) => {
      md += `  M${name}0 --> C${name}${i}[${col}]\n`
    })
  })
  
  md += '```\n\n'
  
  md += '## Provider Details\n\n'
  
  Object.entries(providers).forEach(([name, provider]) => {
    md += `### ${name}\n\n`
    md += '**Modules using this provider:**\n'
    provider.modules.forEach(mod => {
      md += `- \`${mod}\`\n`
    })
    md += '\n**Collections influenced:**\n'
    provider.collections.forEach(col => {
      md += `- ${col}\n`
    })
    md += '\n---\n\n'
  })
  
  return md
}

function generateDataSourcesMarkdown(routes: Route[]): string {
  let md = '# Data Sources Map\n\n'
  
  md += '## Function Data Sources\n\n'
  md += '| Function | Type | Reads From | Writes To | External APIs |\n'
  md += '|----------|------|------------|-----------|---------------|\n'
  
  routes.forEach(route => {
    const reads = route.collections?.filter(c => 
      route.file.includes('GET') || 
      route.file.includes('list') || 
      route.file.includes('get')
    ) || []
    
    const writes = route.collections?.filter(c => 
      route.file.includes('POST') || 
      route.file.includes('PUT') || 
      route.file.includes('create') || 
      route.file.includes('update')
    ) || []
    
    md += `| ${route.path} | ${route.type} | ${reads.join(', ') || '-'} | ${writes.join(', ') || '-'} | ${route.externalAPIs?.join(', ') || '-'} |\n`
  })
  
  md += '\n## Collection Usage Matrix\n\n'
  
  const collections = Array.from(new Set(routes.flatMap(r => r.collections || [])))
  
  md += '| Collection | Read By | Written By | Total Usage |\n'
  md += '|------------|---------|------------|-------------|\n'
  
  collections.forEach(col => {
    const readers = routes.filter(r => r.collections?.includes(col) && 
      (r.method === 'GET' || r.type === 'page')).map(r => r.path)
    const writers = routes.filter(r => r.collections?.includes(col) && 
      (r.method === 'POST' || r.method === 'PUT' || r.method === 'PATCH')).map(r => r.path)
    
    md += `| ${col} | ${readers.length} routes | ${writers.length} routes | ${readers.length + writers.length} |\n`
  })
  
  return md
}

async function main() {
  console.log('🔍 Analyzing API routes and data flow...')
  
  const routes = await findRoutes()
  console.log(`✅ Found ${routes.length} routes`)
  
  // Create output directory
  const outputDir = path.join(ROOT, 'docs/diagrams/api')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Generate routes map
  const routesMarkdown = generateRoutesMarkdown(routes)
  fs.writeFileSync(path.join(outputDir, 'routes.md'), routesMarkdown)
  console.log('✅ Generated routes.md')
  
  // Generate external providers map
  const externalMarkdown = generateExternalProvidersMarkdown(routes)
  fs.writeFileSync(path.join(outputDir, 'external.md'), externalMarkdown)
  console.log('✅ Generated external.md')
  
  // Generate data sources map
  const dataSourcesMarkdown = generateDataSourcesMarkdown(routes)
  fs.writeFileSync(path.join(outputDir, 'data-sources.md'), dataSourcesMarkdown)
  console.log('✅ Generated data-sources.md')
  
  // Update inventory
  const inventoryPath = path.join(ROOT, 'docs/diagrams/_inventory.json')
  let inventory: any = {}
  
  if (fs.existsSync(inventoryPath)) {
    inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'))
  }
  
  inventory.api = {
    routes: 'api/routes.md',
    external: 'api/external.md',
    dataSources: 'api/data-sources.md',
    generated: new Date().toISOString()
  }
  
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2))
  console.log('✅ Updated _inventory.json')
  
  console.log('\n✨ API routing maps generated successfully!')
}

main().catch(console.error)
