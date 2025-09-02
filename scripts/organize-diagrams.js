#!/usr/bin/env node

/*
Organize diagrams under docs/diagrams.
- Classifies into functional-flow, project-map, system-architecture
- Detects duplicates by SHA1 hash
- Generates docs/diagrams/_inventory.json
- Updates docs/diagrams/README.md Index section

Usage:
  node scripts/organize-diagrams.js --plan
  node scripts/organize-diagrams.js --apply
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { glob } = require('glob');

const ROOT = process.cwd();
const DIAGRAMS_DIR = path.join(ROOT, 'docs', 'diagrams');
const INVENTORY_PATH = path.join(DIAGRAMS_DIR, '_inventory.json');
const README_PATH = path.join(DIAGRAMS_DIR, 'README.md');
const DUP_DIR = path.join(DIAGRAMS_DIR, '_duplicates');

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const PLAN = args.has('--plan') || !APPLY;

const ALLOWED_EXT = new Set(['.md', '.drawio', '.excalidraw']);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function sha1(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function firstHeading(content) {
  // Try frontmatter title
  const fm = content.match(/^---[\s\S]*?\n---/);
  if (fm) {
    const title = fm[0].match(/\n\s*title:\s*['\"]?(.+?)['\"]?\s*\n/i);
    if (title) return title[1].trim();
  }
  // First markdown H1/H2
  const m = content.match(/^\s{0,3}#{1,2}\s+(.+)$/m);
  if (m) return m[1].trim();
  // Mermaid title comment
  const t = content.match(/%%\s*title:\s*(.+)\s*%%/i);
  if (t) return t[1].trim();
  return null;
}

function classify(filePath, content) {
  const p = filePath.replace(/\\/g, '/');
  const name = path.basename(p).toLowerCase();
  const text = content.toLowerCase();

  // Respect existing folder when clear
  if (p.includes('/functional-flow/')) return 'functional-flow';
  if (p.includes('/system-architecture/')) return 'system-architecture';
  if (p.includes('/project-map/')) return 'project-map';

  const isFunctional = /join|create\s*league|signup|sign\s*up|login|invite|draft|flow|sequence/.test(text) ||
                       /join|create|signup|login|invite|draft/.test(name);
  if (isFunctional) return 'functional-flow';

  const isArchitecture = /architecture|data\s*flow|realtime|cron|pipeline|projection|kv|cache|background|event bus/.test(text) ||
                         /arch|system|flow/.test(name);
  if (isArchitecture) return 'system-architecture';

  // Default
  return 'project-map';
}

async function collectFiles() {
  const pattern = path.join(DIAGRAMS_DIR, '**', '*');
  const paths = (await glob(pattern, { nodir: true }))
    .filter(p => ALLOWED_EXT.has(path.extname(p).toLowerCase()));
  const items = [];
  for (const p of paths) {
    try {
      const content = read(p);
      const hash = sha1(content);
      const title = firstHeading(content) || path.parse(p).name;
      const category = classify(p, content);
      items.push({ path: p, rel: path.relative(DIAGRAMS_DIR, p), title, hash, category, size: fs.statSync(p).size });
    } catch (e) {
      // skip unreadable
    }
  }
  return items;
}

function proposeMoves(items) {
  const byHash = new Map();
  const moves = [];
  for (const it of items) {
    const prev = byHash.get(it.hash);
    if (prev) {
      // Duplicate
      it.duplicateOf = prev.rel;
      continue;
    }
    byHash.set(it.hash, it);

    // Destination path
    const ext = path.extname(it.path);
    const baseSlug = slugify(it.title || path.parse(it.path).name);
    let destDir;
    if (it.category === 'functional-flow') destDir = path.join(DIAGRAMS_DIR, 'functional-flow');
    else if (it.category === 'system-architecture') destDir = path.join(DIAGRAMS_DIR, 'system-architecture');
    else destDir = path.join(DIAGRAMS_DIR, 'project-map');

    // Respect existing project-map substructure like app.* diagrams
    let destRel = path.relative(DIAGRAMS_DIR, path.join(destDir, baseSlug + ext));
    const name = path.basename(it.path).toLowerCase();
    if (it.category === 'project-map' && /^(app|lib|ops|data|docs|functions)\./.test(name)) {
      destRel = path.relative(DIAGRAMS_DIR, path.join(destDir, path.basename(it.path))); // keep filename
    }

    if (path.normalize(it.rel) !== path.normalize(destRel)) {
      moves.push({ from: it.rel, to: destRel });
      it.proposed = destRel;
    }
  }
  return { moves, items };
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function applyMoves(moves) {
  for (const mv of moves) {
    const fromAbs = path.join(DIAGRAMS_DIR, mv.from);
    const toAbs = path.join(DIAGRAMS_DIR, mv.to);
    ensureDir(path.dirname(toAbs));
    if (!fs.existsSync(fromAbs)) continue;
    if (path.normalize(fromAbs) === path.normalize(toAbs)) continue;
    fs.renameSync(fromAbs, toAbs);
    console.log(`moved: ${mv.from} -> ${mv.to}`);
  }
}

function quarantineDuplicates(items) {
  ensureDir(DUP_DIR);
  for (const it of items) {
    if (!it.duplicateOf) continue;
    const fromAbs = path.join(DIAGRAMS_DIR, it.rel);
    if (!fs.existsSync(fromAbs)) continue;
    const toAbs = path.join(DUP_DIR, path.basename(it.rel));
    fs.renameSync(fromAbs, toAbs);
    console.log(`duplicate -> ${path.relative(DIAGRAMS_DIR, toAbs)} (of ${it.duplicateOf})`);
  }
}

function updateInventory(items, moves) {
  const data = {
    generatedAt: new Date().toISOString(),
    root: path.relative(ROOT, DIAGRAMS_DIR),
    total: items.length,
    duplicates: items.filter(i => i.duplicateOf).length,
    moves,
    files: items.map(i => ({ rel: i.rel, title: i.title, hash: i.hash, category: i.category, size: i.size, proposed: i.proposed, duplicateOf: i.duplicateOf }))
  };
  fs.writeFileSync(INVENTORY_PATH, JSON.stringify(data, null, 2));
}

function renderIndex(items) {
  const byCat = new Map();
  for (const i of items) {
    if (i.duplicateOf) continue; // hide quarantined
    const key = i.category;
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key).push(i);
  }
  for (const list of byCat.values()) list.sort((a, b) => a.title.localeCompare(b.title));

  let out = '';
  for (const [cat, list] of Array.from(byCat.entries()).sort()) {
    out += `\n- **${cat}**\n`;
    for (const f of list) {
      const rel = f.proposed ? f.proposed : f.rel;
      out += `  - [${f.title}](/docs/diagrams/${rel.replace(/\\/g, '/')})\n`;
    }
  }
  return out.trim() + '\n';
}

function updateReadme(indexBlock) {
  if (!fs.existsSync(README_PATH)) return;
  const current = read(README_PATH);
  const marker = '## Index (auto-generated by script)';
  const i = current.indexOf(marker);
  let next;
  if (i === -1) {
    next = current.trimEnd() + `\n\n${marker}\n${indexBlock}`;
  } else {
    next = current.slice(0, i + marker.length) + '\n' + indexBlock;
  }
  fs.writeFileSync(README_PATH, next, 'utf8');
}

(async () => {
  if (!fs.existsSync(DIAGRAMS_DIR)) {
    console.error('Diagrams directory not found:', DIAGRAMS_DIR);
    process.exit(1);
  }

  const items = await collectFiles();
  const { moves } = proposeMoves(items);

  if (PLAN) {
    console.log(`Found ${items.length} diagram files`);
    console.log(`Would move ${moves.length} files`);
    const dupCount = items.filter(i => i.duplicateOf).length;
    console.log(`Found ${dupCount} duplicates`);
  }

  if (APPLY) {
    if (moves.length) applyMoves(moves);
    quarantineDuplicates(items);
  }

  updateInventory(items, moves);
  const indexBlock = renderIndex(items);
  updateReadme(indexBlock);

  if (PLAN) {
    console.log('Plan complete. Inventory written to', path.relative(ROOT, INVENTORY_PATH));
  } else {
    console.log('Apply complete. Inventory written to', path.relative(ROOT, INVENTORY_PATH));
  }
})();
