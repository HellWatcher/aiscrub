#!/usr/bin/env node
'use strict';

// Anti-drift guard: the catalog size is written in three places (the patterns
// file itself, plus two spots in the README). This fails CI if they disagree,
// so adding a pattern can't silently leave a stale count behind.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const patterns = fs.readFileSync(path.join(root, 'references/patterns.md'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

// Source of truth: the highest "### N." heading in the catalog.
const nums = [...patterns.matchAll(/^### (\d+)\.\s/gm)].map((m) => Number(m[1]));
const actual = nums.length ? Math.max(...nums) : 0;
const contiguous = nums.length === actual && nums.every((n, i) => n === i + 1);

const errors = [];
if (!contiguous) {
  errors.push(
    `patterns.md headings are not contiguous 1..N (found ${nums.length} headings, max ${actual})`,
  );
}

// Every README mention of "N pattern(s)" must match.
const claims = [...readme.matchAll(/(\d+)\s+patterns?\b/g)].map((m) => ({
  n: Number(m[1]),
  ctx: m[0],
}));
if (!claims.length) {
  errors.push("README has no 'N patterns' claim to check against the catalog");
}
for (const c of claims) {
  if (c.n !== actual) {
    errors.push(`README says "${c.ctx}" but the catalog has ${actual} patterns`);
  }
}

if (errors.length) {
  console.error('check-counts: FAIL');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`check-counts: OK (${actual} patterns, README in sync)`);
