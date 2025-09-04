import { Models } from 'appwrite'

export interface League extends Models.Document {
  name: string
  leagueName?: string
  commissioner: string // Database uses 'commissioner'
  commissionerId?: string // Legacy field - for backwards compatibility
  commissionerAuthUserId?: string
  season: number
  maxTeams: number
  currentTeams: number
  draftType: 'snake' | 'auction'
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten'
  status: 'open' | 'full' | 'drafting' | 'active' | 'complete'
  draftStatus?: 'pre-draft' | 'drafting' | 'post-draft' | 'paused'
  isPublic: boolean
  password?: string
  pickTimeSeconds: number
  scoringRules: any
  draftDate?: string
  draftStartedAt?: string
  selectedConference?: 'sec' | 'acc' | 'big12' | 'bigten'
  engineVersion?: 'v1' | 'v2'
  phase?: 'scheduled' | 'drafting' | 'active' | 'complete'
  settings?: {
    allowTrades?: boolean
    tradeDeadline?: string | null
    waiverPeriodDays?: number
    playoffTeams?: number
    regularSeasonWeeks?: number
  }
  createdAt?: string
  updatedAt?: string
}
