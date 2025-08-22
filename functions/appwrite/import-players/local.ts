import fs from 'node:fs'
import path from 'node:path'
import main from './index'

async function run() {
  const fixture = path.join(process.cwd(), 'functions', 'appwrite', 'import-players', 'event.fixture.json')
  const payload = JSON.parse(fs.readFileSync(fixture, 'utf8'))
  const result = await main(payload)
  console.log('Result:', result)
}

run().catch(console.error)
