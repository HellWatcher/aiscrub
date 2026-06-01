#!/usr/bin/env node
"use strict";

// Thin CLI over the detector engine so the agent (or CI) can score text with a
// single command instead of an inline require() snippet.
//
//   node detector/cli.js <file> [file...]   score one or more files
//   echo "text" | node detector/cli.js      score stdin
//   node detector/cli.js draft.md --json     machine-readable output
//   node detector/cli.js draft.md --technical use the technical context mode
//   node detector/cli.js draft.md --fail-over=40   exit 1 if any score > 40
//
// Exit code is 0 unless --fail-over=N is set and a score exceeds N, which lets
// the same command act as a pre-filter gate in scripts and CI.

const fs = require("fs");
const path = require("path");
const AIDetector = require("./patterns.js");

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("-")));
const files = argv.filter((a) => !a.startsWith("-"));
const json = flags.has("--json");
const contextMode = flags.has("--technical") ? "technical" : "general";
const failOverArg = argv.find((a) => a.startsWith("--fail-over="));
const failOver = failOverArg ? Number(failOverArg.split("=")[1]) : NaN;

function readInputs() {
  if (files.length) {
    return files.map((f) => ({ name: f, text: fs.readFileSync(f, "utf8") }));
  }
  // No file args: read stdin.
  return [{ name: "<stdin>", text: fs.readFileSync(0, "utf8") }];
}

let inputs;
try {
  inputs = readInputs();
} catch (err) {
  console.error(`aiscrub-detect: ${err.message}`);
  process.exit(2);
}

let worst = 0;
const results = inputs.map(({ name, text }) => {
  const r = AIDetector.analyzeText(text, { contextMode });
  if (typeof r.score === "number") worst = Math.max(worst, r.score);
  return { name, r };
});

if (json) {
  const out = results.map(({ name, r }) => ({
    file: name,
    score: r.score,
    label: r.label,
    classification: r.document_classification,
    confidence: r.confidence_category,
    issues: r.issues,
  }));
  console.log(JSON.stringify(out.length === 1 ? out[0] : out, null, 2));
} else {
  for (const { name, r } of results) {
    const base = path.basename(name);
    console.log(
      `${base}: ${r.score}/100 ${r.label} ` +
        `[${r.document_classification}, ${r.confidence_category} confidence] ` +
        `- ${r.issues.length} issue(s)`
    );
    const byType = {};
    for (const i of r.issues) byType[i.type] = (byType[i.type] || 0) + 1;
    Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([t, c]) => console.log(`  - ${t} x${c}`));
  }
}

if (!Number.isNaN(failOver)) {
  process.exit(worst > failOver ? 1 : 0);
}
