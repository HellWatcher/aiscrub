#!/usr/bin/env node
'use strict';

// Research probe for issue #3: is figurative-language *density* a usable,
// LLM-free stylometric signal, and can NOVEL (non-catalogued) metaphor be
// detected cheaply? Prototypes two approaches and measures them against the
// labeled sample in metaphor-fixtures.json.
//
//   node eval/metaphor-probe.js          print the report
//   node eval/metaphor-probe.js --json   machine-readable
//
// Approach A — stock-lexicon density: count catalogued stock-metaphor words
//   per 100 words. This is essentially what the existing tiered vocabulary
//   already does; included as the baseline the novel detector must beat.
//
// Approach B — novel-figuration heuristic (POS-free, no model): three rule
//   families over small curated word lists —
//     (1) copular image metaphor: <abstract> is/are the <image-noun>,
//     (2) physical verb on abstract object: <physical-verb> the <abstract>,
//     (3) image-idiom phrases (lose the plot / pick the thread up / find the path).
//   This targets fresh imagery the stock list never sees.
//
// The probe reports: mean density per class (human/ai/non-native), Approach B
// precision/recall for predicting figurative==true, and an explicit
// false-positive breakdown on literal and non-native prose.

const fs = require('fs');
const path = require('path');

const fixtures = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'metaphor-fixtures.json'), 'utf8'),
);
const asJson = process.argv.includes('--json');

// ── Approach A lexicon: catalogued stock metaphors (overlaps the tiers) ──
const STOCK = new Set(
  'landscape tapestry realm beacon ecosystem navigate navigating journey unlock unlocks unleash symphony illuminate illuminating cornerstone catalyst springboard roadmap lighthouse tide wave engine fuels bridge weaving weave threads thread vision potential'.split(
    ' ',
  ),
);

// ── Approach B lists ──
const IMAGE_NOUNS = new Set(
  'lens thread plot path road bridge anchor mirror window door wall mountain ocean current tide root seed engine gear compass map lighthouse fog storm knot web fabric beacon'.split(
    ' ',
  ),
);
const PHYSICAL_VERBS = new Set(
  'dig lift carry weave wrestle grab grasp plant anchor bridge peel untangle unravel chase hunt climb knit stitch juggle steer sail swim drown sink float navigate work'.split(
    ' ',
  ),
);
const ABSTRACT_NOUNS = new Set(
  'problem impact value idea decision strategy growth truth meaning risk work career conversation vision innovation collaboration opportunity potential future'.split(
    ' ',
  ),
);
// Frozen image-idiom phrases (rule family 3).
const IMAGE_IDIOMS = [
  /\blos(?:e|ing)\s+the\s+plot\b/i,
  /\bpick(?:ing)?\s+(?:the\s+|up\s+)?(?:the\s+)?thread\b/i,
  /\bfind(?:ing)?\s+the\s+path\b/i,
  /\bmov(?:e|ing)\s+the\s+needle\b/i,
];

function tokens(text) {
  return text.toLowerCase().match(/[a-z][a-z'-]*/g) || [];
}
function words(text) {
  return (text.match(/\S+/g) || []).length;
}

function stockDensity(text) {
  const t = tokens(text);
  const hits = t.filter((w) => STOCK.has(w)).length;
  return { hits, per100: (hits / Math.max(1, t.length)) * 100 };
}

// Approach B: count novel-figuration hits via the three rule families.
function novelHits(text) {
  const t = tokens(text);
  let hits = 0;
  const reasons = [];
  // (1) copular image metaphor: <abstract> ... is/are the <image-noun>
  //     also catches "is the lens I work through" shape.
  for (let i = 0; i < t.length - 2; i++) {
    if ((t[i] === 'is' || t[i] === 'are') && t[i + 1] === 'the' && IMAGE_NOUNS.has(t[i + 2])) {
      hits++;
      reasons.push(`copular:${t[i + 2]}`);
    }
  }
  // (2) physical verb directly on an abstract object: <verb> the <abstract>
  for (let i = 0; i < t.length - 2; i++) {
    if (PHYSICAL_VERBS.has(t[i]) && t[i + 1] === 'the' && ABSTRACT_NOUNS.has(t[i + 2])) {
      hits++;
      reasons.push(`physabs:${t[i]}>${t[i + 2]}`);
    }
  }
  // (3) frozen image idioms
  for (const re of IMAGE_IDIOMS) {
    if (re.test(text)) {
      hits++;
      reasons.push(`idiom:${re.source.slice(0, 18)}`);
    }
  }
  return { hits, per100: (hits / Math.max(1, words(text))) * 100, reasons };
}

const scored = fixtures.map((f) => ({
  ...f,
  stockScore: stockDensity(f.text),
  novelScore: novelHits(f.text),
}));

// Density by class.
function meanBy(filterFn, pick) {
  const xs = scored.filter(filterFn).map(pick);
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
const classes = {
  'human-figurative': (s) => s.source === 'human' && s.figurative,
  'human-literal': (s) => s.source === 'human' && !s.figurative,
  'human-nonnative': (s) => s.source === 'human-nonnative',
  'ai-figurative': (s) => s.source === 'ai' && s.figurative,
  'ai-literal': (s) => s.source === 'ai' && !s.figurative,
};

// Approach B as a binary figurative classifier (>=1 novel hit → figurative).
function confusion(predict) {
  let tp = 0,
    fp = 0,
    tn = 0,
    fn = 0;
  const fps = [],
    fns = [];
  for (const s of scored) {
    const pred = predict(s);
    if (s.figurative && pred) tp++;
    else if (s.figurative && !pred) {
      fn++;
      fns.push(s.id);
    } else if (!s.figurative && pred) {
      fp++;
      fps.push(s.id);
    } else tn++;
  }
  const safe = (a, b) => (b ? a / b : 1);
  return { tp, fp, tn, fn, precision: safe(tp, tp + fp), recall: safe(tp, tp + fn), fps, fns };
}

// Stock-only (Approach A) and novel-only (Approach B) figurative classifiers.
const aClassifier = confusion((s) => s.stockScore.hits >= 1);
const bClassifier = confusion((s) => s.novelScore.hits >= 1);

// The key research question: does Approach B catch NOVEL figuration the stock
// list misses? Recall on the novel-figurative subset specifically.
const novelSubset = scored.filter((s) => s.figurative && s.novel);
const novelCaughtByA = novelSubset.filter((s) => s.stockScore.hits >= 1).length;
const novelCaughtByB = novelSubset.filter((s) => s.novelScore.hits >= 1).length;

const report = {
  n: scored.length,
  densityByClass: Object.fromEntries(
    Object.entries(classes).map(([k, fn]) => [
      k,
      {
        stockPer100: +meanBy(fn, (s) => s.stockScore.per100).toFixed(2),
        novelPer100: +meanBy(fn, (s) => s.novelScore.per100).toFixed(2),
      },
    ]),
  ),
  approachA_stock: {
    precision: aClassifier.precision,
    recall: aClassifier.recall,
    fp: aClassifier.fps,
    fn: aClassifier.fns,
  },
  approachB_novel: {
    precision: bClassifier.precision,
    recall: bClassifier.recall,
    fp: bClassifier.fps,
    fn: bClassifier.fns,
  },
  novelFigurationCoverage: {
    subsetSize: novelSubset.length,
    caughtByStockLexicon: novelCaughtByA,
    caughtByNovelHeuristic: novelCaughtByB,
  },
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const pct = (x) => `${(x * 100).toFixed(0)}%`;
  console.log(`AIScrub metaphor-density probe — ${report.n} labeled samples\n`);
  console.log('mean figurative density by class (hits per 100 words):');
  console.log('  class                stock    novel');
  for (const [k, v] of Object.entries(report.densityByClass)) {
    console.log(
      `  ${k.padEnd(18)} ${String(v.stockPer100).padStart(6)}  ${String(v.novelPer100).padStart(6)}`,
    );
  }
  console.log('\nfigurative-sentence detection:');
  console.log(
    `  Approach A (stock lexicon)   precision ${pct(aClassifier.precision)}  recall ${pct(aClassifier.recall)}` +
      `  FP[${aClassifier.fps.join(',') || '-'}]`,
  );
  console.log(
    `  Approach B (novel heuristic) precision ${pct(bClassifier.precision)}  recall ${pct(bClassifier.recall)}` +
      `  FP[${bClassifier.fps.join(',') || '-'}]`,
  );
  console.log('\nnovel-figuration coverage (the gap #3 is about):');
  console.log(`  novel-figurative samples: ${novelSubset.length}`);
  console.log(`  caught by stock lexicon (A): ${novelCaughtByA}/${novelSubset.length}`);
  console.log(`  caught by novel heuristic (B): ${novelCaughtByB}/${novelSubset.length}`);
  if (bClassifier.fps.length) {
    console.log('\nApproach B false positives (the FP cost — why this is judgment-heavy):');
    bClassifier.fps.forEach((id) => {
      const s = scored.find((x) => x.id === id);
      console.log(
        `  ${id} [${s.source}]: ${s.novelScore.reasons.join(', ')}  — "${s.text.slice(0, 60)}..."`,
      );
    });
  }
}
