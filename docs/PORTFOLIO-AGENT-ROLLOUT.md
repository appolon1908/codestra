# Portfolio Agent Entrypoint Rollout

This repository contains the canonical Codestra Agent Continuation Protocol and a safe portfolio rollout tool.

Canonical protocol:
https://github.com/ingtrader21-spec/codestra/blob/main/docs/AGENT-CONTINUATION-PROTOCOL.md

Quick-start link to give an agent:
https://github.com/ingtrader21-spec/codestra/blob/main/docs/AGENT-QUICKSTART.md

## What gets installed in each non-empty repository

- `AGENTS.md` — Codex/generic agent entrypoint.
- `CLAUDE.md` — Claude Code entrypoint.
- `.github/copilot-instructions.md` — GitHub Copilot coding-agent entrypoint.

If a file already contains custom instructions, the rollout tool **preserves the existing content** and appends a marked Codestra continuation block. It never replaces repo-specific instructions.

## Rollout safety

The script:

- never writes directly to the default branch;
- creates/uses `chore/codestra-agent-protocol-v1`;
- opens one documentation-only PR per repository;
- skips archived and empty repositories;
- is idempotent;
- can request auto-merge only when `--merge-if-clean` is supplied; GitHub protections/checks still decide whether merge is allowed.

## Commands

Dry run:

```bash
python3 scripts/rollout-agent-protocol.py --dry-run
```

One repository:

```bash
python3 scripts/rollout-agent-protocol.py --repo ingtrader21-spec/Middleware-
```

All repositories, PRs only:

```bash
python3 scripts/rollout-agent-protocol.py
```

All repositories, ask GitHub to auto-merge only when protected conditions permit:

```bash
python3 scripts/rollout-agent-protocol.py --merge-if-clean
```

The generated JSON report lists every repo and its result.
