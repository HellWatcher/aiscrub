# Category map: references/patterns.md ↔ detector

This table is the anti-drift contract between the human-readable rules in
`../references/patterns.md` and the executable engine in `patterns.js`. When you
add a rule to the catalog, decide here whether it's regex-detectable (give it a
detector `type`) or LLM-only judgment (mark it so). When you add a detector
`type`, point it back at the catalog section it enforces.

The engine exposes 55 issue `type`s (see `TYPE_LABELS` in `patterns.js`). The
catalog has more `###` sections than that — the gap is **not** missing coverage,
it's rules that are judgment calls a regex can't make. The three groups below
account for every entry on both sides.

Three counts coexist on purpose and should not be forced to match: the README's
**pattern-category count** (the human-facing prose catalog, derived from
`../references/patterns.md` and guarded in CI), the engine's **55 `type`s**
(which split the vocabulary tiers and add stylometric signals), and
`../references/patterns.md`'s `###` sections (which also include writer-side
tests with no detectable form). The
`categories.test.js` check enforces only the engine ↔ this-file mapping.

## A. Direct mapping (catalog rule → detector `type`)

| Detector `type`                         | Label                                        | `references/patterns.md` section               |
| --------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| `tier1` / `tier2` / `tier3`             | AI vocabulary / Word cluster / Overused word | Words and phrases to replace                   |
| `transition`                            | AI transition                                | Transition phrases to remove or rewrite        |
| `template-phrase`                       | Template phrase                              | Template phrases (avoid)                       |
| `tier3-phrase` / `tier3-phrase-cluster` | Boilerplate phrase / cluster                 | Template phrases (avoid)                       |
| `chatbot`                               | Chatbot artifact                             | Chatbot artifacts                              |
| `sycophantic`                           | Sycophantic tone                             | Sycophantic tone                               |
| `acknowledgment-loop`                   | Acknowledgment loop                          | Acknowledgment loops                           |
| `filler`                                | Filler phrase                                | Filler phrases                                 |
| `hollow-intensifier`                    | Hollow intensifier                           | Filler phrases (intensifiers)                  |
| `generic-conclusion`                    | Generic conclusion                           | Generic conclusions                            |
| `future-narrative`                      | Generic future narrative                     | Generic future-narrative closers               |
| `lets-construction`                     | "Let's" opener                               | "Let's" constructions                          |
| `reasoning-artifact`                    | Reasoning artifact                           | Reasoning chain artifacts                      |
| `significance-inflation`                | Significance inflation                       | Significance inflation                         |
| `novelty-inflation`                     | Novelty inflation                            | Novelty inflation                              |
| `real-actual-inflation`                 | "Real/actual" inflation                      | "Real/actual" adjective inflation              |
| `vague-attribution`                     | Vague attribution                            | Vague attributions                             |
| `emotional-flatline`                    | Emotional flatline                           | Emotional flatline / Superficial -ing analyses |
| `cutoff-disclaimer`                     | Cutoff disclaimer                            | Cutoff disclaimers                             |
| `false-concession`                      | False concession                             | False concession structure                     |
| `rhetorical-question`                   | Rhetorical question                          | Rhetorical question openers                    |
| `formulaic-opener`                      | Formulaic opener                             | Formulaic challenges                           |
| `confidence-calibration`                | Confidence stacking                          | Confidence calibration phrases                 |
| `hedge-stack`                           | Hedge-stacked prediction                     | Hedge-stacked predictions                      |
| `parenthetical-hedge`                   | Parenthetical hedge                          | Parenthetical hedging                          |
| `hashtag-stuff`                         | Hashtag stuffing                             | Hashtag stuffing                               |
| `bullet-np-list`                        | Bullet-NP list                               | Bullet lists of bare noun phrases              |
| `title-case-header`                     | Title Case header                            | Title case headings                            |
| `em-dash` / `formatting`                | Em dash / Formatting                         | Formatting                                     |
| `uniformity`                            | Rhythm uniformity                            | Rhythm and uniformity                          |
| `low-ttr`                               | Low vocabulary diversity                     | Vocabulary diversity (stylometric)             |
| `ai-placeholder`                        | Unfilled placeholder                         | Unfilled placeholders                          |
| `ai-citation-markup`                    | Chatbot citation markup leak                 | Chatbot citation markup leaks                  |
| `ai-utm-source`                         | AI-tool URL parameter                        | AI-tool URL parameters                         |
| `lingering-attention`                   | Lingering-attention claim                    | Lingering-attention claims                     |
| `social-cta-closer`                     | Engagement-bait closer                       | Social endorsement closers                     |
| `speculative-opener`                    | Speculative scenario opener                  | Speculative scenario openers                   |
| `launch-intro`                          | Launch-copy introduction                     | Launch-copy introductions                      |
| `crowd-contrast`                        | Dramatized crowd contrast                    | Dramatized contrast against the crowd          |
| `fake-casual-prop`                      | Fake-casual prop                             | Fake-casual props                              |
| `performed-insight`                     | Performed-insight phrase                     | Performed-insight phrases                      |
| `dev-blog-boilerplate`                  | Dev-blog boilerplate                         | Dev-blog boilerplate                           |
| `tier1-clarity`                         | Wordiness                                    | Inflated vocabulary (tiered) — _partial_       |
| `negation-chain`                        | Negation chain                               | Negative listing — _partial_                   |
| `unnecessary-hyphenation`               | Unnecessary hyphenation                      | Hyphenated word-pair overuse — _partial_       |
| `smart-punct-signature`                 | Smart-punct signature                        | Formatting (curly quotation marks) — _partial_ |

> **Partial map:** `smart-punct-signature` fires only when curly quotes co-occur
> with an em-dash, an Oxford comma, and clean typing (≥80 words) — never on curly
> punctuation alone. The references/patterns.md Formatting rule treats curly quotes as a weak,
> corroborating signal in plain-text contexts and excludes apostrophes. The two
> agree in spirit (curly punctuation is never conclusive on its own) but differ in
> mechanism — so this is a partial map, not 1:1.

> **Partial map:** `tier1-clarity` is the Tier 1B half of "Inflated vocabulary
> (tiered)" — wordiness fixes (`in order to`, `serves as`, `utilize`, ...) that
> read like Tier 1 in cadence but are concision edits, not AI-frequency
> evidence. Weighted like `tier2` and excluded from the dense-vocabulary
> signal so a clarity fix alone can never push a document toward an AI
> classification.

> **Partial map:** `negation-chain` covers only the "Negative listing"
> subclass that is regex-safe: a sentence-initial chain of three or more
> `No X, no Y, no Z` items (plus a couple of narrower "did not ..., did not
> ..." / "don't X it ... X it" shapes). Looser negative-listing rhetoric
> elsewhere in a paragraph stays an LLM judgment call.

> **Partial map:** `unnecessary-hyphenation` covers only a curated set of
> "Hyphenated word-pair overuse" subclasses — closed compounds
> (`code-base`, `data-set`, `time-frame`, `road-map`) and attributive-only
> forms (`in real-time`, `for/over the long-term`, `out-of-the-box`) whose
> surrounding syntax makes the unhyphenated form unambiguous. General
> "is this compound modifier established English" judgment stays out of
> scope for the engine. Score-neutral (weight 0): a concision fix, not
> AI-origin evidence.

## B. Detector-only (stylometric / fingerprint — no skill prose)

These extend the skill with signals that work as math over the whole document,
not as a phrase a human editor would look up:

| Detector `type`          | Label                    | Why it's engine-only                                                 |
| ------------------------ | ------------------------ | -------------------------------------------------------------------- |
| `punct-distribution`     | Punctuation distribution | Per-paragraph punctuation uniformity                                 |
| `fnword-trigram-entropy` | Grammar repetition       | Function-word trigram entropy                                        |
| `cross-para-burstiness`  | Cross-paragraph rhythm   | Sentence-length variance across paragraphs                           |
| `normalization-flag`     | Bypass-trick chars       | Zero-width / homoglyph humanizer-bypass detection                    |
| `echo`                   | Word echo                | Close content-word/root repetition (lemma match in a sliding window) |

> **Flag-only, score-neutral:** `echo` is a writing-quality smell, not an
> AI-origin tell — humans echo as readily as models do. It carries weight `0`
> (`ISSUE_WEIGHTS.echo`) so it never moves the score or the FP budget; it
> surfaces in `issues[]` with both source offsets in `locations` and is never
> auto-rewritten. Exact-token by default; an optional stem pass
> (`options.echoStem`) catches shared roots at a measured false-positive cost.
> See `../eval/echo.js`.

## C. Skill-only (LLM judgment — no detector `type`)

Rules that require reading for meaning, so they live in the skill prose and are
applied by the model, not the regex engine. Listed so future contributors don't
mistake their absence for a coverage gap:

- Synonym cycling
- Copula avoidance
- Promotional language
- Structural issues / Excessive structure / Inline-header lists / Numbered list inflation
- False ranges
- Notability name-dropping
- Self-labeling significance
- When to rewrite from scratch vs. patch
- Severity tiers (P0 / P1 / P2)
- Self-reference escape hatch
- Output format

> **Partial:** the skill's **Context profiles / Tolerance matrix / Auto-detection
> cues** are partly realized by the engine's `options.contextMode`
> (`general` / `technical`), which suppresses context-inappropriate flags. Full
> profile-based tolerance remains an LLM-side judgment.
