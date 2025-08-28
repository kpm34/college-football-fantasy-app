#!/usr/bin/env tsx
/**
 * E2E: two users create/join a league and make a live pick
 * - User A: signup + login, create league (sets draft time)
 * - User B: signup + login, join same league via join API
 * - Force-start draft and make a pick
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.APPWRITE_API_KEY) { dotenv.config(); }

import { Client, Databases, ID, Query } from 'node-appwrite';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const CRON_SECRET = process.env.CRON_SECRET || '';
const API_KEY = process.env.APPWRITE_API_KEY || '';

function assertEnv(name: string, val?: string) {
  if (!val) throw new Error(`Missing required env: ${name}`);
}

assertEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT', APPWRITE_ENDPOINT);
assertEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID', APPWRITE_PROJECT_ID);
assertEnv('NEXT_PUBLIC_APPWRITE_DATABASE_ID', DATABASE_ID);
assertEnv('APPWRITE_API_KEY', API_KEY);
assertEnv('CRON_SECRET', CRON_SECRET);

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function appwriteEmailSession(email: string, password: string): Promise<string> {
  const res = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Response-Format': '1.4.0'
    },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Login failed: ${res.status} ${txt}`);
  }
  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/a_session_[^=]+=([^;]+)/);
  if (!match) throw new Error('No Appwrite session cookie in response');
  return match[1];
}

async function signup(email: string, password: string, name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Signup failed: ${res.status} ${txt}`);
  }
}

async function createLeague(cookie: string, opts: { leagueName: string; maxTeams?: number; gameMode?: string; draftType?: string; pickTimeSeconds?: number; draftDate?: string; teamName?: string; }): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/leagues/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `appwrite-session=${cookie}`
    },
    body: JSON.stringify({
      leagueName: opts.leagueName,
      maxTeams: opts.maxTeams ?? 4,
      gameMode: opts.gameMode ?? 'power4',
      draftType: opts.draftType ?? 'snake',
      pickTimeSeconds: opts.pickTimeSeconds ?? 60,
      draftDate: opts.draftDate,
      teamName: opts.teamName ?? `${opts.leagueName} Comm`
    })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`Create league failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function updateLeagueSettings(cookie: string, leagueId: string, payload: any): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/leagues/${leagueId}/commissioner`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: `appwrite-session=${cookie}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Update league settings failed: ${res.status} ${txt}`);
  }
}

async function joinLeague(cookie: string, leagueId: string, teamName: string, password?: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/leagues/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `appwrite-session=${cookie}`
    },
    body: JSON.stringify({ leagueId, teamName, password })
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`Join league failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function resetDraft(leagueId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/debug/drafts/${leagueId}/reset`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${CRON_SECRET}` }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Reset draft failed: ${res.status} ${txt}`);
  }
}

async function startDraft(leagueId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/drafts/${leagueId}/start?force=true&reset=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${CRON_SECRET}` }
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(`Start draft failed: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function getDraftData(cookie: string, leagueId: string) {
  const res = await fetch(`${BASE_URL}/api/drafts/${leagueId}/data`, {
    headers: { cookie: `appwrite-session=${cookie}` }
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(`Get draft data failed: ${res.status} ${JSON.stringify(json)}`);
  return json.data;
}

async function pollOnClock(cookie: string, leagueId: string, attempts = 10, delayMs = 1000): Promise<string | undefined> {
  for (let i = 0; i < attempts; i++) {
    try {
      const data = await getDraftData(cookie, leagueId);
      const onClock = data?.draftState?.onClockTeamId;
      if (onClock) return String(onClock);
    } catch {}
    await sleep(delayMs);
  }
  return undefined;
}

async function makePick(leagueId: string, fantasyTeamId: string, playerId: string, by?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/drafts/${leagueId}/pick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, fantasyTeamId, by })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Pick failed: ${res.status} ${txt}`);
  }
}

async function selectAnyEligiblePlayer(): Promise<string> {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(API_KEY);
  const db = new Databases(client);
  const players = await db.listDocuments(DATABASE_ID, 'college_players', [Query.equal('eligible', true), Query.limit(1)]);
  if (players.documents.length === 0) throw new Error('No eligible players found');
  return players.documents[0].$id;
}

(async () => {
  const emailA = `e2e_a_${Date.now()}@cfbfantasy.app`;
  const emailB = `e2e_b_${Date.now()}@cfbfantasy.app`;
  const password = 'TestPass123!';

  console.log('Signing up users...');
  await signup(emailA, password, 'E2E A');
  await signup(emailB, password, 'E2E B');

  console.log('Creating sessions...');
  const cookieA = await appwriteEmailSession(emailA, password);
  const cookieB = await appwriteEmailSession(emailB, password);

  console.log('Creating league as user A...');
  const draftDateIso = new Date(Date.now() + 10_000).toISOString();
  const created = await createLeague(cookieA, {
    leagueName: `E2E League ${new Date().toISOString().slice(11,19)}`,
    maxTeams: 4,
    draftDate: draftDateIso,
    pickTimeSeconds: 60,
    teamName: 'Team A'
  });
  const leagueId = created.league.$id;
  const teamAId = created.fantasyTeamId as string;

  console.log('Updating league draft time explicitly...');
  await updateLeagueSettings(cookieA, leagueId, { draftDate: draftDateIso, pickTimeSeconds: 60 });

  console.log('Joining league as user B...');
  const joinRes = await joinLeague(cookieB, leagueId, 'Team B');
  const teamBId = joinRes.fantasyTeamId as string;

  console.log('Setting draft order to [TeamA, TeamB]...');
  await updateLeagueSettings(cookieA, leagueId, { draftOrder: [teamAId, teamBId], pickTimeSeconds: 60 });

  console.log('Resetting draft state...');
  await resetDraft(leagueId);

  console.log('Starting draft (force)...');
  const start = await startDraft(leagueId);

  console.log('Waiting briefly for state propagation...');
  await sleep(1500);

  console.log('Fetching draft data...');
  const data = await getDraftData(cookieA, leagueId);
  const teamA = (data.userTeams[0] && data.userTeams[0].$id) ? data.userTeams[0].$id : undefined;
  if (!teamA) throw new Error('Could not resolve Team A ID from draft data');
  let onClockTeamId = data?.draftState?.onClockTeamId;
  if (!onClockTeamId) {
    console.log('Polling for onClock...');
    onClockTeamId = await pollOnClock(cookieA, leagueId, 10, 1000);
  }
  console.log('Draft onClockTeamId:', onClockTeamId, 'Team A:', teamA);

  console.log('Selecting a player to pick...');
  const playerId = await selectAnyEligiblePlayer();

  const targetCandidates: string[] = [];
  if (onClockTeamId) targetCandidates.push(String(onClockTeamId));
  targetCandidates.push(teamAId, teamBId);

  let picked = false;
  for (const tgt of targetCandidates.filter(Boolean)) {
    try {
      console.log('Making pick for team:', tgt);
      await makePick(leagueId, tgt, playerId, 'E2E');
      picked = true;
      break;
    } catch (e) {
      console.warn('Pick attempt failed for', tgt, e instanceof Error ? e.message : e);
    }
  }

  if (!picked) throw new Error('Failed to make a pick for any team on clock');

  console.log('✅ E2E completed: two users joined and first pick made.');
})();
