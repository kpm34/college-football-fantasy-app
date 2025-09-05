import { ValidationError } from '@domain/errors/app-error'
import { serverRepositories } from '@domain/repositories'
import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@lib/appwrite-server'
import { withErrorHandler } from '@lib/utils/error-handler'
import { NextRequest, NextResponse } from 'next/server'
import { ID } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Check if user is authenticated
  const sessionCookie = request.cookies.get('appwrite-session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get user info
  const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`
  const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
    headers: {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0',
      Cookie: cookieHeader,
    },
  })

  if (!userResponse.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const user = await userResponse.json()
  const requestData = await request.json()

  // Normalize incoming fields from Create League page
  const leagueName: string | undefined = requestData.leagueName || requestData.name
  const rawGameMode: string | undefined = requestData.gameMode
  const selectedConference: string | undefined = requestData.selectedConference
  const maxTeams: number | undefined =
    typeof requestData.maxTeams === 'number' ? requestData.maxTeams : parseInt(requestData.maxTeams)
  const draftType: string = requestData.draftType || 'snake'
  const scoringType: string | undefined = requestData.scoringType || requestData.scoringMode
  const isPrivate: boolean = Boolean(requestData.isPrivate)
  const password: string | undefined = requestData.password
  const pickTimeSeconds: number =
    typeof requestData.pickTimeSeconds === 'number'
      ? requestData.pickTimeSeconds
      : parseInt(requestData.pickTimeSeconds) || 90

  // Map Create League UI game mode to repository-expected values
  const normalizeConference = (conf?: string): 'sec' | 'acc' | 'big12' | 'bigten' | undefined => {
    const c = String(conf || '').toLowerCase()
    if (c === 'sec') return 'sec'
    if (c === 'acc') return 'acc'
    if (c === 'big_12' || c === 'big12') return 'big12'
    if (c === 'big_ten' || c === 'bigten' || c === 'big10') return 'bigten'
    return undefined
  }

  const normalizeGameMode = (
    mode?: string,
    conf?: string
  ): 'power4' | 'sec' | 'acc' | 'big12' | 'bigten' | undefined => {
    const m = String(mode || '').toLowerCase()
    if (m === 'power4' || m === 'power-4') return 'power4'
    if (m === 'conference') {
      return normalizeConference(conf)
    }
    if (m === 'sec' || m === 'acc' || m === 'big12' || m === 'bigten') return m as any
    return undefined
  }

  const gameMode = normalizeGameMode(rawGameMode, selectedConference)

  // Validate required fields
  if (!leagueName || !maxTeams || !gameMode) {
    throw new ValidationError('Missing required fields: leagueName, maxTeams, gameMode')
  }

  // Enforce privacy rule: if private, password is required
  if (isPrivate && (!password || String(password).trim().length === 0)) {
    return NextResponse.json({ error: 'Password is required for private leagues' }, { status: 400 })
  }

  // Default scoring rule templates (can be extended later)
  const DEFAULT_STANDARD = {
    passingYards: 0.04, // 1 pt per 25 yards
    passingTouchdowns: 4,
    interceptions: -2,
    rushingYards: 0.1, // 1 pt per 10 yards
    rushingTouchdowns: 6,
    receptions: 0, // Standard = 0 PPR
    receivingYards: 0.1,
    receivingTouchdowns: 6,
    fieldGoal_0_39: 3,
    fieldGoal_40_49: 4,
    fieldGoal_50_plus: 5,
    fieldGoalMissed: -1,
    extraPointMade: 1,
    extraPointMissed: -1,
  }
  const DEFAULT_PPR = { ...DEFAULT_STANDARD, receptions: 1 }

  // Resolve scoring rules
  let scoringRulesToPersist: string | undefined = undefined
  try {
    const customRules = requestData.customScoringRules || requestData.scoringRules
    if (String(scoringType || '').toUpperCase() === 'PPR') {
      scoringRulesToPersist = JSON.stringify(DEFAULT_PPR)
    } else if (String(scoringType || '').toUpperCase() === 'STANDARD') {
      scoringRulesToPersist = JSON.stringify(DEFAULT_STANDARD)
    } else if (String(scoringType || '').toUpperCase() === 'CUSTOM') {
      if (typeof customRules === 'string') {
        JSON.parse(customRules) // validate
        scoringRulesToPersist = customRules
      } else if (typeof customRules === 'object' && customRules) {
        scoringRulesToPersist = JSON.stringify(customRules)
      } else {
        scoringRulesToPersist = JSON.stringify(DEFAULT_STANDARD)
      }
    } else if (requestData.scoringRules) {
      // Fallback to provided string
      if (typeof requestData.scoringRules === 'string') JSON.parse(requestData.scoringRules)
      scoringRulesToPersist =
        typeof requestData.scoringRules === 'string'
          ? requestData.scoringRules
          : JSON.stringify(requestData.scoringRules)
    } else {
      scoringRulesToPersist = JSON.stringify(DEFAULT_STANDARD)
    }
  } catch {
    scoringRulesToPersist = JSON.stringify(DEFAULT_STANDARD)
  }

  // Use repositories
  const { leagues, rosters } = serverRepositories

  // Normalize draft date to ISO string (UTC) if provided
  let draftDateIso: string | null = null
  try {
    if (requestData.draftDate) {
      const d = new Date(String(requestData.draftDate))
      if (!isNaN(d.getTime())) {
        draftDateIso = d.toISOString()
      }
    }
  } catch {}

  // Create the league using repository
  const league = await leagues.createLeague({
    leagueName,
    maxTeams,
    draftType: draftType as any,
    gameMode,
    isPublic: !isPrivate,
    // If private and password provided, persist it
    password: isPrivate && password ? String(password) : undefined,
    pickTimeSeconds,
    commissionerAuthUserId: user.$id,
    scoringRules: scoringRulesToPersist,
    draftDate: draftDateIso,
    season: requestData.season || new Date().getFullYear(),
    // Save selectedConference when in conference mode
    selectedConference:
      rawGameMode?.toLowerCase() === 'conference'
        ? (normalizeConference(selectedConference) as any)
        : undefined,
  })

  // Automatically join the commissioner to the league
  const { fantasyTeamId } = await leagues.joinLeague(
    league.$id,
    user.$id,
    requestData.teamName || `${user.name || user.email}'s Team`,
    requestData.teamAbbreviation
  )

  // Best-effort realtime consistency: write a minimal fantasy_teams doc if missing
  try {
    // The repo already created the roster; this ensures locker room visibility paths relying on 'name'
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, fantasyTeamId, {
      ownerAuthUserId: user.$id,
      leagueId: league.$id,
      teamName: requestData.teamName || `${user.name || user.email}'s Team`,
    } as any)
  } catch {}

  // Create a draft document for this league
  try {
    const draftOrder = [user.$id] // Start with just the commissioner
    const draftDoc = await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFTS, ID.unique(), {
      leagueId: league.$id,
      leagueName: leagueName, // Direct attribute for easy querying
      gameMode: gameMode,
      selectedConference: selectedConference || null,
      maxTeams: maxTeams,
      draftStatus: 'pre-draft', // Will change to 'drafting' when draft starts
      type: draftType || 'snake', // Default to snake draft
      currentRound: 0,
      currentPick: 0,
      maxRounds: requestData.draftRounds || 15,
      startTime: draftDateIso || null,
      isMock: false,
      clockSeconds: pickTimeSeconds,
      orderJson: JSON.stringify({
        draftOrder,
        draftType: draftType,
        totalTeams: maxTeams,
        pickTimeSeconds,
      }),
    })
    console.log('Draft document created:', draftDoc.$id)
  } catch (error) {
    // Log but don't fail league creation if draft doc fails
    console.error('Failed to create draft document:', error)
  }

  // Create league membership for commissioner
  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.LEAGUE_MEMBERSHIPS, ID.unique(), {
      leagueId: league.$id,
      leagueName: leagueName,
      authUserId: user.$id, // Correct field name for league_memberships
      role: 'COMMISSIONER',
      status: 'ACTIVE',
      joinedAt: new Date().toISOString(),
      displayName: user.name || user.email,
    })
    console.log('Commissioner membership created')
  } catch (membershipError) {
    console.warn('Failed to create commissioner membership record:', membershipError)
    // Non-fatal: continue even if membership record fails
  }

  return NextResponse.json({
    success: true,
    league,
    fantasyTeamId,
    message: 'League created successfully!',
  })
})
