#!/usr/bin/env tsx
/**
 * Report: Coded vs Working
 * Analyzes codebase for orphaned files, legacy references, and broken routes
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const ROOT = process.cwd()

interface FileNode {
  path: string
  imports: string[]
  exports: string[]
  reachable: boolean
  legacy: string[]
}

interface Report {
  totalFiles: number
  reachableFiles: number
  orphanedFiles: string[]
  legacyReferences: Record<string, string[]>
  missingRoutes: string[]
  brokenImports: string[]
  routeStatus?: Record<string, number>
}

// Legacy collection patterns to detect
const LEGACY_PATTERNS = [
  'teams',           // Should be 'schools'
  'users',           // Should be 'clients'  
  'user_teams',      // Should be 'fantasy_teams'
  'draft_picks',     // Should be 'draft_events'
  'mock_draft_picks',
  'mock_drafts',
  'auction_bids',    // Should be 'bids'
  'auction_sessions',
  'scores',          // Should be 'matchups'
  'team_budgets',
  'player_projections',
  'projections_weekly',
  'projections_yearly',
  'user_custom_projections',
  'projection_runs', // Should be 'model_runs'
  'model_inputs',
  'editor_sessions',
  'file_changes',
  'message_templates',
  'migrations',
  'scoring',
  'sync_status',
  'rosterId'         // Should be 'fantasy_team_id'
]

async function buildImportGraph(): Promise<Map<string, FileNode>> {
  const graph = new Map<string, FileNode>()
  
  // Find all TypeScript/JavaScript files
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    cwd: ROOT,
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      'coverage/**',
      '*.test.*',
      '*.spec.*'
    ]
  })
  
  for (const file of files) {
    const fullPath = path.join(ROOT, file)
    const content = fs.readFileSync(fullPath, 'utf-8')
    
    const node: FileNode = {
      path: file,
      imports: extractImports(content),
      exports: extractExports(content),
      reachable: false,
      legacy: detectLegacyReferences(content)
    }
    
    graph.set(file, node)
  }
  
  return graph
}

function extractImports(content: string): string[] {
  const imports: string[] = []
  
  // ES6 imports
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g
  let match
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }
  
  // CommonJS requires
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1])
  }
  
  return imports
}

function extractExports(content: string): string[] {
  const exports: string[] = []
  
  // Named exports
  const namedExportRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g
  let match
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push(match[1])
  }
  
  // Default export
  if (/export\s+default/.test(content)) {
    exports.push('default')
  }
  
  return exports
}

function detectLegacyReferences(content: string): string[] {
  const found: string[] = []
  
  for (const pattern of LEGACY_PATTERNS) {
    // Check for various usage patterns
    const regex = new RegExp(`['"\`]${pattern}['"\`]|\\b${pattern}\\b`, 'gi')
    if (regex.test(content)) {
      // Verify it's not in a comment
      const lines = content.split('\n')
      for (const line of lines) {
        if (!line.trim().startsWith('//') && 
            !line.trim().startsWith('*') &&
            regex.test(line)) {
          found.push(pattern)
          break
        }
      }
    }
  }
  
  return [...new Set(found)]
}

function markReachable(graph: Map<string, FileNode>, startPath: string) {
  const node = graph.get(startPath)
  if (!node || node.reachable) return
  
  node.reachable = true
  
  // Follow imports
  for (const imp of node.imports) {
    // Resolve relative imports
    if (imp.startsWith('.')) {
      const resolved = resolveImport(startPath, imp)
      if (resolved) {
        markReachable(graph, resolved)
      }
    }
    // Check for absolute imports from our codebase
    else if (imp.startsWith('@/') || imp.startsWith('@components') || imp.startsWith('@lib')) {
      const resolved = resolveAliasImport(imp)
      if (resolved) {
        markReachable(graph, resolved)
      }
    }
  }
}

function resolveImport(fromFile: string, importPath: string): string | null {
  const dir = path.dirname(fromFile)
  let resolved = path.join(dir, importPath)
  
  // Try various extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']
  
  for (const ext of extensions) {
    const candidate = resolved + ext
    if (fs.existsSync(path.join(ROOT, candidate))) {
      return candidate
    }
  }
  
  // Try without extension
  if (fs.existsSync(path.join(ROOT, resolved))) {
    return resolved
  }
  
  return null
}

function resolveAliasImport(importPath: string): string | null {
  // Handle common aliases
  const aliases: Record<string, string> = {
    '@/': '',
    '@components/': 'components/',
    '@lib/': 'lib/',
    '@hooks/': 'lib/hooks/',
    '@utils/': 'lib/utils/',
    '@types/': 'types/'
  }
  
  for (const [alias, replacement] of Object.entries(aliases)) {
    if (importPath.startsWith(alias)) {
      const resolved = importPath.replace(alias, replacement)
      return resolveImport('', './' + resolved)
    }
  }
  
  return null
}

async function checkRouteStatus(): Promise<Record<string, number> | undefined> {
  // Only run if we're in development mode
  if (process.env.NODE_ENV === 'production') {
    return undefined
  }
  
  const routeStatus: Record<string, number> = {}
  
  // Find all route files
  const routes = await glob('app/**/route.ts', { cwd: ROOT })
  const pages = await glob('app/**/page.tsx', { cwd: ROOT })
  
  console.log('📡 Checking route status (this may take a moment)...')
  
  // For each route, try to determine if it would work
  for (const route of [...routes, ...pages]) {
    const routePath = route
      .replace('app/', '/')
      .replace('/route.ts', '')
      .replace('/page.tsx', '')
      .replace(/\[([^\]]+)\]/g, ':$1')
    
    // For now, just check if the file exists and has exports
    const content = fs.readFileSync(path.join(ROOT, route), 'utf-8')
    
    if (route.endsWith('route.ts')) {
      // Check for HTTP method exports
      const hasGet = content.includes('export async function GET')
      const hasPost = content.includes('export async function POST')
      
      if (hasGet || hasPost) {
        routeStatus[routePath] = 200
      } else {
        routeStatus[routePath] = 501 // Not implemented
      }
    } else {
      // Check for default export in pages
      if (content.includes('export default')) {
        routeStatus[routePath] = 200
      } else {
        routeStatus[routePath] = 501
      }
    }
  }
  
  return routeStatus
}

function generateReportMarkdown(report: Report): string {
  let md = '# Code vs Working Report\n\n'
  md += `Generated: ${new Date().toISOString()}\n\n`
  
  // Summary
  md += '## Summary\n\n'
  md += `- **Total Files**: ${report.totalFiles}\n`
  md += `- **Reachable Files**: ${report.reachableFiles} (${Math.round(report.reachableFiles / report.totalFiles * 100)}%)\n`
  md += `- **Orphaned Files**: ${report.orphanedFiles.length} (${Math.round(report.orphanedFiles.length / report.totalFiles * 100)}%)\n`
  md += `- **Files with Legacy References**: ${Object.keys(report.legacyReferences).length}\n`
  md += `- **Broken Imports**: ${report.brokenImports.length}\n\n`
  
  // Reachability Graph
  md += '## Reachability Overview\n\n'
  md += '```mermaid\n'
  md += 'pie title File Reachability\n'
  md += `  "Reachable" : ${report.reachableFiles}\n`
  md += `  "Orphaned" : ${report.orphanedFiles.length}\n`
  md += '```\n\n'
  
  // Orphaned Files
  if (report.orphanedFiles.length > 0) {
    md += '## Orphaned Files\n\n'
    md += 'These files are not reachable from any entry point:\n\n'
    
    // Group by directory
    const byDir: Record<string, string[]> = {}
    report.orphanedFiles.forEach(file => {
      const dir = path.dirname(file)
      if (!byDir[dir]) byDir[dir] = []
      byDir[dir].push(path.basename(file))
    })
    
    Object.entries(byDir).forEach(([dir, files]) => {
      md += `### ${dir}/\n`
      files.forEach(file => {
        md += `- ${file}\n`
      })
      md += '\n'
    })
  }
  
  // Legacy References
  if (Object.keys(report.legacyReferences).length > 0) {
    md += '## Legacy Collection References\n\n'
    md += 'Files still referencing old collection names:\n\n'
    md += '| File | Legacy References | Suggested Fix |\n'
    md += '|------|------------------|---------------|\n'
    
    const replacements: Record<string, string> = {
      'teams': 'schools',
      'users': 'clients',
      'user_teams': 'fantasy_teams',
      'draft_picks': 'draft_events',
      'auction_bids': 'bids',
      'scores': 'matchups',
      'projection_runs': 'model_runs',
      'rosterId': 'fantasy_team_id'
    }
    
    Object.entries(report.legacyReferences).forEach(([file, refs]) => {
      const fixes = refs.map(ref => replacements[ref] || 'Remove').join(', ')
      md += `| ${file} | ${refs.join(', ')} | ${fixes} |\n`
    })
    md += '\n'
  }
  
  // Broken Imports
  if (report.brokenImports.length > 0) {
    md += '## Broken Imports\n\n'
    md += 'Files with unresolvable imports:\n\n'
    report.brokenImports.forEach(imp => {
      md += `- ${imp}\n`
    })
    md += '\n'
  }
  
  // Route Status
  if (report.routeStatus) {
    md += '## Route Status\n\n'
    md += '| Route | Status | Health |\n'
    md += '|-------|--------|--------|\n'
    
    Object.entries(report.routeStatus).forEach(([route, status]) => {
      const health = status === 200 ? '✅ OK' : status === 501 ? '⚠️ Not Implemented' : '❌ Error'
      md += `| ${route} | ${status} | ${health} |\n`
    })
    md += '\n'
  }
  
  // Links to other diagrams
  md += '## Related Diagrams\n\n'
  md += '- [API Routes Map](./api/routes.md)\n'
  md += '- [External Providers](./api/external.md)\n'
  md += '- [Data Sources](./api/data-sources.md)\n'
  md += '- [Project Map](./project-map/)\n'
  md += '- [Functional Flows](./functional-flow/)\n'
  md += '- [System Architecture](./system-architecture/)\n'
  
  return md
}

async function main() {
  console.log('🔍 Building import graph...')
  const graph = await buildImportGraph()
  console.log(`✅ Analyzed ${graph.size} files`)
  
  // Mark reachable files from entry points
  console.log('🌳 Tracing reachability...')
  
  // Entry points
  const entryPoints = [
    'app/layout.tsx',
    'app/page.tsx',
    ...Array.from(graph.keys()).filter(f => 
      f.includes('app/') && f.endsWith('/page.tsx')
    ),
    ...Array.from(graph.keys()).filter(f => 
      f.includes('app/api/') && f.endsWith('/route.ts')
    ),
    ...Array.from(graph.keys()).filter(f => 
      f.startsWith('functions/appwrite/') && f.endsWith('/index.ts')
    )
  ]
  
  entryPoints.forEach(entry => {
    if (graph.has(entry)) {
      markReachable(graph, entry)
    }
  })
  
  // Build report
  const report: Report = {
    totalFiles: graph.size,
    reachableFiles: 0,
    orphanedFiles: [],
    legacyReferences: {},
    missingRoutes: [],
    brokenImports: []
  }
  
  // Analyze each file
  graph.forEach((node, file) => {
    if (node.reachable) {
      report.reachableFiles++
    } else {
      // Only count as orphaned if it's in important directories
      if (file.startsWith('components/') || 
          file.startsWith('lib/') || 
          file.startsWith('app/')) {
        report.orphanedFiles.push(file)
      }
    }
    
    if (node.legacy.length > 0) {
      report.legacyReferences[file] = node.legacy
    }
  })
  
  // Check route status
  console.log('🔗 Checking route health...')
  report.routeStatus = await checkRouteStatus()
  
  // Generate report
  const markdown = generateReportMarkdown(report)
  const reportPath = path.join(ROOT, 'docs/diagrams/report.md')
  fs.writeFileSync(reportPath, markdown)
  console.log(`✅ Generated report.md`)
  
  // Save route status JSON if available
  if (report.routeStatus) {
    const statusPath = path.join(ROOT, 'docs/diagrams/runtime/route-status.json')
    fs.mkdirSync(path.dirname(statusPath), { recursive: true })
    fs.writeFileSync(statusPath, JSON.stringify(report.routeStatus, null, 2))
    console.log(`✅ Saved route-status.json`)
  }
  
  // Update inventory
  const inventoryPath = path.join(ROOT, 'docs/diagrams/_inventory.json')
  let inventory: any = {}
  
  if (fs.existsSync(inventoryPath)) {
    inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'))
  }
  
  inventory.reports = {
    main: 'report.md',
    routeStatus: report.routeStatus ? 'runtime/route-status.json' : null,
    generated: new Date().toISOString()
  }
  
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2))
  
  // Print summary
  console.log('\n📊 Report Summary:')
  console.log(`   Reachable: ${report.reachableFiles}/${graph.size} files`)
  console.log(`   Orphaned: ${report.orphanedFiles.length} files`)
  console.log(`   Legacy refs: ${Object.keys(report.legacyReferences).length} files`)
  
  if (report.orphanedFiles.length > 0) {
    console.log('\n⚠️  Consider removing orphaned files to reduce bundle size')
  }
  
  if (Object.keys(report.legacyReferences).length > 0) {
    console.log('\n⚠️  Legacy collection names found - run migration scripts')
  }
  
  console.log('\n✨ Report generation complete!')
}

if (require.main === module) {
  main().catch(console.error)
}
