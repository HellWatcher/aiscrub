# Research: novel/freeform metaphor density as a stylometry signal

Findings for [issue #3](https://github.com/HellWatcher/aiscrub/issues/3). Question:
AIScrub only catches metaphors on a fixed list, so original or mixed metaphors
that never appear on any list score clean. Is figurative-language **density** a
usable, LLM-free signal, and can **novel** (non-catalogued) metaphor be detected
cheaply enough to live in the deterministic detector?

**TL;DR.** The premise is *half* true and the useful half is the opposite of the
naive reading. AI prose is saturated with **stock** metaphor — which the existing
tiered vocabulary already catches — but on **novel** imagery humans actually score
*higher*, not lower. So raw figurative density does not separate human from AI in
the direction you'd want; the discriminating quantity is the **stock-to-novel
ratio**. Novel metaphor *can* be partially detected without a model, but the rules
are hand-curated syntactic frames whose precision is fragile and corpus-dependent,
and the thing they'd flag (fresh, defensible imagery) is exactly what AIScrub must
not penalize. **Recommendation: flag-only skill-loop guidance (LLM judgment), P2
at most — not a deterministic detector signal and never an auto-rewrite.**

## Method

Small hand-labeled sample in [`../../eval/metaphor-fixtures.json`](../../eval/metaphor-fixtures.json)
(14 sentences), each tagged with `source` (human / human-nonnative / ai),
`figurative` (does it contain a metaphor at all), and `novel` (is the imagery
fresh vs. catalogued stock). The human-figurative samples are the three real
examples from the issue that scored `0–6/100, HUMAN_ONLY`. Two prototypes, run by
[`../../eval/metaphor-probe.js`](../../eval/metaphor-probe.js) (`npm run research:metaphor`):

- **Approach A — stock-lexicon density.** Count catalogued stock-metaphor words
  (`landscape`, `tapestry`, `beacon`, `thread`, `engine`, `bridge`, …) per 100
  words. This is essentially what the tiers already do; it's the baseline the
  novel detector has to beat.
- **Approach B — novel-figuration heuristic** (POS-free, no model). Three rule
  families over small curated lists: (1) copular image metaphor `<abstract> is/are
  the <image-noun>` ("impact is the lens"), (2) physical verb on an abstract
  object `<physical-verb> the <abstract>` ("work the problem", "dig the path"),
  (3) frozen image idioms ("lose the plot", "pick the thread up", "find the path").

> **Corpus caveat.** 14 curated sentences is an existence-proof, not a population
> estimate. The numbers below are directional and meant to settle the design
> question (where does this belong), not to calibrate a shipped threshold. A real
> verdict on effect size needs a few hundred genuine human/AI samples per genre.

## Result 1 — is the density premise true?

Mean figurative density (hits per 100 words), by class:

| class | stock /100w | novel /100w |
|---|---|---|
| human-figurative | 1.75 | **7.95** |
| human-literal | 0 | 0.95 |
| human-nonnative | 0 | 0 |
| ai-figurative | **29.79** | 3.70 |
| ai-literal | 0 | 0 |

Two things fall out:

1. **AI massively out-uses stock metaphor** (29.8 vs 1.75 per 100 words). Real,
   but not *new* information — these are the exact words the Tier 1/2/3 lists and
   `tier3-phrase-cluster` already flag. A "stock metaphor density" feature would
   be a re-skin of existing coverage.
2. **On novel imagery the gap inverts**: human-figurative 7.95 vs AI 3.70. The
   issue's hypothesis ("humans use fewer figurative constructions per unit text")
   does **not** hold for fresh imagery in this sample. Humans reach for *fewer
   stock* images but *more original* ones. So **raw** figurative density is not a
   clean AI signal; the separable quantity is the **stock : novel ratio** (AI ≈
   8:1 stock-heavy here; human-figurative ≈ 0.2:1 novel-heavy).

**Verdict: premise refuted as stated, refined on the way out.** Density alone
won't separate human from AI usefully; the existing lists already own the stock
half, and the novel half points the *wrong way* for an AI detector.

## Result 2 — can novel metaphor be detected cheaply?

Figurative-sentence detection (predict `figurative==true`):

| approach | precision | recall | notes |
|---|---|---|---|
| A (stock lexicon) | 100% | 67% | misses both novel-only human metaphors |
| B (novel heuristic) | 80% | 67% | one literal false positive ("work the problem") |

Coverage on the **novel-figurative** subset specifically — the gap #3 is about:

- caught by stock lexicon (A): **1 / 3**
- caught by novel heuristic (B): **3 / 3**

So Approach B does what the lists can't: it caught all three fresh metaphors
("the lens I work through", "dig in and find the path", "pick the thread back up
without losing the plot") that the stock lexicon misses. That's the encouraging
half.

## Result 3 — false-positive analysis

The discouraging half, and the reason this can't ship as a deterministic gate:

- **Literal uses of image words.** Approach B fired on `hl-work-problem-literal`
  ("On exam day, **work the problem** you already know first") — syntactically
  identical to the metaphor, semantically literal/idiomatic. Precision 80% here;
  at scale, literal "the lens" (a camera), "the path" (a filesystem), "build the
  house", "plant the garden" all sit one curated-list entry away from a false
  positive. Telling literal from figurative use of the *same* frame is exactly
  the meaning-reading a regex can't do.
- **Non-native and plain prose.** Encouragingly, B fired **zero** times on the
  non-native and plain-human samples — the syntactic frames are specific enough
  not to punish plain writing for being plain. That specificity is real but
  brittle: it comes from narrow hand-built lists that would need constant
  expansion (and each expansion trades recall for new FP surface).
- **The voice risk.** The one thing the rules reliably catch — a fresh, abstract-
  subject-plus-physical-verb image — is a **sign of a real writer**, which the
  SKILL explicitly tells us to preserve. A deterministic flag here would nudge
  toward sanding off exactly the human voice AIScrub is meant to protect.

## Recommendation

| question | answer |
|---|---|
| Premise true? | No (refined): AI leads on **stock** metaphor only; humans lead on **novel** imagery. Useful signal is the stock:novel **ratio**, not raw density. |
| Placement | **Flag-only skill-loop guidance**, applied by the model reading for meaning. **Not** a `detector/` type (can't separate literal from figurative deterministically), **not** an auto-rewrite. |
| Severity | **P2** at most. It's polish/voice, never a credibility issue. |
| Stock half | Already covered by the tiers + `tier3-phrase-cluster`; no new work needed. |

Concretely: add a short **judgment** cue to the skill's detection guidance —
"watch for metaphor that is *stock or over-dense or mixed* (e.g. doubled images
in one clause); leave fresh, situation-specific imagery alone, and never auto-
rewrite a metaphor" — rather than a new engine signal. This matches the issue's
own framing and the #3 ↔ #4 split: **echo is deterministic and belongs in the
engine (shipped in #4); novel metaphor needs judgment and belongs in the loop.**

If a future contributor still wants a number, the least-bad deterministic proxy
is a **stock:novel ratio** built from Approach B as a *corroborator only* (never
standalone, never scored on its own) — but the FP and voice costs above mean it
should clear a much larger labeled corpus before going anywhere near the score.

## Reproduce

```
npm run research:metaphor          # human-readable report
node eval/metaphor-probe.js --json # machine-readable
```

Fixtures: [`eval/metaphor-fixtures.json`](../../eval/metaphor-fixtures.json).
Probe: [`eval/metaphor-probe.js`](../../eval/metaphor-probe.js).
