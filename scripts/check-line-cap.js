#!/usr/bin/env node
"use strict";

// Anti-drift guard for the file-size standard (see STANDARDS.md): runtime and
// test JS must stay under a soft line cap so files stay legible and modular.
// DATA files (long pattern/lexicon tables) are exempt — they are exempted
// either by living under a `data/` directory or by carrying a
// `// @cap-exempt: DATA` marker in their first few lines. Fails CI on any
// violation, so a file can't silently balloon past the cap.
//
//   node scripts/check-line-cap.js            enforce the default cap
//   node scripts/check-line-cap.js --cap=400  override the cap

const fs = require("fs");
const path = require("path");

const CAP = (() => {
  const arg = process.argv.find((a) => a.startsWith("--cap="));
  return arg ? Number(arg.split("=")[1]) : 300;
})();

const root = path.resolve(__dirname, "..");
// Runtime + test JS. Prose and JSON fixtures are out of scope.
const SCAN_DIRS = ["detector", "eval", "scripts"];
const EXEMPT_MARKER = "@cap-exempt: DATA";

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && entry.name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

function isExempt(file, text) {
  // Convention 1: anything under a `data/` directory is a data module.
  if (/(^|[/\\])data[/\\]/.test(path.relative(root, file))) return true;
  // Convention 2: an explicit marker in the first 5 lines.
  return text.split(/\r?\n/, 5).some((l) => l.includes(EXEMPT_MARKER));
}

const files = SCAN_DIRS.flatMap((d) => {
  const abs = path.join(root, d);
  return fs.existsSync(abs) ? walk(abs, []) : [];
});

let exemptCount = 0;
const violations = [];
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (isExempt(file, text)) {
    exemptCount++;
    continue;
  }
  const lines = text.split(/\r?\n/).length;
  if (lines > CAP) violations.push({ file: path.relative(root, file), lines });
}

if (violations.length) {
  console.error(`check-line-cap: FAIL (cap ${CAP})`);
  violations
    .sort((a, b) => b.lines - a.lines)
    .forEach((v) => console.error(`  - ${v.file}: ${v.lines} lines`));
  console.error(
    `\nSplit the file, or mark a genuine data table exempt (move it under data/ or add "// ${EXEMPT_MARKER}").`
  );
  process.exit(1);
}

console.log(
  `check-line-cap: OK (${files.length} files scanned, ${exemptCount} data-exempt, cap ${CAP})`
);
