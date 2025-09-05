import { expect, test } from '@playwright/test'

function isoNowPlus(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString()
}

test.describe('Draft v2 – full flow (auto-start + timer + autopick)', () => {
  test('creates account, league, sets order, auto-starts, autopicks to completion', async ({
    page,
  }) => {
    const t0 = Date.now()
    const email = `e2e_${Date.now()}@cfbfantasy.app`
    const password = 'Test1234!'
    const leagueName = `E2E League ${new Date().toISOString()}`

    // 1) Login or create account via test endpoint (sets HttpOnly cookie)
    const authRes = await page.request.post('/api/auth/test-login', {
      data: { email, password },
    })
    expect(authRes.ok()).toBeTruthy()

    // 2) Create a league with short clock and near-future start time
    const startIso = isoNowPlus(15)
    const createRes = await page.request.post('/api/leagues/create', {
      data: {
        leagueName,
        gameMode: 'CONFERENCE',
        selectedConference: 'sec',
        scoringType: 'STANDARD',
        maxTeams: 1,
        draftType: 'snake',
        draftRounds: 2,
        pickTimeSeconds: 5,
        draftDate: startIso,
        isPrivate: false,
      },
    })
    expect(createRes.ok()).toBeTruthy()
    const createJson: any = await createRes.json()
    expect(createJson?.success).toBeTruthy()
    const leagueId: string = createJson.league?.$id || createJson.league?.id
    const myFantasyTeamId: string = createJson.fantasyTeamId
    expect(leagueId).toBeTruthy()
    expect(myFantasyTeamId).toBeTruthy()

    // 3) Save draft order in commissioner settings (fantasyTeamIds array)
    const putRes = await page.request.put(`/api/leagues/${leagueId}/commissioner`, {
      data: { draftOrder: [myFantasyTeamId] },
    })
    expect(putRes.ok()).toBeTruthy()

    // 4) Verify pre-draft state returns 404 (not started)
    const preState = await page.request.get(`/api/drafts/${leagueId}/state`)
    expect(preState.status()).toBe(404)

    // 5) Wait until start time, then trigger start-drafts cron (simulating scheduler)
    const untilStartMs = Math.max(0, new Date(startIso).getTime() - Date.now())
    if (untilStartMs > 0) await page.waitForTimeout(untilStartMs + 500)
    const startCron = await page.request.get('/api/(backend)/cron/start-drafts', {
      headers: { 'x-vercel-cron': '1' },
    })
    expect(startCron.ok()).toBeTruthy()

    // 6) Confirm draft state is now active and has deadline
    const stateRes = await page.request.get(`/api/drafts/${leagueId}/state`)
    expect(stateRes.ok()).toBeTruthy()
    const stateJson: any = await stateRes.json()
    const state = stateJson?.data || stateJson
    expect(state?.onClockTeamId).toBeTruthy()
    expect(state?.draftStatus || state?.phase).toBeTruthy()
    const deadlineAt = state.deadlineAt
    expect(deadlineAt).toBeTruthy()

    // 7) Open Draft Room UI and verify timer displays
    await page.goto(`/draft/${leagueId}`)
    await expect(page.getByText(/Draft Room/)).toBeVisible()
    await expect(page.getByText(/Round/)).toBeVisible()
    await expect(page.getByText(/Pick/)).toBeVisible()

    // 8) When timer expires, run autopick cron and verify pick recorded
    await page.waitForTimeout(6000)
    const autoCron1 = await page.request.get('/api/(backend)/cron/draft-autopick', {
      headers: { 'x-vercel-cron': '1' },
    })
    expect(autoCron1.ok()).toBeTruthy()

    // Confirm at least 1 pick exists
    const data1 = await page.request.get(`/api/drafts/${leagueId}/data`)
    expect(data1.ok()).toBeTruthy()
    const dj1: any = await data1.json()
    const picks1 = dj1?.data?.picks?.items || []
    expect(picks1.length).toBeGreaterThan(0)

    // 9) Autopick until completion (2 rounds x 1 team)
    let completed = false
    for (let i = 0; i < 4; i++) {
      const s = await page.request.get(`/api/drafts/${leagueId}/state`)
      const sj: any = await s.json()
      const snap = sj?.data || sj
      if (snap?.draftStatus === 'complete' || snap?.phase === 'complete') {
        completed = true
        break
      }
      await page.waitForTimeout(6000)
      await page.request.get('/api/(backend)/cron/draft-autopick', {
        headers: { 'x-vercel-cron': '1' },
      })
    }

    const finalState = await page.request.get(`/api/drafts/${leagueId}/state`)
    const finalJson: any = await finalState.json()
    const snapFinal = finalJson?.data || finalJson
    expect(snapFinal?.draftStatus === 'complete' || snapFinal?.phase === 'complete').toBeTruthy()

    const t1 = Date.now()
    console.log('[E2E] Draft full flow completed in', ((t1 - t0) / 1000).toFixed(1), 's')
  })
})
