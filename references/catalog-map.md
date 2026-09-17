# Catalog ↔ detector map

Which of the 88 catalog patterns the deterministic engine (`detector/patterns.js`)
can score, and which are judgment-only. This is the AIScrub-level view; the
engine's own internal contract (detector `type` ↔ engine label) lives in
[../detector/CATEGORIES.md](../detector/CATEGORIES.md).

Three reasons a pattern is judgment-only: it needs reading for meaning (synonym
cycling, copula avoidance), it is a writer-side test rather than a string match
(treadmill, paragraph reshuffle), or it lives in code rather than prose
(patterns 60 and 81-88). Absence from the detector is not a coverage gap; it is
a rule a regex should not try to make.

## Detector-backed (direct)

The engine scores these with a dedicated `type`:

| Catalog pattern | Detector `type` |
|---|---|
| 3 Inflated vocabulary (tiered) | `tier1` / `tier2` / `tier3` |
| 6 Filler phrases | `filler` |
| 23 Vague attributions | `vague-attribution` |
| 26 Superficial -ing analyses | `emotional-flatline` |
| 29 Significance inflation | `significance-inflation` |
| 31 Chatbot artifacts | `chatbot` / `acknowledgment-loop` |
| 32 Sycophantic tone | `sycophantic` |
| 33 Cutoff disclaimers | `cutoff-disclaimer` |
| 34 Generic positive conclusions | `generic-conclusion` / `future-narrative` |
| 35 Em and en dashes | `em-dash` / `formatting` |
| 36 Boldface overuse | `formatting` |
| 38 Title case headings | `title-case-header` |
| 43 Citation-markup leaks | `ai-citation-markup` |
| 44 AI-tool URL parameters | `ai-utm-source` |
| 45 Unfilled placeholders | `ai-placeholder` |
| 47 Hashtag stuffing | `hashtag-stuff` |
| 48 Novelty inflation | `novelty-inflation` |
| 49 Emotional flatline | `emotional-flatline` |
| 51 Reasoning-chain artifacts | `reasoning-artifact` |
| 53 Rhetorical-question openers | `rhetorical-question` |
| 54 False concession | `false-concession` |
| 55 Confidence calibration | `confidence-calibration` |
| 59 Vocabulary uniformity (TTR) | `low-ttr` |
| 61 Social endorsement closers | `social-cta-closer` |
| 62 Lingering-attention claims | `lingering-attention` |
| 63 Speculative scenario openers | `speculative-opener` |
| 64 Launch-copy introductions | `launch-intro` |
| 65 Dramatized contrast against the crowd | `crowd-contrast` |
| 66 Fake-casual props | `fake-casual-prop` |
| 67 Performed-insight phrases | `performed-insight` |
| 68 Dev-blog boilerplate | `dev-blog-boilerplate` |
| 80 Colon reveals | `colon-reveal` |

## Detector-backed (partial)

The engine fires on part of the rule or only in a narrow configuration; the
catalog rule is broader.

| Catalog pattern | Detector `type` | Why partial |
|---|---|---|
| 1 Throat-clearing openers | `formulaic-opener` / `confidence-calibration` | catches some openers, not all |
| 3 Inflated vocabulary, Tier 1B | `tier1-clarity` | the wordiness list only; weighted like Tier 2, excluded from density |
| 7 Excessive hedging | `hedge-stack` / `parenthetical-hedge` | only stacked or parenthetical forms |
| 8 Persuasive-authority tropes | `confidence-calibration` | overlapping phrase set |
| 9 Meta-commentary / signposting | `lets-construction` / `transition` | "let's" and transitions only |
| 12 Negative listing | `negation-chain` | sentence-initial chains of three or more short "no" items only |
| 40 Curly quotation marks | `smart-punct-signature` | only when clustered with other punct tells |
| 41 Hyphenated word-pair overuse | `unnecessary-hyphenation` | curated open, closed, and adverbial-phrase subclasses; score-neutral |
| 46 Parataxis | `uniformity` / `cross-para-burstiness` | rhythm signal, not the construction itself |

Sections 64 to 68 are narrow by design as well: each matches a closed list of
surface forms, and the catalog entry names the neighbours that miss. Treat a hit
as a prompt to read the paragraph, not as the whole rule.

## Detector-only (no catalog prose)

Whole-document math with no single-phrase form, applied by the engine on top of
the catalog: `punct-distribution`, `fnword-trigram-entropy`,
`cross-para-burstiness`, `normalization-flag` (zero-width / homoglyph
bypass-trick detection), plus the `template-phrase` and `tier3-phrase` families.

## Judgment-only (no detector `type`)

Applied by the model, not the regex engine:

2 emphasis crutches, 4 business jargon, 5 adverbs, 10 rule of three, 11 binary
contrasts, 12 negative listing below the three-item threshold, 13 dramatic
fragmentation, 14 rhetorical setups, 15 challenges/future sections, 16 false
ranges, 17 elegant variation, 18 fragmented headers, 19 passive voice, 20 false
agency, 21 narrator-from-a-distance, 22 Wh- starters, 24 vague declaratives, 25
lazy extremes, 27 copula avoidance, 28 promotional language, 30 notability
name-dropping, 37 inline-header lists, 39 emojis, 41 hyphenation outside the
curated list, 42 diff-anchored writing, 50 self-labeling significance, 52
infomercial hooks, 56 excessive structure, 57 numbered-list inflation, 58 low
information density, 69 narrated candor (tried as a detector upstream and
reverted: the phrasings collide with real disclosures), 70 recap-flattery
opener, 71 wall-of-text replies (tried and reverted: fires on any short
paragraph), 72 aphorism formulas, 73 arguing with no one, 74 vague connection,
75 moral-adjective category errors, 76 invented contrast-pair mirroring, 77
historical analogy stacking, 78 transformation crutch, 79 same-opener sentence
runs, and **60 and 81-88** (rejected-alternative commentary and the whole
code-and-repository-artifacts section).
