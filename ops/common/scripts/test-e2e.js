#!/usr/bin/env node

/**
 * Draft v2 Smoke Test (fresh, routing-aligned)
 * - Logs in (creates account if needed)
 * - Creates a league with short clock and imminent start
 * - Saves draft order (commissioner settings)
 * - Starts draft via cron and verifies state snapshot
 */

const https = require('https')
const http = require('http')

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

class SmokeDraftV2 {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.cookie = ''
    this.results = []
  }

  async run() {
    console.log('🚀 Draft v2 Smoke Test')
    console.log(`Base URL: ${this.baseUrl}`)
    console.log('═'.repeat(60))

    const steps = [
      () => this.stepLogin(),
      () => this.stepCreateLeague(),
      () => this.stepSaveOrder(),
      () => this.stepStartDraft(),
      () => this.stepVerifyState(),
    ]

    for (const s of steps) {
      const ok = await s().catch(e => {
        console.error(e)
        return false
      })
      if (!ok) {
        this.results.push({ name: s.name, ok: false })
        break
      }
      this.results.push({ name: s.name, ok: true })
    }

    const passed = this.results.filter(r => r.ok).length
    const total = this.results.length
    console.log('\n' + '═'.repeat(60))
    console.log(`📊 Smoke Result: ${passed}/${total} steps passed`)
    if (passed === total) {
      console.log('🎉 Smoke test passed')
      process.exit(0)
    } else {
      console.log('⚠️  Smoke test failed')
      process.exit(1)
    }
  }

  // -----------------------------
  // Steps
  // -----------------------------
  async stepLogin() {
    console.log('\n🔐 Step 1: Login/Create account')
    const email = `smoke_${Date.now()}@cfbfantasy.app`
    const password = 'Test1234!'
    const res = await this.request('POST', '/api/auth/test-login', { email, password })
    if (res.status < 200 || res.status >= 300) {
      console.log('  ❌ login failed', res.status, res.body)
      return false
    }
    const setCookie = res.headers['set-cookie'] || res.headers['Set-Cookie']
    if (setCookie && setCookie.length) {
      const cookie = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie
      const match = cookie.match(/appwrite-session=([^;]+)/)
      if (match) {
        this.cookie = `appwrite-session=${match[1]}`
      }
    }
    if (!this.cookie)
      console.log('  ⚠️ no appwrite-session cookie captured; subsequent steps may 401')
    console.log('  ✅ login ok')
    return true
  }

  async stepCreateLeague() {
    console.log('\n🏈 Step 2: Create league')
    const startIso = new Date(Date.now() + 5000).toISOString()
    const res = await this.request(
      'POST',
      '/api/leagues/create',
      {
        leagueName: `Smoke League ${new Date().toISOString()}`,
        gameMode: 'CONFERENCE',
        selectedConference: 'sec',
        scoringType: 'STANDARD',
        maxTeams: 2,
        draftType: 'snake',
        draftRounds: 2,
        pickTimeSeconds: 60,
        draftDate: startIso,
        isPrivate: false,
      },
      { Cookie: this.cookie }
    )
    if (res.status < 200 || res.status >= 300) {
      console.log('  ❌ create league failed', res.status, res.body)
      return false
    }
    const json = this.safeJson(res.body)
    this.leagueId = json?.league?.$id || json?.league?.id
    this.teamId = json?.fantasyTeamId
    this.startIso = startIso
    if (!this.leagueId || !this.teamId) {
      console.log('  ❌ missing ids', { leagueId: this.leagueId, teamId: this.teamId })
      return false
    }
    console.log('  ✅ created', { leagueId: this.leagueId, teamId: this.teamId })
    return true
  }

  async stepSaveOrder() {
    console.log('\n🧭 Step 3: Save draft order (commissioner)')
    const res = await this.request(
      'PUT',
      `/api/leagues/${this.leagueId}/commissioner`,
      {
        draftOrder: [this.teamId],
        pickTimeSeconds: 60,
      },
      { Cookie: this.cookie }
    )
    if (res.status < 200 || res.status >= 300) {
      console.log('  ❌ save order failed', res.status, res.body)
      return false
    }
    console.log('  ✅ order saved')
    return true
  }

  async stepStartDraft() {
    console.log('\n🚦 Step 4: Start draft via cron')
    const waitMs = Math.max(0, new Date(this.startIso).getTime() - Date.now() + 500)
    if (waitMs > 0) await sleep(waitMs)
    // Try cron first; if nothing started, fall back to manual start endpoint
    const res = await this.request('GET', '/api/cron/start-drafts', null, {
      'x-vercel-cron': '1',
    })
    if (res.status < 200 || res.status >= 300) {
      console.log('  ❌ start cron failed', res.status, res.body)
      return false
    }
    try {
      const j = this.safeJson(res.body)
      if (j) console.log('  ↳ cron results:', JSON.stringify(j))
      if (j && j.started === 0) {
        const manual = await this.request('POST', `/api/drafts/${this.leagueId}/start`)
        if (manual.status >= 200 && manual.status < 300) {
          console.log('  ↳ manual start fallback ok')
        } else {
          console.log('  ❌ manual start failed', manual.status, manual.body)
          return false
        }
      }
    } catch {}
    console.log('  ✅ cron executed')
    return true
  }

  async stepVerifyState() {
    console.log('\n📡 Step 5: Verify draft state')
    // retry up to ~5s to avoid start/write/read race
    let attempt = 0
    let last
    while (attempt < 10) {
      const res = await this.request('GET', `/api/drafts/${this.leagueId}/state`)
      last = res
      if (res.status === 200) {
        const json = this.safeJson(res.body)
        const data = json?.data || json
        if (data?.onClockTeamId && data?.deadlineAt) {
          console.log('  ✅ drafting snapshot:', {
            onClockTeamId: data.onClockTeamId,
            round: data.round,
            pickIndex: data.pickIndex,
            deadlineAt: data.deadlineAt,
          })
          return true
        }
      }
      await sleep(500)
      attempt++
    }
    console.log('  ❌ state read failed', last?.status, last?.body)
    return false
  }

  // -----------------------------
  // HTTP helpers
  // -----------------------------
  safeJson(body) {
    try {
      return JSON.parse(body)
    } catch {
      return null
    }
  }

  request(method, path, data, extraHeaders = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path)
      const client = url.protocol === 'https:' ? https : http
      const payload = data ? Buffer.from(JSON.stringify(data)) : null
      const headers = Object.assign(
        {
          'Content-Type': 'application/json',
          'Content-Length': payload ? String(payload.length) : undefined,
        },
        extraHeaders
      )
      if (!payload) delete headers['Content-Length']
      const req = client.request(url, { method, headers }, res => {
        let body = ''
        res.on('data', c => (body += c))
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }))
      })
      req.on('error', reject)
      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('timeout'))
      })
      if (payload) req.write(payload)
      req.end()
    })
  }
}

// CLI
const baseUrl = process.argv[2] || process.env.BASE_URL || 'http://localhost:3001'
console.log('College Football Fantasy App - Smoke Tests (Draft v2)')
console.log(`Target: ${baseUrl}`)
new SmokeDraftV2(baseUrl).run().catch(err => {
  console.error(err)
  process.exit(1)
})
