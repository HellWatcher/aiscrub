# ADR 0002: Em dashes stay always flagged (divergence from upstream)

| Field      | Value                                        |
| ---------- | -------------------------------------------- |
| Status     | Accepted                                     |
| Date       | 2026-09-11                                   |
| Supersedes | N/A                                          |
| Related    | aiscrub issue #2, commit 49e0db6             |

## Context

Upstream avoid-ai-writing relaxed em dashes: list-separator-exempt in v3.18, score-neutral in v3.34. The v3.10 to v3.34 detector and catalog port brought those relaxations into view.

## Options

1. Follow upstream's relaxations.
2. **Keep em dashes flagged always** (P1, a hard constraint at the gate).

## Decision

Option 2: the user chose the strict rule (issue #2). When porting upstream detector or catalog changes, skip the em-dash relaxations.

## Consequences

- README documents the exception ("What it will not flag").
- New prose written in this repo should avoid em dashes (commas, colons, `->`).
