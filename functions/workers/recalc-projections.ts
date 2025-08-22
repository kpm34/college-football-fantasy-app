#!/usr/bin/env ts-node
import { execSync } from 'node:child_process'

try {
  execSync('npx tsx ops/common/functions/pipeline/unified-talent-projections/index.ts --season=' + (process.env.SEASON || new Date().getFullYear()), { stdio: 'inherit' })
} catch (e) {
  process.exit(1)
}
