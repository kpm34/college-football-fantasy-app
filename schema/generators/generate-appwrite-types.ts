#!/usr/bin/env ts-node

import fs from 'node:fs'
import path from 'node:path'
import { SCHEMA } from '../schemas.registry'

const OUT_DIR = path.join(process.cwd(), 'lib', 'generated')

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function toPascalCase(id: string): string {
  return id
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function mapType(t: string, elements?: string[]): string {
  switch (t) {
    case 'string':
      return 'string'
    case 'integer':
    case 'double':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'datetime':
      return 'string'
    case 'enum':
      return elements && elements.length > 0 ? elements.map(v=>`'${v}'`).join(' | ') : 'string'
    default:
      return 'any'
  }
}

function generateTypes() {
  const lines: string[] = []
  lines.push('// AUTO-GENERATED. Do not edit by hand.')
  lines.push('export type CollectionId = ' + Object.keys(SCHEMA).map(id => `'${id}'`).join(' | '))
  lines.push('')
  for (const [id, coll] of Object.entries(SCHEMA)) {
    const typeName = toPascalCase(id) + 'Doc'
    lines.push(`export interface ${typeName} {`)
    const attrs = Array.isArray(coll.attributes) ? coll.attributes : []
    for (const def of attrs) {
      const optional = def.required ? '' : '?'
      const tsType = mapType(def.type, def.elements)
      lines.push(`  ${def.key}${optional}: ${tsType}`)
    }
    lines.push('}')
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  ensureOutDir()
  const content = generateTypes()
  fs.writeFileSync(path.join(OUT_DIR, 'appwrite-types.d.ts'), content)
  // eslint-disable-next-line no-console
  console.log('Generated lib/generated/appwrite-types.d.ts')
}

if (require.main === module) {
  main()
}
