# Codestra Agent Quick Start

Give this page to any Claude, Copilot, Codex, or other coding agent.

## Canonical protocol

https://github.com/ingtrader21-spec/codestra/blob/main/docs/AGENT-CONTINUATION-PROTOCOL.md

## All repository starting links

https://github.com/ingtrader21-spec/codestra/blob/main/docs/REPOSITORY-AGENT-START-INDEX.md

Before writing code, the agent must identify the portfolio mission, repository-specific goal, active Linear issue, success criteria, role, and worker node. If it cannot resolve those from Linear + Notion + repo-local mission files, it must stop and report the conflict rather than guess.

## Copy/paste prompt

```
Continue this Codestra repository using the canonical Codestra Agent Continuation Protocol.

Repository: <REPOSITORY_URL>
Active Linear issue: <LINEAR_ISSUE_URL>
Role: <Builder | Reviewer | Verifier>

Before changing anything:
- read AGENTS.md / CLAUDE.md / .github/copilot-instructions.md if present;
- read .codestra-mission/*;
- inspect branch, exact HEAD, dirty state, worktrees, upstream, PR and CI;
- read the Linear issue and linked Notion architecture;
- preserve all existing local work.

Do not invent a new task.
If Builder, verify exclusive ownership and use a dedicated worktree.
Continue until the current task reaches its next evidence-based gate.
Update GitHub + Linear + Notion + mission checkpoint before handing off.
Do not cross the live-production approval boundary.
Return exact SHAs, test results, blockers, sync state and next action.
```
