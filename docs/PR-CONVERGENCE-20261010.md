# Legacy public-web PR convergence (2026-10-10)

PRs 6, 7, 8, 9, 10, 12 and 13 share an ancestry-preserving convergence containing current main and their original heads. Localized marketing, consent/compliance, platform portals, modern systems and connected-systems designs, SEO landings and consultation intake remain available. Current cookie authentication, logout race protection, full legal routes, protected chart behavior and immutable candidate-only production workflow remain in place. Obsolete activation/release/preflight scaffolds are retained as inactive deployment references.

Review regressions fixed: nested authenticated routes; immutable consultation retry identity/time; optional analytics blocking lead submission; retention scheduling with delivery disabled. Static utility pages now retain app shells while sitemap indexing excludes those utilities. Homepage animation updates are isolated and below-fold media deferred; original Lighthouse thresholds remain unchanged.

Validation: 81 frontend tests; 23 adapter tests; lint with zero errors (four existing warnings); production npm audit zero; full build; 168 localized SEO pages and 229 sitemap URLs; 55 SEO landing pages; gzip performance budget; locale catalogue coverage; 12 mobile/tablet/desktop browser checks; all three Lighthouse URLs pass original assertions; production orchestrator and release-intent selftests; runtime discovery fixtures; full-history Gitleaks 452 commits; whitespace check. CI exact workflow hash drift is rejected. Gitleaks excludes one exact historical false-positive fingerprint containing a reviewed workflow SHA-256 trust literal. Local adapter tests use disposable loopback PostgreSQL, with provider/network effects mocked.

Dockerfile removes a duplicate obsolete repository source label that overwrote the canonical source; the existing hardened image and immutable metadata definitions remain unchanged. Reviewed hashes bind local CI lanes, source scripts and dependencies; arbitrary workflow drift re-enters conservative mutation classification.

Limitations: literal UI audit reports 333 inherited/original-English strings (including test literals); catalogue coverage passes and English design roots declare their language. Developer-only braces advisory has no supported npm fix; production audit is clean. Remote CI and review status must be evaluated at the pushed final SHA. No protected target merge or deployment was performed.

Local evidence: /tmp/pr12-final-test.log, /tmp/pr12-adapter-tests3.log, /tmp/pr12-build12.log, /tmp/pr12-final-seo.log, /tmp/pr12-browser5.log, /tmp/pr12-final-lighthouse-isolated.log, /tmp/pr12-contract-final2.log, /tmp/pr12-gitleaks-clean.log. Performance is sensitive to concurrent CPU-heavy checks; final isolated run passes.

Remote CI followup: execute the exact secret-scan shell wrapper, including checksum verification. Archive filename now matches the upstream checksum manifest; exact wrapper passes. The earlier restored wrapper used a shortened filename and failed verification before scanning.

Two of seven identical remote browser jobs failed without publicly accessible logs; exact local twelve-test command passed. CI browser work is serialized to one worker for scheduling isolation, preserving all assertions and responsive widths. Always-uploaded retained traces provide actionable failure evidence; this is not a confirmed application defect repair.

Hydration race reproduced with delayed lazy homepage JavaScript: static h1 exists while both language controls are absent. Navigation test now awaits the mounted canonical language control before viewport visibility branching; delayed lazy-asset coverage retains all original behavior assertions.

Inherited GHCR workflow parsing corrected: runner.temp expressions moved from unsupported job env context into auth/inspect/cleanup step env contexts. All active workflows pass actionlint; structural context regression, exact workflow hash drift rejection and full governance selftests pass. Read-only GHCR scope and cleanup behavior are retained.

Remote diagnostic followup: browser JSON reporter and Lighthouse assertion/manifest summaries publish bounded, redacted failure details to the public job summary. Tee log capture retains startup errors when reports are absent; pipefail preserves the original quality-check exit code. Fixture verifies failed-title/error publication and token/query redaction; actual reporter run and governance/actionlint checks pass. No application changes or quality threshold adjustments.
