import * as fs from 'fs'
import * as path from 'path'

// Read the live collections data
const liveCollectionsPath = path.join(__dirname, '../schema/live-collections.json')
const liveData = JSON.parse(fs.readFileSync(liveCollectionsPath, 'utf-8'))

// Create a comprehensive schema report
function analyzeSchema() {
  console.log('='.repeat(80))
  console.log('LIVE APPWRITE SCHEMA ANALYSIS')
  console.log('='.repeat(80))
  console.log(`\nTotal Collections: ${liveData.collections.length}`)
  console.log('\n' + '='.repeat(80))
  console.log('COLLECTIONS SUMMARY')
  console.log('='.repeat(80))

  const collections = liveData.collections.sort((a: any, b: any) => a.name.localeCompare(b.name))

  // Summary table
  console.log('\n| Collection Name | Collection ID | Attributes | Indexes | Doc Security |')
  console.log('|-----------------|---------------|------------|---------|--------------|')

  for (const col of collections) {
    const attrCount = col.attributes?.length || 0
    const indexCount = col.indexes?.length || 0
    const docSec = col.documentSecurity ? 'Yes' : 'No'
    console.log(
      `| ${col.name.padEnd(15)} | ${col.$id.padEnd(13)} | ${String(attrCount).padEnd(10)} | ${String(indexCount).padEnd(7)} | ${docSec.padEnd(12)} |`
    )
  }

  // Detailed collection information
  console.log('\n' + '='.repeat(80))
  console.log('DETAILED COLLECTION SCHEMAS')
  console.log('='.repeat(80))

  for (const col of collections) {
    console.log(`\n${'#'.repeat(40)}`)
    console.log(`# Collection: ${col.name}`)
    console.log(`# ID: ${col.$id}`)
    console.log(`${'#'.repeat(40)}`)

    if (col.attributes && col.attributes.length > 0) {
      console.log('\nAttributes:')
      console.log('-'.repeat(40))

      for (const attr of col.attributes) {
        const required = attr.required ? ' [REQUIRED]' : ' [optional]'
        const array = attr.array ? '[]' : ''
        let typeInfo = `${attr.type}${array}`

        // Add additional type information
        if (attr.type === 'string' && attr.size) {
          typeInfo += `(${attr.size})`
        } else if (attr.type === 'integer') {
          if (attr.min !== undefined || attr.max !== undefined) {
            typeInfo += `(${attr.min || '*'} to ${attr.max || '*'})`
          }
        } else if (attr.type === 'double') {
          typeInfo += '(float)'
        } else if (attr.type === 'datetime') {
          typeInfo += attr.format ? `(${attr.format})` : ''
        } else if (attr.type === 'relationship') {
          typeInfo += ` -> ${attr.relatedCollection}`
        }

        console.log(`  - ${attr.key}: ${typeInfo}${required}`)

        if (attr.default !== null && attr.default !== undefined) {
          console.log(`    default: ${attr.default}`)
        }
      }
    }

    if (col.indexes && col.indexes.length > 0) {
      console.log('\nIndexes:')
      console.log('-'.repeat(40))

      for (const idx of col.indexes) {
        const attrs = idx.attributes.join(', ')
        console.log(`  - ${idx.key} (${idx.type}): [${attrs}]`)
      }
    }
  }

  // Generate mapping of collection IDs to names
  console.log('\n' + '='.repeat(80))
  console.log('COLLECTION ID TO NAME MAPPING')
  console.log('='.repeat(80))
  console.log('\nexport const COLLECTION_MAPPINGS = {')
  for (const col of collections) {
    console.log(`  '${col.$id}': '${col.name}',`)
  }
  console.log('};')

  // Save to file
  const outputPath = path.join(__dirname, '../schema/LIVE_SCHEMA_ANALYSIS.md')
  let output = '# Live Appwrite Schema Analysis\n\n'
  output += `Generated: ${new Date().toISOString()}\n\n`
  output += `## Summary\n\n`
  output += `Total Collections: ${liveData.collections.length}\n\n`
  output += '## Collections\n\n'

  output += '| Collection Name | Collection ID | Attributes | Indexes |\n'
  output += '|-----------------|---------------|------------|---------|\n'

  for (const col of collections) {
    const attrCount = col.attributes?.length || 0
    const indexCount = col.indexes?.length || 0
    output += `| ${col.name} | \`${col.$id}\` | ${attrCount} | ${indexCount} |\n`
  }

  output += '\n## Detailed Schemas\n\n'

  for (const col of collections) {
    output += `### ${col.name} (\`${col.$id}\`)\n\n`

    if (col.attributes && col.attributes.length > 0) {
      output += '**Attributes:**\n\n'
      for (const attr of col.attributes) {
        const required = attr.required ? ' *(required)*' : ''
        const array = attr.array ? '[]' : ''
        output += `- \`${attr.key}\`: ${attr.type}${array}${required}`

        if (attr.type === 'string' && attr.size) {
          output += ` (max: ${attr.size})`
        }
        if (attr.default !== null && attr.default !== undefined) {
          output += ` [default: ${attr.default}]`
        }
        output += '\n'
      }
      output += '\n'
    }

    if (col.indexes && col.indexes.length > 0) {
      output += '**Indexes:**\n\n'
      for (const idx of col.indexes) {
        output += `- \`${idx.key}\` (${idx.type}): [${idx.attributes.join(', ')}]\n`
      }
      output += '\n'
    }
  }

  fs.writeFileSync(outputPath, output)
  console.log(`\n✅ Analysis saved to: ${outputPath}`)
}

analyzeSchema()
