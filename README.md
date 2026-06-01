# AIScrub

A Claude Code skill that removes the tells of AI-generated writing and leaves your voice intact.

AIScrub combines three approaches that usually live in separate tools:

1. **A detection catalog** that names specific AI patterns and rewrites each one.
2. **A scoring gate** that rates the result and sends weak prose back for another pass.
3. **A deterministic detector** (`detector/patterns.js`) that scores text by regex and stylometry, so the verdict is repeatable instead of vibes.

Catch the patterns, prove the fix worked, then check the number. It also runs in
three modes (`rewrite`, `detect`, `edit`) and adapts strictness to the audience
through context and voice profiles.

## Why this exists

LLMs guess the next likely word, so they drift toward the same phrases, the same
three-item lists, the same hedged openings. Readers notice. AIScrub finds those
habits and writes around them without flattening your style into generic "clean copy."

It borrows the best ideas from a few well-known skills (pattern catalogs in the
spirit of `blader/humanizer`, scoring rubrics in the spirit of `hardikpandya/stop-slop`,
and tiered vocabulary, profiles, and a regex detector in the spirit of
`conorbronsdon/avoid-ai-writing`) and merges them into a single workflow.

It is a writing-quality tool, not a verdict: the patterns are signals, and AI
detectors have high false-positive rates on non-native and deadline-pressed
writing. Act on the signal; do not use it to ruin someone's day.

## What it catches

**Phrasing**
- Throat-clearing openers ("In today's world", "It's worth noting that")
- Inflated vocabulary (vibrant, testament, pivotal, crucial, delve)
- Business jargon and empty intensifiers
- Most adverbs

**Structure**
- The rule of three forced onto every list
- Binary contrasts ("It's not X, it's Y")
- Negative parallelisms and rhetorical setups
- Dramatic one-line fragments used for fake emphasis

**Voice and stance**
- Passive voice and abstractions acting as subjects
- Distant-narrator framing instead of direct address
- Sycophanty, over-hedging, and knowledge-cutoff disclaimers
- Chatbot artifacts left in the draft

**Style**
- Em and en dash overuse (output ships with zero)
- Excessive bold, title-case headings, decorative emoji
- Curly quotes and inline-header lists

**Fingerprints (near-proof of paste-from-chat)**
- Citation-markup leaks (`citeturn0search0`, `oai_citation`)
- AI-tool URL params (`utm_source=chatgpt.com`)
- Unfilled placeholders (`[Your Name]`, `2025-XX-XX`)

Inflated vocabulary is flagged in three tiers (always / in clusters / by density)
to keep ordinary words from getting gutted. The full catalog runs to 59 patterns.

## The scoring gate

After the rewrite, AIScrub scores the draft from 1 to 10 on five dimensions:

| Dimension | Question |
|---|---|
| Directness | Does each sentence state its point plainly? |
| Rhythm | Do sentence lengths actually vary? |
| Trust | Does it respect the reader instead of hand-holding? |
| Authenticity | Could a specific human have written this? |
| Density | Can anything be cut without loss? |

A draft below **35/50** goes back for another revision. The score keeps the tool
honest, so it does not just shuffle phrases and call it done.

## Keep the human in the writing

AIScrub does not sand prose down to nothing. It preserves specific detail, genuine
opinion, mixed registers, and asides. Sterile, voiceless text is its own kind of tell.
You can also hand it a writing sample and it will match your sentence rhythm,
word choice, and punctuation habits before it rewrites.

## What it will not flag

Polish is not proof of AI. A single em dash, a formal word, or one tidy sentence
means nothing on its own. AIScrub looks for **clusters** of tells, not isolated ones.

## Install

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/HellWatcher/aiscrub.git ~/.claude/skills/aiscrub
```

OpenCode also scans `~/.claude/skills/`, so a single clone covers both tools.

## Usage

```
/aiscrub

[paste your text here]
```

Or ask directly: "Scrub the AI tells from this: [text]". To match your own
voice, hand it a sample first:

```
/aiscrub

Here's a sample of my writing for voice matching:
[2-3 paragraphs of your own writing]

Now scrub this:
[the text]
```

You get back the final rewrite, a short "still reads as AI" audit, and the
score across the five dimensions.

## How it fits together

```
aiscrub/
├── SKILL.md              # orchestrator: modes, the calibrate -> rewrite -> audit -> score loop
├── references/
│   ├── patterns.md       # the detection catalog (59 patterns, tiered vocab)
│   ├── scoring.md        # the scoring gate, the detector, and severity triage
│   ├── profiles.md       # context + voice profiles and the tolerance matrix
│   └── examples.md       # before/after, including one full worked example
├── detector/
│   ├── patterns.js       # the deterministic regex + stylometry engine
│   ├── patterns.test.js  # fixtures (run with `npm test`)
│   ├── categories.test.js
│   ├── CATEGORIES.md     # rule <-> detector-category mapping
│   └── README.md
├── package.json          # `npm test` runs the detector suites
├── .github/workflows/    # sync-mirrors + detector CI
├── README.md
└── LICENSE
```

Run the detector with `npm test` (zero dependencies, Node >=18); CI runs it on
every change under `detector/`.

## Lineage

AIScrub merges three existing skills and keeps faithful mirrors of each in this
repository:

- `blader/humanizer` — the Wikipedia-derived pattern catalog and voice work.
  Mirrored on the **`mirror/humanizer`** branch.
- `hardikpandya/stop-slop` — the scoring gate and the modular reference
  structure. Mirrored on the **`mirror/stop-slop`** branch.
- `conorbronsdon/avoid-ai-writing` — the tiered vocabulary, context/voice
  profiles, severity triage, and the vendored detector engine (`detector/`).
  Mirrored on the **`mirror/avoid-ai-writing`** branch.

The pattern catalog ultimately draws on
[Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing),
maintained by WikiProject AI Cleanup.

The mirrors stay current through
[`.github/workflows/sync-mirrors.yml`](.github/workflows/sync-mirrors.yml),
which fetches each upstream daily and force-updates its mirror branch. Trigger
it by hand any time from the Actions tab.

## License

MIT. All three upstream skills are MIT licensed; the vendored detector retains
its upstream copyright (see `detector/README.md`).
