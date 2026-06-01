#!/usr/bin/env node
"use strict";

// Eval harness for the deterministic detector. Runs it over the labeled corpus
// in fixtures.json and reports precision / recall / false-positive rate, so the
// "signals not proof, false-positive biased" design claims are measured rather
// than asserted.
//
//   node eval/run.js                 print the report
//   node eval/run.js --max-fp=0.15   also exit 1 if the strict FP-rate exceeds N
//   node eval/run.js --json          machine-readable
//
// Two views, because the engine is intentionally false-negative biased:
//   strict  — predicted AI only when classification is AI_ONLY (the "don't
//             accuse a human" view; this is what the FP budget guards)
//   lenient — predicted AI when classification is not HUMAN_ONLY (recall view)

const fs = require("fs");
const path = require("path");
const AIDetector = require("../detector/patterns.js");

const fixtures = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures.json"), "utf8")
);
const maxFpArg = process.argv.find((a) => a.startsWith("--max-fp="));
const maxFp = maxFpArg ? Number(maxFpArg.split("=")[1]) : NaN;
const asJson = process.argv.includes("--json");

// Score every fixture once.
const scored = fixtures.map((f) => ({
  ...f,
  r: AIDetector.analyzeText(f.text),
}));

function confusion(predictAI) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const s of scored) {
    const actualAI = s.label === "ai";
    const predAI = predictAI(s.r);
    if (actualAI && predAI) tp++;
    else if (actualAI && !predAI) fn++;
    else if (!actualAI && predAI) fp++;
    else tn++;
  }
  const safe = (a, b) => (b ? a / b : 1);
  return {
    tp, fp, tn, fn,
    precision: safe(tp, tp + fp),
    recall: safe(tp, tp + fn),
    fpRate: (fp + tn) ? fp / (fp + tn) : 0,
    accuracy: (tp + tn) / scored.length,
  };
}

const views = {
  strict: confusion((r) => r.document_classification === "AI_ONLY"),
  lenient: confusion((r) => r.document_classification !== "HUMAN_ONLY"),
};

// Score-threshold sweep (predicted AI when score >= T).
const sweep = [20, 30, 40, 50].map((t) => ({
  threshold: t,
  ...confusion((r) => (r.score || 0) >= t),
}));

if (asJson) {
  console.log(JSON.stringify({ n: scored.length, views, sweep }, null, 2));
} else {
  const pct = (x) => `${(x * 100).toFixed(0)}%`;
  console.log(`AIScrub detector eval — ${scored.length} labeled samples\n`);
  for (const [name, v] of Object.entries(views)) {
    console.log(
      `${name.padEnd(8)} precision ${pct(v.precision)}  recall ${pct(v.recall)}  ` +
        `FP-rate ${pct(v.fpRate)}  accuracy ${pct(v.accuracy)}  ` +
        `(tp${v.tp} fp${v.fp} tn${v.tn} fn${v.fn})`
    );
  }
  console.log("\nscore-threshold sweep:");
  for (const s of sweep) {
    console.log(
      `  >=${String(s.threshold).padEnd(3)} precision ${pct(s.precision)}  ` +
        `recall ${pct(s.recall)}  FP-rate ${pct(s.fpRate)}`
    );
  }
  // Surface any misclassified sample so failures are actionable.
  const misses = scored.filter(
    (s) =>
      (s.label === "ai") !== (s.r.document_classification !== "HUMAN_ONLY")
  );
  if (misses.length) {
    console.log("\nlenient-view misses:");
    misses.forEach((s) =>
      console.log(
        `  ${s.id} (${s.label}) -> ${s.r.document_classification} score ${s.r.score}`
      )
    );
  }
}

if (!Number.isNaN(maxFp)) {
  const fpr = views.strict.fpRate;
  if (fpr > maxFp) {
    console.error(
      `\neval: FAIL — strict FP-rate ${(fpr * 100).toFixed(0)}% exceeds budget ${(maxFp * 100).toFixed(0)}%`
    );
    process.exit(1);
  }
  console.log(
    `\neval: OK — strict FP-rate ${(fpr * 100).toFixed(0)}% within budget ${(maxFp * 100).toFixed(0)}%`
  );
}
