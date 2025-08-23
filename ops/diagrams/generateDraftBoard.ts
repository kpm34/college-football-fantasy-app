#!/usr/bin/env tsx
/**
 * Generate Mermaid Draft Board
 * 
 * Reads draft_events for a completed draft and generates a visual Mermaid diagram
 * saved to docs/diagrams/draft-boards/<league_id>-<season>.md
 * 
 * Usage: npx tsx ops/diagrams/generateDraftBoard.ts <draft_id>
 */

import * as fs from 'fs'
import * as path from 'path'
import { Client, Databases, Query } from 'node-appwrite'

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '')

const databases = new Databases(client)
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy'

interface DraftEvent {
  id: string
  draft_id: string
  type: 'pick' | 'pass' | 'timeout' | 'pause' | 'resume'
  round?: number
  overall?: number
  fantasy_team_id?: string
  player_id?: string
  player_name?: string
  team_name?: string
  position?: string
  school?: string
  ts: string
}

interface Draft {
  id: string
  league_id: string
  season: number
  type: 'snake' | 'auction'
  status: string
  max_teams: number
  board_asset_uri?: string
}

async function getDraft(draftId: string): Promise<Draft> {
  try {
    const response = await databases.getDocument(DATABASE_ID, 'drafts', draftId)
    return response as unknown as Draft
  } catch (error) {
    console.error('Error fetching draft:', error)
    throw error
  }
}

async function getDraftEvents(draftId: string): Promise<DraftEvent[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'draft_events',
      [
        Query.equal('draft_id', draftId),
        Query.equal('type', 'pick'),
        Query.orderAsc('overall'),
        Query.limit(500)
      ]
    )
    return response.documents as unknown as DraftEvent[]
  } catch (error) {
    console.error('Error fetching draft events:', error)
    throw error
  }
}

function generateMermaidDiagram(draft: Draft, events: DraftEvent[]): string {
  const picks = events.filter(e => e.type === 'pick')
  
  if (picks.length === 0) {
    throw new Error('No picks found for this draft')
  }

  let mermaid = `# Draft Board - League ${draft.league_id} (${draft.season})\n\n`
  mermaid += `## Draft Type: ${draft.type === 'snake' ? 'Snake' : 'Auction'}\n\n`
  mermaid += `## Total Picks: ${picks.length}\n\n`
  
  // Create the main diagram
  mermaid += '```mermaid\n'
  mermaid += 'graph TB\n'
  mermaid += '  classDef qb fill:#ff6b6b,stroke:#c92a2a,stroke-width:2,color:#fff\n'
  mermaid += '  classDef rb fill:#4dabf7,stroke:#1971c2,stroke-width:2,color:#fff\n'
  mermaid += '  classDef wr fill:#69db7c,stroke:#2f9e44,stroke-width:2,color:#fff\n'
  mermaid += '  classDef te fill:#ffd43b,stroke:#fab005,stroke-width:2,color:#000\n'
  mermaid += '  classDef k fill:#e599f7,stroke:#ae3ec9,stroke-width:2,color:#fff\n'
  mermaid += '\n'
  
  // Group by rounds
  const roundsCount = Math.ceil(picks.length / draft.max_teams)
  
  for (let round = 1; round <= roundsCount; round++) {
    mermaid += `  subgraph "Round ${round}"\n`
    
    const roundPicks = picks.filter(p => p.round === round)
    
    roundPicks.forEach((pick, index) => {
      const nodeId = `R${round}P${index + 1}`
      const playerInfo = `${pick.player_name || 'Unknown'}\\n${pick.position || '??'} - ${pick.school || 'Unknown'}`
      const teamInfo = `Team: ${pick.team_name || 'Unknown'}`
      
      mermaid += `    ${nodeId}["Pick ${pick.overall}\\n${playerInfo}\\n${teamInfo}"]`
      
      // Apply position-based styling
      if (pick.position) {
        const posClass = pick.position.toLowerCase()
        mermaid += `:::${posClass}`
      }
      
      mermaid += '\n'
      
      // Connect to next pick in round
      if (index < roundPicks.length - 1) {
        const nextNodeId = `R${round}P${index + 2}`
        mermaid += `    ${nodeId} --> ${nextNodeId}\n`
      }
    })
    
    mermaid += '  end\n\n'
    
    // Connect rounds (snake draft pattern)
    if (round < roundsCount) {
      const isEvenRound = round % 2 === 0
      const lastPickThisRound = `R${round}P${roundPicks.length}`
      const firstPickNextRound = `R${round + 1}P1`
      
      if (draft.type === 'snake' && isEvenRound) {
        // Snake back
        mermaid += `  ${lastPickThisRound} -.-> ${firstPickNextRound}\n`
      } else {
        // Normal progression
        mermaid += `  ${lastPickThisRound} ==> ${firstPickNextRound}\n`
      }
    }
  }
  
  mermaid += '```\n\n'
  
  // Add summary table
  mermaid += '## Draft Summary\n\n'
  mermaid += '| Round | Pick | Overall | Player | Position | School | Team |\n'
  mermaid += '|-------|------|---------|--------|----------|--------|------|\n'
  
  picks.forEach(pick => {
    const round = pick.round || Math.floor((pick.overall! - 1) / draft.max_teams) + 1
    const pickInRound = ((pick.overall! - 1) % draft.max_teams) + 1
    
    mermaid += `| ${round} | ${pickInRound} | ${pick.overall} | ${pick.player_name || 'Unknown'} | ${pick.position || '??'} | ${pick.school || 'Unknown'} | ${pick.team_name || 'Unknown'} |\n`
  })
  
  return mermaid
}

async function saveDraftBoard(draft: Draft, content: string): Promise<string> {
  const outputDir = path.join(process.cwd(), 'docs/diagrams/draft-boards')
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const filename = `${draft.league_id}-${draft.season}.md`
  const filepath = path.join(outputDir, filename)
  
  fs.writeFileSync(filepath, content)
  
  return `docs/diagrams/draft-boards/${filename}`
}

async function updateDraftRecord(draftId: string, boardUri: string): Promise<void> {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      'drafts',
      draftId,
      {
        board_asset_uri: boardUri,
        board_generated_at: new Date().toISOString()
      }
    )
    console.log('✅ Updated draft record with board URI')
  } catch (error) {
    console.error('Error updating draft record:', error)
  }
}

async function main() {
  const draftId = process.argv[2]
  
  if (!draftId) {
    console.error('Usage: npx tsx ops/diagrams/generateDraftBoard.ts <draft_id>')
    process.exit(1)
  }
  
  if (!process.env.APPWRITE_API_KEY) {
    console.error('Error: APPWRITE_API_KEY environment variable is required')
    process.exit(1)
  }
  
  try {
    console.log(`📋 Generating draft board for draft: ${draftId}`)
    
    // Fetch draft details
    const draft = await getDraft(draftId)
    console.log(`✅ Found draft for league ${draft.league_id} (${draft.season})`)
    
    // Check if draft is complete
    if (draft.status !== 'completed' && process.env.FORCE !== 'true') {
      console.warn('⚠️  Draft is not completed. Use FORCE=true to generate anyway.')
      process.exit(1)
    }
    
    // Fetch draft events
    const events = await getDraftEvents(draftId)
    console.log(`✅ Found ${events.length} pick events`)
    
    // Generate Mermaid diagram
    const mermaidContent = generateMermaidDiagram(draft, events)
    
    // Save to file
    const savedPath = await saveDraftBoard(draft, mermaidContent)
    console.log(`✅ Saved draft board to: ${savedPath}`)
    
    // Update draft record
    await updateDraftRecord(draftId, savedPath)
    
    console.log('✨ Draft board generation complete!')
    
  } catch (error) {
    console.error('❌ Error generating draft board:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
