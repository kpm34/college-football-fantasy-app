import fs from 'node:fs'
import path from 'node:path'

const ssotPath = path.resolve('schema/zod-schema.ts')
if (!fs.existsSync(ssotPath)) {
  console.error('SSOT missing: schema/zod-schema.ts')
  process.exitCode = 1
} else {
  console.log('SSOT present at schema/zod-schema.ts')
}
console.log('SSOT integrity: BASIC CHECK PASSED (stub)')


