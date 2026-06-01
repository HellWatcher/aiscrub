# Profiles

Two independent axes. **Voice** sets how the prose should sound. **Context** sets
how strict to be for the audience. You can pair any voice with any context
(blunt for a blog, warm for docs). Where both govern the same rule and disagree,
resolve toward the stricter. Adapted from `conorbronsdon/avoid-ai-writing`.

## Voice profiles

Voice is optional. If the writer names none, infer it from the input's existing
register rather than imposing one. Each is a set of concrete targets, not a vibe.

- **`casual`** — contractions throughout; their absence reads stiff. Short sentences (aim ≤14 words average); fragments allowed. At least one first-person or concrete-anecdote touch. Keep warm hedges ("honestly", "I think"); cut corporate ones. *Blogs, social, community.*
- **`professional`** — active voice for most sentences. Vary sentence length. One concrete claim per paragraph (a number, a name, a date), never "experts say". Make the ask explicit. Low tolerance for hedging. *LinkedIn, investor email, pitches.*
- **`technical`** — prefer plain copulas ("X is Y") over inflated substitutes. One idea per sentence; imperative mood for instructions. Jargon is fine, but define it on first use. Tables and lists only where content is genuinely list-shaped. *Docs, technical blog.*
- **`warm`** — address the reader directly ("you") and acknowledge them once. Cut intensifiers ("very", "truly") in favor of stronger verbs. No performative-empathy openers. Medium sentences (15-20 words). *Mentorship, onboarding, thank-yous.*
- **`blunt`** — lead with the claim; cut "It's important to note that" windups. Periods for emphasis, not em dashes. No padding to hit a rule of three. Near-zero hedging. Short declaratives with the occasional long one for contrast. *Decision memos, thought leadership, hard feedback.*

**Calibrate to a sample** (optional): if given a writing sample, match its
sentence-length pattern, contraction rate, paragraph openings, and recurring word
choices instead of a named profile. Do not upgrade the vocabulary.

## Context profiles

- **`linkedin`** — short-form social; punchy fragments and visual formatting matter.
- **`blog`** — default. Standard long-form prose; all rules at full strength.
- **`technical-blog`** — long-form with code and architecture; technical terms get a pass.
- **`investor-email`** — high-trust audience; tighten everything, promotional language is the biggest risk.
- **`docs`** — documentation and READMEs; clarity over voice.
- **`casual`** — Slack, internal notes; only catch the worst offenders.
- **`code`** — source files, diffs, commit messages, PR descriptions, tests. Turns on the code-and-repository-artifacts patterns (#61-68) and turns off prose-only rules that do not apply to code: sentence-length rhythm, copula avoidance, rule of three, transition phrases, paragraph-length uniformity, and TTR stylometry. Em-dash and inflated-vocabulary rules still apply, but only to prose surfaces (comments, commit bodies, PR text), not to identifiers or string literals. The two logic-touching patterns (#65, #67) are flag-only here: report and propose, never auto-cut.

### Auto-detection cues

When no context is given: a source file, diff, or commit/PR body → `code`; under
300 words plus hashtags or mentions → `linkedin`; code blocks or API/architecture
references in otherwise prose content → `technical-blog`; salutation plus
fundraising language → `investor-email`; step-by-step or parameter docs → `docs`;
no strong signal → `blog` (the safest default). If auto-detection feels wrong,
say which profile you used and why. The difference between `code` and
`technical-blog`: `code` is the source itself, `technical-blog` is prose *about*
code.

### Tolerance matrix

Rules not listed apply at full strength everywhere.

| Rule | linkedin | blog | technical-blog | investor-email | docs | casual |
|---|---|---|---|---|---|---|
| Em dashes | relaxed (2/post) | strict | strict | strict | relaxed | skip |
| Bold overuse | relaxed (hooks OK) | strict | strict | strict | relaxed | skip |
| Emoji in headers | relaxed (1-2 end-of-line) | strict | strict | strict | skip | skip |
| Excessive bullets | skip | strict | relaxed | strict | skip | skip |
| Hedging | strict | strict | relaxed ("may" is accurate) | strict | relaxed | skip |
| Vocabulary tiers | strict | strict | partial (see below) | strict | relaxed | P0 only |
| Promotional language | relaxed | strict | strict | extra strict | strict | skip |
| Significance inflation | strict | strict | strict | extra strict | relaxed | skip |
| Copula avoidance | skip | strict | relaxed | strict | skip | skip |
| Uniform paragraph length | skip | strict | strict | strict | relaxed | skip |
| Numbered-list inflation | relaxed | strict | relaxed | strict | skip | skip |
| Rhetorical questions | relaxed (1 hook) | strict | strict | strict | strict | skip |
| Transition phrases | skip | strict | strict | strict | relaxed | skip |
| Generic conclusions | skip | strict | strict | extra strict | skip | skip |
| Hashtag stuffing | strict | strict | strict | extra strict | skip | skip |

**Technical-blog vocabulary exceptions:** these have legitimate technical meaning
and should not be flagged in technical context: `robust`, `comprehensive`,
`seamless`, `ecosystem`, `leverage` (real platform leverage/APIs), `facilitate`,
`underpin`, `streamline`. Still flag: `delve`, `tapestry`, `beacon`, `embark`,
`testament to`, `game-changer`, `harness`.

**"Extra strict"** means flag even borderline instances. **"Skip"** means do not
audit that category for that profile.
