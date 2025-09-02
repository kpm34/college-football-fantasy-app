#!/usr/bin/env node
/*
  Scan docs/diagrams for duplicate diagram markdowns (by content hash) and
  move extras to ops/attic/diagrams-archive/duplicates. Keeps one canonical copy.
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = process.cwd();
const DIAGRAMS_DIR = path.join(repoRoot, 'docs', 'diagrams');
const ATTIC_DIR = path.join(repoRoot, 'ops', 'attic', 'diagrams-archive', 'duplicates');

fs.mkdirSync(ATTIC_DIR, { recursive: true });

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(p);
    } else if (entry.isFile() && p.endsWith('.md')) {
      yield p;
    }
  }
}

const files = Array.from(walk(DIAGRAMS_DIR));

function normalizeContent(s) {
  return s.replace(/\r\n/g, '\n').trim();
}

const groups = new Map(); // hash -> [file]
for (const file of files) {
  // Skip known archive/duplicates directories
  if (file.includes(`${path.sep}_duplicates${path.sep}`)) continue;
  if (file.includes(`${path.sep}ops${path.sep}`)) continue;

  const content = normalizeContent(fs.readFileSync(file, 'utf8'));
  if (!content) continue;
  const hash = crypto.createHash('sha1').update(content).digest('hex');
  if (!groups.has(hash)) groups.set(hash, []);
  groups.get(hash).push(file);
}

const toArchive = [];
for (const [hash, list] of groups.entries()) {
  if (list.length <= 1) continue;
  // Prefer canonical file that is not in project-map/docs.diagrams-archive* or _duplicates
  const sorted = list.slice().sort((a, b) => {
    const score = (p) => {
      let s = 0;
      if (p.includes(`${path.sep}_duplicates${path.sep}`)) s += 10;
      if (p.includes(`${path.sep}docs.diagrams-archive`)) s += 8;
      if (p.includes(`${path.sep}project-map${path.sep}`)) s += 1; // slight penalty, keep functional/system first
      return s + p.length * 0.001; // prefer shorter path
    };
    return score(a) - score(b);
  });
  const keep = sorted[0];
  const archiveThese = sorted.slice(1);
  for (const f of archiveThese) toArchive.push([f, keep]);
}

// Move duplicates
for (const [src, keep] of toArchive) {
  const rel = path.relative(DIAGRAMS_DIR, src).replace(/[\\/]/g, '__');
  const base = path.basename(rel).replace(/\.md$/, '');
  const dest = path.join(ATTIC_DIR, `${base}__DUP_OF__${path.basename(keep).replace(/\.md$/, '')}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
  console.log(`Archived duplicate: ${src} -> ${dest}`);
}

console.log(`Done. Duplicates archived: ${toArchive.length}`);
