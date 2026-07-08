# AIScrub code standards

Conventions for the runtime code in `detector/`, `eval/`, and `scripts/`. The
priorities are legibility, modularity, and token efficiency. Most of these are
enforced automatically (see the guards at the end) so they can't drift.

## Zero runtime dependencies

The detector is zero-dependency Node (`>=18`) and stays that way. `package.json`
must have no `dependencies` — only `devDependencies` for tooling. End users clone
the skill and run `node` with nothing to install. Verify with:

```
npm ls --omit=dev        # runtime tree must be empty
```

ESLint and Prettier are dev-only. CI installs them with `npm ci` (a
`package-lock.json` is committed); they never ship in the published package.

## File size

Soft cap of **300 lines** per runtime/test JS file, so files stay legible and
one-concern. **DATA files are exempt** — long pattern/lexicon tables would only
be made worse by splitting. A file is treated as data if it lives under a `data/`
directory _or_ carries `// @cap-exempt: DATA` in its first few lines. Enforced by
`scripts/check-line-cap.js`.

## Module boundaries

The engine lives under `detector/engine/` as focused modules:

- `engine/data/*` — data only (vocabularies, regex tables, lookalike maps). No logic.
- `engine/constants.js` — a no-import **leaf**: `ISSUE_WEIGHTS` (+ the `weightFor`
  helper), `SEVERITY_LABELS`, `TYPE_LABELS`, `MAX_WORDS`, `VALID_CONTEXT_MODES`.
- `engine/passes/*` — each a pure pass over the shared context, returning issues.
- `engine/analyze.js` — the orchestrator; `engine/index.js` — the public assembly.

Dependency flow is a DAG: `data/*`, `constants.js`, and `text-utils.js` are
leaves; everything flows up to `analyze.js → index.js → detector/patterns.js`. No
module imports the barrel; no import cycles.

## The public API is frozen

`require('./detector/patterns.js')` returns exactly:

```
{ analyzeText, normalizeText, detectEcho, getLabel, getColor, SEVERITY_LABELS, TYPE_LABELS }
```

Changing this shape breaks the CLI, the eval harness, the tests, and the published
package. `detector/patterns.js` is a thin barrel over `detector/engine/`.

## Contracts that must not drift

- **`TYPE_LABELS` is the source of truth for categories.** Every key must be
  documented in `detector/CATEGORIES.md` — enforced by `detector/categories.test.js`.
- **Catalog size.** Pattern counts in `references/patterns.md` and the README are
  enforced by `scripts/check-counts.js`.
- **Scoring invariants:** dedup runs before scoring/regions/stats; the
  `ISSUE_WEIGHTS[type] ?? 2` default lives only in `weightFor()`; `echo` weight is
  0 (flag-only); the `log2(wordCount/50)` length divisor normalizes the score.
  Pass ordering matters (normalize/blockquote-strip first; `tier2Clusters` before
  the trinary classification).

## Code style

2-space indent, semicolons, single quotes, CommonJS, `node>=18`. **Prettier owns
formatting** (`.prettierrc.json`); **ESLint owns correctness** (`eslint.config.js`,
flat config). Run `npm run format:fix` and `npm run lint` before committing.

## Comments

Inline comments explain the **current** behavior a reader needs: why a threshold
is what it is, why a guard exists, non-obvious mechanics. Historical/audit
narrative (dated fixes, "round-N", regression backstories, external citations)
lives in `docs/engine-history.md`, not inline. When in doubt, keep it inline —
lean, not comment-free.

## Tests and evals are the safety net

Every behavior change must keep the full gate green:

```
npm test                        # detector fixtures + CATEGORIES contract
npm run check-counts            # catalog size in sync
npm run check-line-cap          # file-size standard
npm run eval -- --max-fp=0.15   # detector precision/recall/FP budget
npm run eval:echo               # echo signal exact-vs-stem
npm run lint                    # ESLint
```

Adding a detector type means: a `TYPE_LABELS` entry **and** a `CATEGORIES.md` row
**and** a test. CI (`.github/workflows/checks.yml`) runs `npm ci` then the gate on
every push.
