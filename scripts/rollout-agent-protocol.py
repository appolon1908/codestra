#!/usr/bin/env python3
"""Roll out Codestra agent-continuation entrypoints across GitHub repositories.

This tool is intentionally conservative:
- It never edits the default branch directly.
- It preserves existing AGENTS.md / CLAUDE.md / Copilot instructions.
- It appends a managed Codestra block only when the marker is absent.
- It creates one documentation-only branch + PR per repository.
- It skips archived or empty repositories.
- It can be re-run safely.

Requirements:
- Python 3.10+
- GitHub CLI (gh)
- gh auth with access to the target repositories
"""

from __future__ import annotations

import argparse
import base64
import json
import subprocess
import sys
from dataclasses import dataclass
from typing import Any

OWNER = "ingtrader21-spec"
BRANCH = "chore/codestra-agent-protocol-v1"
PROTOCOL = "https://github.com/ingtrader21-spec/codestra/blob/main/docs/AGENT-CONTINUATION-PROTOCOL.md"
QUICKSTART = "https://github.com/ingtrader21-spec/codestra/blob/main/docs/AGENT-QUICKSTART.md"
MARKER = "<!-- CODESTRA_AGENT_PROTOCOL_V1 -->"

MANAGED_BLOCKS = {
    "AGENTS.md": f"""\n\n{MARKER}
## Codestra continuation contract

Canonical protocol:
{PROTOCOL}

Quick start:
{QUICKSTART}

Before changing code:
1. Read `.codestra-mission/*` when present.
2. Read the active Linear issue and linked Notion architecture.
3. Inspect exact Git branch/HEAD/dirty/worktree/upstream/PR/CI state.
4. Preserve all existing local work.
5. If acting as Builder, verify exclusive issue ownership and use a dedicated worktree.
6. Do not invent or self-assign the next task.
7. Update GitHub + Linear + Notion + the mission checkpoint before handoff.
8. Do not cross the live-production approval boundary.

The canonical protocol's no-loss, one-writer, protected-merge, checkpoint, and production-boundary rules are mandatory.
""",
    "CLAUDE.md": f"""\n\n{MARKER}
## Claude Code — Codestra continuation contract

Read first:
{PROTOCOL}

Then read `AGENTS.md` and `.codestra-mission/*`.

Use the active Linear issue as task authority. Preserve dirty local work. Builder work must use a dedicated worktree and exclusive issue ownership. Do not self-assign successor work. End with the protocol's structured checkpoint.
""",
    ".github/copilot-instructions.md": f"""\n\n{MARKER}
## Codestra coding-agent continuation contract

Canonical protocol:
{PROTOCOL}

Before editing, read repository-local agent/mission files, the active Linear issue, linked Notion architecture, and exact Git/PR/CI state. Preserve existing work. Builder work uses an isolated worktree with exclusive issue ownership. Never weaken protected checks or cross the live-production approval boundary. End with the protocol's structured checkpoint.
""",
}


@dataclass
class Repo:
    full_name: str
    default_branch: str | None
    archived: bool


def run(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    cp = subprocess.run(args, text=True, capture_output=True)
    if check and cp.returncode != 0:
        raise RuntimeError(
            f"command failed ({cp.returncode}): {' '.join(args)}\n"
            f"stdout:\n{cp.stdout}\nstderr:\n{cp.stderr}"
        )
    return cp


def gh_json(*args: str, check: bool = True) -> Any:
    cp = run("gh", *args, check=check)
    if cp.returncode != 0:
        return None
    text = cp.stdout.strip()
    return json.loads(text) if text else None


def list_repos(owner: str) -> list[Repo]:
    data = gh_json(
        "repo",
        "list",
        owner,
        "--limit",
        "200",
        "--json",
        "nameWithOwner,defaultBranchRef,isArchived",
    )
    repos: list[Repo] = []
    for row in data or []:
        ref = row.get("defaultBranchRef")
        default = ref.get("name") if isinstance(ref, dict) else None
        repos.append(
            Repo(
                full_name=row["nameWithOwner"],
                default_branch=default,
                archived=bool(row.get("isArchived")),
            )
        )
    return repos


def api_get(repo: str, path: str, ref: str) -> tuple[str | None, str | None]:
    cp = run(
        "gh",
        "api",
        f"repos/{repo}/contents/{path}",
        "-f",
        f"ref={ref}",
        check=False,
    )
    if cp.returncode != 0:
        if "404" in cp.stderr or "Not Found" in cp.stderr:
            return None, None
        raise RuntimeError(f"failed to read {repo}:{path}: {cp.stderr}")
    obj = json.loads(cp.stdout)
    raw = base64.b64decode(obj["content"]).decode("utf-8")
    return raw, obj["sha"]


def branch_exists(repo: str, branch: str) -> bool:
    cp = run("gh", "api", f"repos/{repo}/git/ref/heads/{branch}", check=False)
    return cp.returncode == 0


def ensure_branch(repo: str, branch: str, base: str) -> None:
    if branch_exists(repo, branch):
        return
    base_obj = gh_json("api", f"repos/{repo}/git/ref/heads/{base}")
    sha = base_obj["object"]["sha"]
    gh_json(
        "api",
        "-X",
        "POST",
        f"repos/{repo}/git/refs",
        "-f",
        f"ref=refs/heads/{branch}",
        "-f",
        f"sha={sha}",
    )


def put_file(repo: str, path: str, content: str, branch: str, sha: str | None) -> None:
    encoded = base64.b64encode(content.encode("utf-8")).decode("ascii")
    args = [
        "api",
        "-X",
        "PUT",
        f"repos/{repo}/contents/{path}",
        "-f",
        f"message=chore: add Codestra agent continuation entrypoint ({path})",
        "-f",
        f"content={encoded}",
        "-f",
        f"branch={branch}",
    ]
    if sha:
        args += ["-f", f"sha={sha}"]
    gh_json(*args)


def current_pr(repo: str, branch: str) -> str | None:
    data = gh_json(
        "pr",
        "list",
        "--repo",
        repo,
        "--state",
        "open",
        "--head",
        branch,
        "--json",
        "url",
    )
    if data:
        return data[0]["url"]
    return None


def create_pr(repo: str, base: str, branch: str) -> str:
    existing = current_pr(repo, branch)
    if existing:
        return existing
    cp = run(
        "gh",
        "pr",
        "create",
        "--repo",
        repo,
        "--base",
        base,
        "--head",
        branch,
        "--title",
        "chore: add Codestra multi-agent continuation entrypoints",
        "--body",
        (
            "Adds/updates documentation-only entrypoints for Codex, Claude Code, "
            "and GitHub Copilot coding agent. Existing local instructions are preserved; "
            "a managed Codestra protocol block is appended.\n\n"
            f"Canonical protocol: {PROTOCOL}\n\n"
            "No runtime or production behavior changes."
        ),
    )
    return cp.stdout.strip()


def process_repo(repo: Repo, dry_run: bool, merge_if_clean: bool) -> dict[str, Any]:
    result: dict[str, Any] = {"repo": repo.full_name}
    if repo.archived:
        result["status"] = "SKIP_ARCHIVED"
        return result
    if not repo.default_branch:
        result["status"] = "SKIP_EMPTY"
        return result

    if dry_run:
        result["status"] = "DRY_RUN"
        result["base"] = repo.default_branch
        return result

    ensure_branch(repo.full_name, BRANCH, repo.default_branch)
    changed = 0

    for path, block in MANAGED_BLOCKS.items():
        existing, sha = api_get(repo.full_name, path, BRANCH)
        if existing is None:
            new_content = block.lstrip()
        elif MARKER in existing:
            continue
        else:
            new_content = existing.rstrip() + block
        put_file(repo.full_name, path, new_content, BRANCH, sha)
        changed += 1

    if changed == 0:
        result["status"] = "ALREADY_MANAGED"
        pr = current_pr(repo.full_name, BRANCH)
        if pr:
            result["pr"] = pr
        return result

    pr_url = create_pr(repo.full_name, repo.default_branch, BRANCH)
    result.update({"status": "PR_OPEN", "changed_files": changed, "pr": pr_url})

    if merge_if_clean:
        cp = run(
            "gh",
            "pr",
            "merge",
            "--repo",
            repo.full_name,
            pr_url,
            "--auto",
            "--squash",
            check=False,
        )
        result["auto_merge_requested"] = cp.returncode == 0
        if cp.returncode != 0:
            result["auto_merge_message"] = (cp.stderr or cp.stdout).strip()

    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", default=OWNER)
    parser.add_argument("--repo", action="append", help="Limit to one or more owner/name repos")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--merge-if-clean",
        action="store_true",
        help="Request GitHub auto-merge with squash; branch protection and checks still govern merge.",
    )
    parser.add_argument("--output", default="agent-protocol-rollout-report.json")
    ns = parser.parse_args()

    auth = run("gh", "auth", "status", check=False)
    if auth.returncode != 0:
        print(auth.stderr or auth.stdout, file=sys.stderr)
        print("GitHub CLI authentication is required.", file=sys.stderr)
        return 2

    wanted = set(ns.repo or [])
    repos = list_repos(ns.owner)
    if wanted:
        repos = [r for r in repos if r.full_name in wanted]

    results = []
    for repo in repos:
        try:
            row = process_repo(repo, ns.dry_run, ns.merge_if_clean)
        except Exception as exc:  # keep portfolio rollout moving
            row = {"repo": repo.full_name, "status": "ERROR", "error": str(exc)}
        results.append(row)
        print(f"{row['repo']}: {row['status']}")

    report = {
        "protocol": PROTOCOL,
        "branch": BRANCH,
        "total": len(results),
        "results": results,
    }
    with open(ns.output, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    errors = [r for r in results if r["status"] == "ERROR"]
    print(f"report={ns.output} total={len(results)} errors={len(errors)}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
