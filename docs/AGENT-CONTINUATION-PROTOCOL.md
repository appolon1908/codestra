# Codestra Agent Continuation Protocol

**Version:** 1.0  
**Applies to:** Codex, Claude Code, GitHub Copilot coding agent, and any other autonomous engineering agent working in a Codestra repository.

This document is the canonical cross-agent operating contract. Repository-local files such as `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` may add repo-specific constraints, but they must not weaken this contract.

## Portfolio mission and repository goal alignment

Every agent must understand both the **portfolio mission** and the **repository-specific goal** before working.

### Portfolio mission

Codestra is being built as a governed, production-ready platform and product portfolio where components can be continued safely by different agents and machines without losing context, bypassing controls, or drifting from architecture.

The shared engineering goals are:

- production-ready software with evidence, not self-reported completion;
- clear source-of-truth boundaries across GitHub, Linear, Notion, local worktrees, and Mission Control;
- safe handoff between Codex, Claude Code, GitHub Copilot, and other agents;
- one writer per active issue, with independent review and verification;
- durable checkpoints so work resumes from the exact last accepted state;
- explicit APIs, identity, secrets, observability, rollback, backup/restore, and release evidence where applicable;
- no weakening of CI, branch protection, authentication, authorization, or security gates;
- no live-production/business effects without the required human approval.

### Core platform architecture

For the core production program, agents must preserve the current architecture unless an authorized Linear/Notion decision changes it:

- **Caddy** — public edge / TLS entry point;
- **Kong** — governed API gateway and route/auth policy;
- **Middleware V3** — canonical API, integration, command, execution, audit, reconciliation, and provider-adapter authority;
- **Keycloak** — identity, token/JWKS, human/service authentication and authorization authority;
- **OpenBao** — secrets authority and secret-reference boundary;
- **Odoo 19** — governed business/master-record application where defined by the active domain mission;
- **Observability stack** — Prometheus/Alertmanager/Grafana/Loki/Tempo/Alloy/exporters and related repositories provide release evidence, SLO/health visibility, logging/tracing, and alert acceptance.

The current core production-readiness parent is **PAS-247**. Component execution lanes include PAS-234 through PAS-239, with PAS-251 as the final production-ready certificate lane.

### Product/application repositories

Product repositories such as Klyrow, Breero, Moneybee, Telnexa, Beyvra, communications, AI, Device Forge, DJONE, and others keep their own product-specific mission and architecture. They should integrate with the shared platform contracts **where applicable** rather than being forced into a core-platform role they do not own.

### Repository goal resolution rule

The repository's actual current goal must be resolved in this order:

1. active Linear issue / project mission;
2. linked Notion mission, architecture, or decision page;
3. repository-local `.codestra-mission/current-mission.json`, checkpoint, and handoff;
4. repository README / architecture docs;
5. this portfolio mission.

If these disagree, do not silently choose one. Record the conflict and use Linear + Notion + GitHub evidence to reconcile it before implementation.

An agent must be able to state, before editing:

```
PORTFOLIO_MISSION=<one sentence>
REPOSITORY_GOAL=<one sentence>
ACTIVE_LINEAR_ISSUE=<issue or NONE>
SUCCESS_CRITERIA=<evidence-based exit condition>
ROLE=<Builder|Reviewer|Verifier>
WORKER_NODE=<machine>
```

If the agent cannot state these accurately, it is not ready to write code.

## What to give an agent

Give the agent:

1. the repository URL;
2. the active Linear issue URL, when one exists;
3. this protocol URL;
4. the agent role: **Builder**, **Reviewer**, or **Verifier**.

Recommended instruction:

> Continue this project using the Codestra Agent Continuation Protocol. Read the repository's local agent instructions and current mission files first. Use the supplied Linear issue as task authority. Preserve all existing work. Do not invent a new task. Continue until the current task is verified, checkpointed, and ready for the next authorized task.

## Authority order

When sources disagree, use this order:

1. **GitHub exact SHA + protected CI/review** — remote code and merge authority.
2. **Local worktree** — authority for uncommitted/unpushed work on that machine.
3. **Linear** — active task, dependencies, owner, blockers, status, and successor authority.
4. **Notion** — architecture, design decisions, runbooks, mission continuity, and long-lived context.
5. **Mission Control** — dispatch, writer lease, checkpoint, takeover, and acceptance authority.
6. **Agent conversation text** — helpful context only; it does not override the authorities above.

Never treat an agent's own statement of completion as certification.

## Required first read

Before changing code, inspect these files when present:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.codestra-mission/repository.json`
- `.codestra-mission/policy.json`
- `.codestra-mission/current-mission.json`
- `.codestra-mission/lease.json`
- `.codestra-mission/checkpoint.json`
- `.codestra-mission/handoff.json`
- repo README and architecture/runbook documents relevant to the active issue

Then read the active Linear issue and any linked Notion architecture/mission page.

If the mission files are absent or stale, do **not** guess. Reconstruct current truth from GitHub, Linear, Notion, and local Git, then record a fresh checkpoint.

## Before implementation

Record or verify:

- repository and canonical remote;
- current branch;
- exact HEAD SHA;
- dirty/staged/untracked state;
- upstream branch;
- ahead/behind state after a fresh fetch;
- existing worktrees;
- open PR for the mission, if any;
- exact PR head SHA;
- required CI status;
- accepted review status;
- Linear issue, status, owner, blockers, and dependencies;
- relevant Notion architecture/mission page;
- worker node and agent role.

### No-loss rule

Never reset, clean, delete, overwrite, force-push, rebase over, or stash unknown work.

If the primary checkout is dirty or belongs to another mission, preserve it exactly and use a dedicated worktree.

## Worktree rule

New implementation work must use a dedicated Git worktree unless the current mission already owns a clean dedicated worktree.

Preferred pattern:

```
<worktrees-root>/<repo>/<linear-issue>-<short-purpose>
```

Create the worktree from the exact, freshly fetched base authority required by the mission. Do not assume the local `main` branch is current.

## Agent roles

### Builder

The Builder is the **only writer** for its Linear issue and worktree.

Responsibilities:

- understand the acceptance criteria;
- plan the smallest complete change;
- implement only the authorized scope;
- add/update tests;
- run relevant local checks;
- commit coherent checkpoints;
- push the mission branch;
- create/update the PR;
- respond to review findings;
- update Linear and Notion checkpoints.

The Builder may not self-approve its work.

### Reviewer

The Reviewer is independent and normally read-only.

Responsibilities:

- inspect architecture and requirements;
- review the exact diff;
- check API compatibility, migrations, authorization, secrets, security, error handling, observability, and rollback implications;
- verify tests cover the changed behavior;
- compare implementation against Linear acceptance criteria and Notion architecture;
- submit COMMENT, REQUEST_CHANGES, or APPROVE based on evidence.

The Reviewer must not edit the Builder worktree. A required code fix returns to the Builder, or becomes a separately authorized issue/worktree.

### Verifier

The Verifier proves the result independently.

Responsibilities can include:

- unit/integration/contract tests;
- lint/type/static analysis;
- security scans;
- OpenAPI/Postman checks;
- staging probes;
- runtime readback;
- database migration/readback checks;
- backup/restore rehearsal;
- rollback rehearsal;
- monitoring/alert acceptance;
- exact artifact/SHA/digest evidence.

The Verifier does not implement product features in the Builder branch.

## Multi-agent and multi-machine locking

Exactly one Builder may own a Linear issue at a time.

Before writing, verify the issue is not already actively owned by another agent or node. Record:

```
WORKER_NODE=<machine-or-runner>
AGENT_ROLE=builder
LINEAR_ISSUE=<issue>
WORKTREE=<path>
HEAD=<sha>
```

If another Builder owns the issue, do not write. Choose a different dependency-clean issue only if Mission Control/Linear has authorized it; otherwise remain Reviewer/Verifier or stop.

## Mandatory execution loop

```
READ MISSION
→ VERIFY LOCAL + REMOTE
→ CLAIM/VERIFY WRITER LEASE
→ PLAN
→ IMPLEMENT
→ TEST
→ DIFF REVIEW
→ COMMIT
→ PUSH
→ UPDATE PR
→ INDEPENDENT REVIEW
→ FIX FINDINGS
→ VERIFY
→ MERGE WHEN PROTECTED RULES ALLOW
→ STAGING/READBACK WHEN REQUIRED
→ UPDATE LINEAR
→ UPDATE NOTION
→ SYNC VERIFY
→ CHECKPOINT
→ REQUEST NEXT AUTHORIZED TASK
```

Do not skip directly from "code written" to "complete."

## Merge gate

A PR may merge only when all required conditions are true:

- exact PR head is the reviewed head;
- required CI executes and passes;
- required independent review is accepted;
- verifier evidence passes;
- branch protection/rulesets allow merge;
- no unresolved blocking review comments;
- no known local/remote drift invalidates the evidence;
- Linear/Notion are updated enough to preserve continuity.

Never weaken required checks, branch protection, rulesets, authentication, authorization, test coverage, or security policy to obtain green.

## Production boundary

"Production-ready" and "live production activation" are different.

Agents may prepare and certify production-ready artifacts, configuration, rollback plans, and evidence.

Agents must **not** independently enable real customer traffic, money movement, real calling, SMS/email, provider effects, destructive production database operations, or other live business effects unless the current mission explicitly contains the required human production approval.

## Required checkpoint

At every meaningful handoff, record:

- timestamp;
- Linear issue and URL;
- repository;
- worker node;
- agent role;
- worktree;
- branch;
- exact HEAD SHA;
- base SHA;
- PR URL/number and exact PR head;
- files/scope changed;
- tests and exact results;
- CI status;
- review status;
- staging/runtime/readback status;
- blockers;
- unresolved risks;
- local/remote sync state;
- next exact action;
- successor issue, if already authorized.

Suggested machine-readable shape:

```json
{
  "status": "READY_FOR_REVIEW",
  "linear_issue": "PAS-000",
  "worker_node": "example-node",
  "agent_role": "builder",
  "repository": "owner/repo",
  "worktree": "/path/to/worktree",
  "branch": "mission/pas-000-purpose",
  "base_sha": "<sha>",
  "head_sha": "<sha>",
  "pull_request": "https://github.com/owner/repo/pull/000",
  "tests": [
    {"name": "pytest", "result": "PASS", "detail": "123 passed"}
  ],
  "ci": "PENDING",
  "review": "PENDING",
  "runtime": "NOT_RUN",
  "blockers": [],
  "risks": [],
  "local_remote_sync": "PASS",
  "next_action": "Independent reviewer inspects exact PR head."
}
```

## Status meanings

Use evidence-based states:

- **QUEUED** — authorized but not claimed.
- **WORKING** — one Builder owns it.
- **READY_FOR_REVIEW** — implementation is pushed; review/CI still needed.
- **IN_REVIEW** — independent review is active.
- **BLOCKED** — a hard dependency or external boundary prevents progress.
- **READY_FOR_VERIFY** — review accepted; verifier gate remains.
- **VERIFIED** — required verification passed, but merge/release bookkeeping may remain.
- **READY_FOR_NEXT** — current issue fully accepted and all required control surfaces agree.
- **COMPLETE** — only when the issue's definition of done and evidence gates are satisfied.

"Done in Linear" alone is not proof of completion if GitHub/runtime evidence disagrees.

## Strict successor rule

An agent must not invent or self-assign the next task.

A successor may start only when one of these is true:

- Linear/Mission Control already identifies the successor and it is dependency-clean; or
- the user explicitly assigns a new issue.

When the current task is truly complete, end the handoff with:

```
TASK COMPLETE
LINEAR=<issue>
PR=<url>
HEAD=<sha>
TESTS=<summary>
LOCAL_REMOTE_SYNC=PASS
READY_FOR_NEXT=true
REQUEST_NEXT_TASK=true
```

If not complete, use:

```
STATUS=BLOCKED
```

or

```
STATUS=READY_FOR_REVIEW
```

and state the exact missing gate.

## Repo-local override rule

Repository-local instructions may **add**:

- specific test commands;
- architecture constraints;
- deployment rules;
- file ownership boundaries;
- environment details;
- domain-specific security requirements.

They may not remove the no-loss rule, one-writer rule, protected merge gate, source-of-truth order, or production approval boundary.

## Portable launch prompt

Paste this to Claude, Copilot, Codex, or another coding agent:

```
You are continuing an existing Codestra engineering project.

Protocol:
https://github.com/ingtrader21-spec/codestra/blob/main/docs/AGENT-CONTINUATION-PROTOCOL.md

Repository:
<REPOSITORY_URL>

Active Linear issue:
<LINEAR_ISSUE_URL>

Role:
<Builder | Reviewer | Verifier>

Instructions:
1. Read the protocol and all repository-local agent/mission files before acting.
2. Reconstruct current truth from local Git, GitHub, Linear, and Notion.
3. Preserve all existing local work.
4. If you are Builder, use or create a dedicated worktree and verify exclusive issue ownership before writing.
5. Continue the active mission; do not invent a successor.
6. Run the required tests/review/verification gates.
7. Update the PR, Linear, Notion, and mission checkpoint before handoff.
8. Stop at the production approval boundary.
9. Return a structured checkpoint with exact SHAs, tests, blockers, and next action.
```
