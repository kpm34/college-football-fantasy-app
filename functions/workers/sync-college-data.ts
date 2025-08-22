#!/usr/bin/env ts-node
import { main as importPlayers } from '../appwrite/import-players/index'

async function run() {
  await importPlayers({ season: Number(process.env.SEASON || new Date().getFullYear()) })
}

run().catch((e)=>{ console.error(e); process.exit(1) })
