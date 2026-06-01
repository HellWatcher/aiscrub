# The scoring gate

After the rewrite, prove the fix worked. The catalog catches patterns; the gate
keeps the rewrite honest so it does not just shuffle phrases and call it done.

## Quick checks

Run this list against the draft before scoring. Each "yes" is a fix.

- Any adverbs? Kill them.
- Any passive voice? Find the actor, make them the subject.
- An inanimate thing doing a human verb ("the decision emerges")? Name the person.
- A sentence starting with a Wh- word? Restructure it.
- Any "here's what/this/that" throat-clearing? Cut to the point.
- Any "not X, it's Y" contrast? State Y directly.
- Three consecutive sentences the same length? Break one.
- A paragraph ending on a punchy one-liner? Vary it.
- An em dash or en dash anywhere? Remove it.
- A vague declarative ("The implications are significant")? Name the specific thing.
- Narrator-from-a-distance ("Nobody designed this")? Put the reader in the scene.
- A meta-joiner ("The rest of this essay...")? Delete it.
- Does it sound like a pull-quote? Rewrite it.

## Score it

Rate the draft 1 to 10 on each dimension.

| Dimension | Question |
|---|---|
| Directness | Does each sentence state its point, or announce it? |
| Rhythm | Do sentence lengths actually vary, or is it metronomic? |
| Trust | Does it respect the reader, or hand-hold? |
| Authenticity | Could a specific human have written this? |
| Density | Can anything be cut without loss? |

## The gate

Total the five scores out of 50.

- **Below 35/50:** revise and score again. Loop until it clears.
- **35/50 or above:** the draft passes. Confirm zero em or en dashes, then deliver.

If a draft cannot clear 35 after a couple of honest passes, hand back the best
version with a short note on what is holding the score down. Do not loop forever,
and do not inflate the score to escape the gate.

## The deterministic detector

The five-dimension gate is a judgment call. Pair it with the regex detector for a
repeatable number that does not drift between runs. From the repo root:

```js
const AIDetector = require("./detector/patterns.js");
const r = AIDetector.analyzeText(text); // optionally { contextMode: "technical" }
console.log(r.score, r.label, r.document_classification, r.issues.length);
```

`score` is 0-100 (0 clean, 100 heavy AI), `label` is Minimal/Some/Strong/Heavy,
`document_classification` is HUMAN_ONLY / MIXED / AI_ONLY, and `issues[]` lists
each hit with its `type` and `severity`. The engine is false-negative biased:
MIXED is wide and AI_ONLY needs several corroborating signals, so a flag is a
prompt to look, not a conviction. Run it on the source for a baseline and again on
the final rewrite to confirm the score actually dropped. See
[../detector/README.md](../detector/README.md) for the full result shape and
`npm test` to validate the engine.

## Severity triage

When triaging a long document, fix by tier. Use P0+P1 for a quick pass; a full
audit covers all three.

**P0, credibility killers (fix immediately):** cutoff disclaimers, chatbot
artifacts, citation-markup leaks and AI-tool URL params, unfilled placeholders,
vague attributions without sources, fabricated specifics, significance inflation
on routine events.

**P1, obvious AI smell (fix before publishing):** Tier 1 vocabulary, template and
slot-fill phrases, "let's" openers, synonym cycling, formulaic openings, bold
overuse, em-dash frequency, parataxis, hashtag stuffing.

**P2, stylistic polish (fix when time allows):** generic conclusions, rule of
three, uniform paragraph length, copula avoidance, transition stacking,
confidence-calibration density.
