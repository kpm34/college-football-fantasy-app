#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_appwrite_1 = require("node-appwrite");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function assertServerEnv() {
    const req = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
    const miss = req.filter((k) => !process.env[k]);
    if (miss.length)
        throw new Error(`Missing env: ${miss.join(', ')}`);
}
function getDatabases() {
    const client = new node_appwrite_1.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);
    const databases = new node_appwrite_1.Databases(client);
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
    return { databases, dbId };
}
function parseMaybeJson(val) {
    if (val == null)
        return {};
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        }
        catch {
            return {};
        }
    }
    return val;
}
function clamp(min, max, v) { return Math.max(min, Math.min(max, v)); }
// --- Scoring ---
function score(stat) {
    let pts = 0;
    pts += (stat.pass_yards || 0) * 0.04;
    pts += (stat.pass_tds || 0) * 4;
    pts += (stat.ints || 0) * -2;
    pts += (stat.rush_yards || 0) * 0.1;
    pts += (stat.rush_tds || 0) * 6;
    pts += (stat.rec_yards || 0) * 0.1;
    pts += (stat.rec_tds || 0) * 6;
    pts += (stat.receptions || 0) * 1;
    return Math.round(pts * 10) / 10;
}
async function ensureYearlyAttributes(databases, dbId) {
    try {
        await databases.getAttribute(dbId, 'projections_yearly', 'statline_simple_json');
    }
    catch {
        await databases.createStringAttribute(dbId, 'projections_yearly', 'statline_simple_json', 8192, false);
    }
}
function oppScalarFromOffZ(z) {
    // Convert offensive z-score to a modest multiplier
    return clamp(0.85, 1.15, 1 + (z || 0) * 0.05);
}
function getUsageRate(pos, pri) {
    if (!pri)
        return 0;
    if (pos === 'RB')
        return pri.rush_share ?? pri.snap_share ?? 0;
    if (pos === 'WR' || pos === 'TE')
        return pri.target_share ?? pri.snap_share ?? 0;
    return pri.snap_share ?? 1.0;
}
function getDepthChartMultiplier(pos, posRank) {
    // Apply position-specific depth chart multipliers
    if (pos === 'QB') {
        // QBs have the steepest dropoff
        if (posRank === 1)
            return 1.0; // Starter gets full usage
        if (posRank === 2)
            return 0.25; // Backup gets 25%
        return 0.05; // 3rd string and below get 5%
    }
    if (pos === 'RB') {
        // RBs have more gradual dropoff due to rotation
        if (posRank === 1)
            return 1.0; // RB1
        if (posRank === 2)
            return 0.65; // RB2 gets good carries
        if (posRank === 3)
            return 0.35; // RB3 in rotation
        return 0.15; // Deep depth
    }
    if (pos === 'WR') {
        // WRs have moderate dropoff, multiple can be fantasy relevant
        if (posRank === 1)
            return 1.0; // WR1
        if (posRank === 2)
            return 0.85; // WR2 still very relevant
        if (posRank === 3)
            return 0.60; // WR3 decent usage
        if (posRank === 4)
            return 0.35; // WR4 situational
        return 0.15; // WR5+
    }
    if (pos === 'TE') {
        // TEs similar to WRs but steeper dropoff
        if (posRank === 1)
            return 1.0; // TE1
        if (posRank === 2)
            return 0.50; // TE2 gets some usage
        return 0.20; // TE3+
    }
    return 1.0; // Default fallback
}
async function main() {
    assertServerEnv();
    const seasonArg = process.argv.find((a) => a.startsWith('--season='));
    const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
    const { databases, dbId } = getDatabases();
    await ensureYearlyAttributes(databases, dbId);
    // Load model_inputs for season (week null)
    const res = await databases.listDocuments(dbId, 'model_inputs', [node_appwrite_1.Query.equal('season', season), node_appwrite_1.Query.limit(1)]);
    const model = res.documents.find((d) => d.week === undefined || d.week === null);
    if (!model)
        throw new Error(`model_inputs not found for season=${season}`);
    const depthChart = parseMaybeJson(model.depth_chart_json);
    const usagePriors = parseMaybeJson(model.usage_priors_json);
    const teamEff = parseMaybeJson(model.team_efficiency_json);
    const pace = parseMaybeJson(model.pace_estimates_json);
    const ea = parseMaybeJson(model.ea_ratings_json);
    const draft = parseMaybeJson(model.nfl_draft_capital_json);
    // Build inverse team map (team_id -> probable names) if file exists for name matching
    let idToNames = {};
    try {
        const mapPath = node_path_1.default.join(process.cwd(), 'data/teams_map.json');
        if (node_fs_1.default.existsSync(mapPath)) {
            const tm = JSON.parse(node_fs_1.default.readFileSync(mapPath, 'utf8'));
            for (const [name, id] of Object.entries(tm)) {
                idToNames[id] = [...(idToNames[id] || []), name];
            }
        }
    }
    catch { }
    // Iterate players
    const candidates = [];
    for (const [teamId, positions] of Object.entries(depthChart || {})) {
        const teamPace = pace?.[teamId]?.plays_per_game || (teamEff?.[teamId]?.pace_est ?? 70);
        const offZ = teamEff?.[teamId]?.off_eff ?? 0;
        for (const posKey of ['QB', 'RB', 'WR', 'TE']) {
            const arr = positions[posKey];
            if (!arr)
                continue;
            const priArr = usagePriors?.[teamId]?.[posKey];
            for (const p of arr) {
                const pri = priArr?.find((x) => (x.player_name || '').trim().toLowerCase() === (p.player_name || '').trim().toLowerCase());
                let usage_rate = getUsageRate(posKey, pri);
                if (usage_rate < 0.05)
                    continue;
                // Apply depth chart multipliers to usage rate based on pos_rank
                const depthMultiplier = getDepthChartMultiplier(posKey, p.pos_rank || 1);
                usage_rate = usage_rate * depthMultiplier;
                const effScalar = oppScalarFromOffZ(offZ);
                const injKey = findEAKey(ea, p.player_name, teamId, posKey);
                const injNorm = injKey && ea[injKey]?.inj?.norm ? Number(ea[injKey].inj.norm) : 0.5;
                const games = Math.round(12 * clamp(0.7, 1.0, 0.85 + 0.15 * injNorm));
                const dKey = buildKey(p.player_name, teamId, posKey);
                const draftBoost = draft?.[dKey]?.draft_capital_score && draft[dKey].draft_capital_score > 0.8 ? 1.03 : 1.0;
                candidates.push({ teamId, pos: posKey, player_name: p.player_name, usage_rate, pace_adj: teamPace * effScalar, effZ: offZ, games, draftBoost, eaKey: injKey });
            }
        }
    }
    // Compute projections and upsert
    const results = [];
    for (const c of candidates) {
        const stat = computeStatline(c);
        const points = score(stat) * c.draftBoost;
        const playerId = await resolvePlayerId(databases, dbId, c.teamId, c.pos, c.player_name, idToNames);
        if (!playerId)
            continue;
        await upsertYearly(databases, dbId, playerId, season, {
            games_played_est: c.games,
            usage_rate: Number(c.usage_rate.toFixed(3)),
            pace_adj: Number(c.pace_adj.toFixed(2)),
            statline_simple_json: JSON.stringify(stat),
            fantasy_points_simple: Number(points.toFixed(1)),
            position: c.pos,
            model_version: 'v2_depth_fixed'
        });
        results.push({ key: `${c.player_name}|${c.teamId}|${c.pos}`, points: Number(points.toFixed(1)) });
    }
    // Log top 10
    results.sort((a, b) => b.points - a.points);
    console.log('Top 10 yearly (simple):');
    for (const r of results.slice(0, 10))
        console.log(r);
}
function computeStatline(c) {
    const P = c.pace_adj; // plays per game (adjusted)
    const G = c.games;
    const PR = 0.52; // simple global pass rate
    const RR = 1 - PR;
    if (c.pos === 'QB') {
        const passAtt = P * PR * 1.0 * G;
        const passYds = passAtt * 7.5;
        const passTD = passAtt * 0.05;
        const ints = passAtt * 0.025;
        const rushAtt = P * RR * 0.10 * G;
        const rushYds = rushAtt * 5.0;
        const rushTD = rushAtt * 0.02;
        return { pass_yards: Math.round(passYds), pass_tds: Math.round(passTD), ints: Math.round(ints), rush_yards: Math.round(rushYds), rush_tds: Math.round(rushTD), receptions: 0, rec_yards: 0, rec_tds: 0 };
    }
    if (c.pos === 'RB') {
        const rushAtt = P * RR * c.usage_rate * G;
        const rushYds = rushAtt * 4.8;
        const rushTD = rushAtt * 0.03;
        const targets = P * PR * (c.usage_rate * 0.5) * G;
        const rec = targets * 0.65;
        const recYds = rec * 7.5;
        const recTD = targets * 0.03;
        return { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: Math.round(rushYds), rush_tds: Math.round(rushTD), receptions: Math.round(rec), rec_yards: Math.round(recYds), rec_tds: Math.round(recTD) };
    }
    // WR / TE
    const targets = P * PR * c.usage_rate * G;
    const catchRate = c.pos === 'TE' ? 0.62 : 0.65;
    const ypr = c.pos === 'TE' ? 10 : 12;
    const tdRate = c.pos === 'TE' ? 0.04 : 0.05;
    const rec = targets * catchRate;
    const recYds = rec * ypr;
    const recTD = targets * tdRate;
    return { pass_yards: 0, pass_tds: 0, ints: 0, rush_yards: 0, rush_tds: 0, receptions: Math.round(rec), rec_yards: Math.round(recYds), rec_tds: Math.round(recTD) };
}
function buildKey(playerName, teamId, pos) {
    return `${playerName}|${teamId}|${pos}`;
}
function findEAKey(ea, playerName, teamId, pos) {
    const key = buildKey(playerName, teamId, pos);
    if (ea && ea[key])
        return key;
    // fallback: loose search by includes
    const lname = playerName.trim().toLowerCase();
    return Object.keys(ea || {}).find((k) => k.toLowerCase().includes(lname) && k.includes(`|${teamId}|`) && k.endsWith(`|${pos}`));
}
async function resolvePlayerId(databases, dbId, teamId, pos, playerName, idToNames) {
    try {
        const teamNames = idToNames[teamId] || [];
        const q = [node_appwrite_1.Query.equal('position', pos), node_appwrite_1.Query.limit(5)];
        if (playerName)
            q.push(node_appwrite_1.Query.search('name', playerName));
        const res = await databases.listDocuments(dbId, 'college_players', q);
        const docs = res.documents;
        const doc = docs.find((d) => {
            const nameOk = (d.name || '').toString().toLowerCase().includes(playerName.toLowerCase());
            const teamOk = teamNames.length === 0 || teamNames.some((n) => ((d.team || d.school || '').toString().toLowerCase() === n.toLowerCase()));
            return nameOk && teamOk;
        }) || docs[0];
        return doc ? doc.$id : null;
    }
    catch {
        return null;
    }
}
async function upsertYearly(databases, dbId, playerId, season, data) {
    // Find existing
    const existing = await databases.listDocuments(dbId, 'projections_yearly', [node_appwrite_1.Query.equal('player_id', playerId), node_appwrite_1.Query.equal('season', season), node_appwrite_1.Query.limit(1)]);
    if (existing.total > 0) {
        const id = existing.documents[0].$id;
        await databases.updateDocument(dbId, 'projections_yearly', id, data);
    }
    else {
        await databases.createDocument(dbId, 'projections_yearly', node_appwrite_1.ID.unique(), { player_id: playerId, season, ...data });
    }
}
const _entry = process.argv[1] || '';
if (_entry.includes('project-yearly-simple')) {
    main().catch((e) => { console.error('❌ project:yearly_simple failed', e); process.exit(1); });
}
