# ADR 0001: sync-mirrors writes filtered snapshot commits

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Status     | Accepted                                                   |
| Date       | 2026-09-11                                                 |
| Supersedes | N/A                                                        |
| Related    | `.github/workflows/sync-mirrors.yml`, README "mirror" section |

## Context

The default `GITHUB_TOKEN` in Actions cannot create or update files under `.github/workflows/` in any pushed ref, whatever `permissions:` grants (it refuses "without `workflows` permission"). Only PATs and GitHub Apps holding that scope can. humanizer and avoid-ai-writing ship workflow files, so the daily sync-mirrors job failed from 2026-06-12 to 2026-09-11 (stop-slop only "passed" through the no-change early exit).

## Options

1. A PAT secret with the `workflows` scope.
2. Push to non-branch refs.
3. **Write snapshot commits** of each upstream tree minus `.github/workflows`, with the upstream SHA in an `Upstream-Commit:` trailer.

## Decision

Option 3. Each `mirror/*` branch is a linear history of upstream states, not the upstream commits. Rejected: a PAT (needs user action and expires) and non-branch refs (unverified).

## Consequences

- Do not "fix" the workflow back to a raw push.
- Mirror history will not match upstream SHAs; the trailer is the link.
