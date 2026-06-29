#!/usr/bin/env node
"use strict";

// Echo-detector eval (issue #4). Measures the close word/root repetition
// signal against the labeled sample in echo-fixtures.json so the window and
// the exact-vs-stem trade-off are chosen from numbers, not asserted.
//
//   node eval/echo.js            print the report
//   node eval/echo.js --json     machine-readable
//
// A fixture labeled "echo" should produce >=1 echo issue; one labeled
// "clean" should produce none. "stem"-kind echoes are only expected to be
// caught in the stem pass — they are excluded from the exact-mode recall
// denominator (and counted as the recall the stem pass buys).

const fs = require("fs");
const path = require("path");
const AIDetector = require("../detector/patterns.js");

const fixtures = JSON.parse(
  fs.readFileSync(path.join(__dirname, "echo-fixtures.json"), "utf8")
);
const asJson = process.argv.includes("--json");

function evalMode({ echoStem, echoWindow }) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  const misses = [];
  for (const f of fixtures) {
    // Exact mode is not expected to catch stem-only echoes; drop them from
    // its denominator so its recall reflects what it actually targets.
    if (!echoStem && f.label === "echo" && f.kind === "stem") continue;
    const issues = AIDetector.detectEcho(f.text, { echoStem, echoWindow });
    const predicted = issues.length > 0;
    const actual = f.label === "echo";
    if (actual && predicted) tp++;
    else if (actual && !predicted) { fn++; misses.push(`FN ${f.id}`); }
    else if (!actual && predicted) { fp++; misses.push(`FP ${f.id}`); }
    else tn++;
  }
  const safe = (a, b) => (b ? a / b : 1);
  return {
    tp, fp, tn, fn,
    precision: safe(tp, tp + fp),
    recall: safe(tp, tp + fn),
    fpRate: (fp + tn) ? fp / (fp + tn) : 0,
    misses,
  };
}

const DEFAULT_WINDOW = 20;
const sweep = [12, 15, 18, 20, 25].map((w) => ({ window: w, ...evalMode({ echoStem: false, echoWindow: w }) }));
const exact = evalMode({ echoStem: false, echoWindow: DEFAULT_WINDOW });
const stem = evalMode({ echoStem: true, echoWindow: DEFAULT_WINDOW });

if (asJson) {
  console.log(JSON.stringify({ n: fixtures.length, defaultWindow: DEFAULT_WINDOW, exact, stem, sweep }, null, 2));
} else {
  const pct = (x) => `${(x * 100).toFixed(0)}%`;
  console.log(`AIScrub echo eval — ${fixtures.length} labeled samples\n`);
  console.log(`exact  (window ${DEFAULT_WINDOW})  precision ${pct(exact.precision)}  recall ${pct(exact.recall)}  ` +
    `FP-rate ${pct(exact.fpRate)}  (tp${exact.tp} fp${exact.fp} tn${exact.tn} fn${exact.fn})`);
  console.log(`stem   (window ${DEFAULT_WINDOW})  precision ${pct(stem.precision)}  recall ${pct(stem.recall)}  ` +
    `FP-rate ${pct(stem.fpRate)}  (tp${stem.tp} fp${stem.fp} tn${stem.tn} fn${stem.fn})`);
  console.log("\nexact-mode window sweep:");
  for (const s of sweep) {
    console.log(`  window ${String(s.window).padEnd(3)} precision ${pct(s.precision)}  recall ${pct(s.recall)}  FP-rate ${pct(s.fpRate)}`);
  }
  const allMisses = [...new Set([...exact.misses, ...stem.misses])];
  if (allMisses.length) {
    console.log("\nmisclassifications (exact ∪ stem @ default window):");
    allMisses.forEach((m) => console.log(`  ${m}`));
  }
}

// Gate on the shipped default (exact mode): it must stay perfect on the
// labeled set. The stem pass is allowed to miss — its measured FP cost is
// the reason it's opt-in, not a regression.
if (exact.fp > 0 || exact.fn > 0) {
  console.error(
    `\necho-eval: FAIL — exact mode misclassified ${exact.fp} FP / ${exact.fn} FN on the labeled set`
  );
  process.exit(1);
}
console.log("\necho-eval: OK — exact mode clean on the labeled set");
