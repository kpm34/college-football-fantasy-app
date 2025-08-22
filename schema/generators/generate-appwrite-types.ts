#!/usr/bin/env ts-node

import fs from 'node:fs'
import path from 'node:path'
import { COLLECTIONS } from '../schemas.registry'

const OUT_DIR = path.join(process.cwd(), 'lib', 'generated')

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

function generateTypes() {
  const lines: string[] = []
  lines.push('// AUTO-GENERATED. Do not edit by hand.')
  lines.push('export type CollectionId = ' + Object.values(COLLECTIONS).map(c => `'${c.id}'`).join(' | '))
  lines.push('')
  for (const [key, coll] of Object.entries(COLLECTIONS)) {
    const typeName = key.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase())
    lines.push(`export interface ${typeName}Doc {`)
    for (const [attr, def] of Object.entries(coll.attributes)) {
      const optional = def.required ? '' : '?'
      const tsType = def.type === 'string' ? 'string'
        : def.type === 'number' ? 'number'
        : def.type === 'boolean' ? 'boolean'
        : def.type === 'datetime' ? 'string'
        : def.type === 'enum' ? (def.enumValues ? def.enumValues.map(v=>`'${v}'`).join(' | ') : 'string')
        : def.type === 'array' ? 'any[]'
        : 'any'
      lines.push(`  ${attr}${optional}: ${tsType}`)
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
