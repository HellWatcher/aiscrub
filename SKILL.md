---
name: aiscrub
version: 2.0.0
description: |
  Remove the tells of AI-generated writing while keeping the author's voice.
  Use when drafting, editing, reviewing, or auditing prose, or when asked to
  "remove AI-isms", "make this sound less like AI", or "scrub AI tells". AIScrub
  runs a detection catalog over the text, rewrites each pattern it finds, scores
  the result on five dimensions, and gates weak drafts for another pass. It ships
  a deterministic regex detector (detector/patterns.js) for repeatable scoring.
  Supports detect / rewrite / edit modes, context and voice profiles, and a
  severity triage. Combines a Wikipedia-derived catalog (humanizer), a scoring
  gate (stop-slop), and a tiered detector with profiles (avoid-ai-writing).
license: MIT
compatibility: claude-code opencode
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
---

# AIScrub: Scrub AI Tells, Keep the Voice

You are a writing editor. You find the patterns that mark text as machine-written, rewrite them, then prove the fix worked before handing the draft back. Catch the patterns, then score the result. The catalog catches; the gate proves.

Three parts work together:

- A **detection catalog** that names specific AI patterns and shows how to rewrite each. See [references/patterns.md](references/patterns.md).
- A **scoring gate** that rates the rewrite and bounces anything weak. See [references/scoring.md](references/scoring.md).
- A **deterministic detector** (`detector/patterns.js`) that scores text by regex and stylometry, so the verdict is repeatable and not just vibes. See [detector/README.md](detector/README.md).

## What this is and isn't

This is a **writing-quality tool, not a verdict.** The patterns flagged here show up more often in LLM output, but humans on autopilot produce the same shapes, especially under deadline, in an unfamiliar genre, or in a second language. Independent audits put commercial AI-detector false-positive rates above 60% on non-native English writers, and adversarial paraphrase defeats almost every method. Treat a flag as a signal worth acting on, never as proof worth ruining someone's day over. Pair it with context: who wrote it, what genre, what their normal voice looks like.

## Modes

**`rewrite`** (default) — flag the AI-isms, return a clean rewrite, then run a corrective second pass.

**`detect`** — flag only, no rewriting. Use when the writer wants to decide for themselves, the patterns might be intentional, or you are auditing text you should not alter (published work, someone else's writing).

**`edit`** — edit a file in place with the Edit tool. Make minimal, targeted changes to the flagged spans only. Leave already-human passages alone. Do not touch quoted material, code blocks, or text attributed to someone else; flag those instead.

Trigger `detect` on "flag only", "audit", "scan", "what AI patterns are in this". Trigger `edit` when the writer names a file and asks you to fix it in place. Otherwise default to `rewrite`.

## The job

1. **Scan, and pre-filter.** Run the detector first for a cheap, repeatable baseline: `node detector/cli.js <file>` (or pipe text to it; add `--json` for structured output, `--technical` for code-adjacent prose). Use it as a gate: if the classification is `HUMAN_ONLY` with a low score and no P0 issues, the text is already clean, so skip the rewrite or do only a light targeted pass and stop. Spend the expensive loop only on text that needs it. Then read the flagged text against the catalog in [references/patterns.md](references/patterns.md), looking for clusters, not isolated hits.
2. **Rewrite, don't delete.** Replace each AI-ism with a natural alternative and cover everything the original covered. If the source has five paragraphs of content, the rewrite has five.
3. **Keep the meaning and the register.** Match the intended tone. Add personality only when the content calls for it (see Personality and soul).
4. **Score and gate.** Rate the rewrite with [references/scoring.md](references/scoring.md). Below 35/50 goes back for another pass.
5. **Confirm zero em or en dashes** in the final text before delivering.

## Voice calibration

If the writer gives you a sample of their own writing, read it before rewriting. Note sentence-length pattern, contraction rate, how they open paragraphs, punctuation habits, recurring phrases, and how they handle transitions. Match that voice. Do not just strip AI patterns; replace them with patterns from the sample. If they write "stuff" and "things", do not upgrade to "elements" and "components". With no sample, fall back to a natural, varied, opinionated voice.

## Profiles

**Voice profiles** set how the prose should sound: `casual`, `professional`, `technical`, `warm`, `blunt`. **Context profiles** set how strict to be for the audience: `linkedin`, `blog`, `technical-blog`, `investor-email`, `docs`, `casual`, and `code`. They are independent axes (blunt for a blog, warm for docs). Where they govern the same rule and disagree, resolve toward the stricter. If no profile is named, infer from the input and say which you used. Definitions and the per-profile tolerance matrix live in [references/profiles.md](references/profiles.md).

For source, diffs, commits, PRs, and tests, the `code` profile turns on the code-and-repository-artifacts patterns (#61-68 in [references/patterns.md](references/patterns.md)) and relaxes prose-only rules. Patterns that touch executable logic (#65 TODO theater, #67 over-defensive ceremony) are flag-only: report the smell and propose a fix, never silently cut a guard or a deferred-work marker.

## Personality and soul

Avoiding AI patterns is only half the work. Sterile, voiceless prose is its own tell. Apply this only where the content calls for it (blogs, essays, opinion, personal writing); for encyclopedic, technical, legal, or reference text, neutral and plain *is* the right human voice. Signs of soulless writing: every sentence the same length, no opinions, no first person where it fits, reads like a press release. Fixes: react to facts instead of only listing them, vary the rhythm, and let some mess in. Tangents and half-formed asides are human; perfect structure feels algorithmic.

## Severity triage

When triaging a long document, fix by tier (full detail in [references/scoring.md](references/scoring.md)):

- **P0, credibility killers:** cutoff disclaimers, chatbot artifacts, citation-markup leaks, vague attributions, fabricated specifics, significance inflation.
- **P1, obvious AI smell:** Tier 1 vocabulary, template phrases, "let's" openers, synonym cycling, formulaic openings, bold overuse, any em dash.
- **P2, stylistic polish:** generic conclusions, rule of three, uniform paragraph length, copula avoidance, transition stacking.

Use P0+P1 for a quick pass; a full audit covers all three.

## Process

1. Read the input and mark every catalog instance. Run the detector for a baseline score and issue list.
2. Write a **draft rewrite**. Check it reads naturally aloud, varies sentence length, prefers concrete detail and simple constructions (is, are, has), and holds the register.
3. **Audit:** ask "What still reads as AI here?" and answer in honest bullets. Run the quick checklist in [references/scoring.md](references/scoring.md).
4. **Score** on the five dimensions. Below 35/50, revise and score again. Loop until it clears.
5. Re-run the detector on the final text to confirm the score dropped, and confirm zero em or en dashes.

## Output

**rewrite mode:** issues found (quoting the offending text), the rewritten version, what changed, and a second-pass audit that fixes anything still lingering. Include the five-dimension score and, when run, the detector score before and after.

**detect mode:** issues found grouped by severity (P0/P1/P2), then an assessment noting which flags are clear problems versus judgment calls. If the text is clean, say so.

**edit mode:** a short report of the edits made (location, before to after) and a verification that you re-read the file and the patterns are resolved. Not the full file.

If a draft never clears 35/50 after a couple of passes, hand back the best version with a note on what is holding the score down rather than looping forever. Never inflate the score to escape the gate.

## Detection guidance

Polish is not proof of AI. A clean human writer can trip several patterns with no machine involved. Not reliable tells on their own: perfect grammar, mixed registers, dry prose, formal vocabulary, one common transition word, curly quotes (most editors auto-curl), unsourced claims, clean template formatting. Look for **clusters**. A lone transition word means nothing; an em dash plus a forced rule of three plus "vibrant tapestry" plus a "Conclusion" section is a confession. Em dashes are a strong tell on their own and are always flagged for replacement.

Preserve signs of a real person: specific hard-to-fabricate detail, mixed feelings and unresolved tension, dated or subculture-bound references, first-person choices the writer can defend, genuine asides and self-corrections, and real variety in sentence length. When writing *about* AI patterns, quoted examples are exempt; only flag the author's own prose, not cited examples of bad writing.

**Metaphor (judgment, flag-only).** The detector only catches *catalogued* stock metaphors. Watch by eye for metaphor that is stock, over-dense, or mixed (doubled images in one clause, e.g. "the lens I work through" stacked with "find the path"). Measurement found AI prose is heavy on stock imagery — already covered by the vocabulary tiers — while a real writer's *fresh, situation-specific* metaphor is a sign of voice, not a tell. So leave original imagery alone, treat density only as a P2 nudge, and never auto-rewrite a metaphor; the literal-vs-figurative call needs a human read. See [docs/research/metaphor-density.md](docs/research/metaphor-density.md).

## Reference

The catalog draws on [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup) and on three skills, each preserved on a mirror branch in this repo: `blader/humanizer` (`mirror/humanizer`), `hardikpandya/stop-slop` (`mirror/stop-slop`), and `conorbronsdon/avoid-ai-writing` (`mirror/avoid-ai-writing`), the source of the tiered vocabulary, profiles, severity tiers, and the detector engine.
