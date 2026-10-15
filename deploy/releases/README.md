# Reviewed release tuples

The image-release workflow produces `release-manifest.json` as an artifact after the image is scanned, published by digest, and attested.

Before production activation:

1. download that artifact from the exact successful workflow run;
2. verify its checksum and provenance;
3. rename it to `<source-sha>.json`;
4. add it here through a reviewed pull request;
5. use the committed path and its SHA-256 as deployment inputs.

Do not edit a generated release tuple by hand. A deployment accepts only:

```text
deploy/releases/<40-character-source-sha>.json
```

The deployment workflow verifies that the committed source SHA, repository, image reference, image digest, API endpoint, SBOM checksum, scan checksum, and workflow-run identity match the requested activation.
