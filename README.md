# AIScrub

A Claude Code skill that removes the tells of AI-generated writing and leaves your voice intact.

AIScrub combines two approaches that usually live in separate tools:

1. **A detection catalog** that names specific AI patterns and rewrites each one.
2. **A scoring gate** that rates the result and sends weak prose back for another pass.

Catch the patterns, then prove the fix worked. One pass, two checks.

## Why this exists

LLMs guess the next likely word, so they drift toward the same phrases, the same
three-item lists, the same hedged openings. Readers notice. AIScrub finds those
habits and writes around them without flattening your style into generic "clean copy."

It borrows the best ideas from a few well-known skills (pattern catalogs in the
spirit of `blader/humanizer`, scoring rubrics in the spirit of `hardikpandya/stop-slop`)
and merges them into a single workflow.

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
git clone https://github.com/<your-username>/aiscrub.git ~/.claude/skills/aiscrub
