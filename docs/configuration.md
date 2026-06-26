# Configuration

Every behaviour of Erix Buddy can be tuned. Configuration sources, in increasing precedence:

1. Built-in defaults.
2. Repo-level config file: `.codereview.json` (or `.codereview.yaml`, or `.kiro/codereview.json`).
3. Action `inputs:` / CLI flags.
4. Environment variables.

## `.codereview.json` reference

Drop a file at the repo root:

```json
{
  "model": "gemini-2.5-flash",
  "concurrency": 4,
  "severityThreshold": "minor",
  "enableWalkthrough": true,
  "enableMermaid": true,
  "enableArchitectureReview": true,
  "enableTestCoverage": true,
  "categories": [
    "security",
    "correctness",
    "performance",
    "architecture",
    "maintainability",
    "testing",
    "documentation",
    "design-system"
  ],
  "ignorePatterns": ["tests/.*", "src/generated/.*", "scripts/legacy/.*"],
  "customInstructions": "Multi-tenant SaaS — every query must include tenantId. Public functions must have JSDoc."
}
```

### Fields

| Field                      | Type     | Default                   | Description                                                              |
| :------------------------- | :------- | :------------------------ | :----------------------------------------------------------------------- |
| `model`                    | string   | provider default          | Model id passed to the LLM.                                              |
| `concurrency`              | number   | `3`                       | Parallel file reviews.                                                   |
| `severityThreshold`        | string   | `"info"`                  | Minimum severity emitted.                                                |
| `enableWalkthrough`        | boolean  | `true`                    | Generate the PR walkthrough.                                             |
| `enableMermaid`            | boolean  | `true`                    | Allow mermaid sequence diagrams in walkthroughs.                         |
| `enableArchitectureReview` | boolean  | `true`                    | Run cross-cutting architecture pass.                                     |
| `enableTestCoverage`       | boolean  | `true`                    | Surface test coverage gaps.                                              |
| `categories`               | string[] | all 10                    | Whitelist of categories to surface.                                      |
| `ignorePatterns`           | string[] | `[]`                      | Regex/substring file path filters (additive to `.erixignore`).           |
| `customInstructions`       | string   | `""`                      | Free-form text appended to the system prompt.                            |
| `outputFormats`            | string[] | `["markdown","console"]`  | Reporters: `markdown`, `json`, `sarif`, `github-annotations`, `console`. |
| `reportPath`               | string   | `"code-review-report.md"` | Markdown report destination.                                             |
| `contextFiles`             | number   | `4`                       | Related-file context to include per review.                              |
| `maxFileChars`             | number   | `60000`                   | Truncation threshold for very large files.                               |
| `retries`                  | number   | `2`                       | LLM call retry budget.                                                   |

## `.erixignore`

Use a `.gitignore`-style file at the repo root. One pattern per line. Lines starting with `re:` are treated as regex. **The same file is honored by both the local CLI and the GitHub Action** — set it once, ignored everywhere.

`erix-buddy init` scaffolds a `.erixignore` for you. The **recommended default keeps
reviews focused on shippable source and excludes the high-volume, low-signal
paths**: tests, one-off scripts, generated code, and build output. Without this,
an audit of a large monorepo wastes tokens reviewing thousands of test/script
files (and hits the `--max-files` cap before reaching real source).

Recommended starting point (see [`examples/erixignore.example`](../examples/erixignore.example) for the full version):

```
# Tests
**/__tests__/**
**/e2e/**
**/*.test.*
**/*.spec.*
re:.*\.(test|spec|bench|property)\.(ts|tsx|js|jsx|mjs|cjs|py)$

# Test support: mocks / fixtures / snapshots / harnesses
**/__mocks__/**
**/__fixtures__/**
**/__snapshots__/**
**/test-support/**

# One-off scripts / tooling
scripts/**
tools/**

# Generated code
src/generated/**
**/__generated__/**
**/*.d.ts

# Build artefacts / caches
dist/**
build/**
coverage/**
.next/**
.turbo/**
.cache/**

# DB migrations (machine-authored)
**/migrations/**

# Vendor / lockfiles / built assets
vendor/**
**/*.lock
**/*.min.js
public/**
```

To **review** tests or scripts on purpose, delete the relevant block — or scope a
one-off run with `--path` (e.g. `--full --path "src/**"`).

Patterns combine additively with `ignorePatterns` from the config file.

## Action inputs

Every config field has a corresponding action input where it makes sense for CI. See [`action.yml`](../action.yml) for the full list.

Common ones:

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    severity: minor # config: severityThreshold
    concurrency: 4 # config: concurrency
    custom-instructions: |
      Multi-tenant SaaS — every query must include tenantId.
      Public functions must have JSDoc.
    fail-on-blocking: "true"
    post-pr-comment: "true"
```

## Environment variables

These are read at startup, regardless of CLI flags or config:

| Variable                       | Purpose                                                                                                        |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `CODE_REVIEW_FAIL_ON_BLOCKING` | Set to `1` to exit non-zero on critical/major issues (action sets this for you when `fail-on-blocking: true`). |
| `GITHUB_TOKEN`                 | Used by the sticky-PR-comment reporter. The action provides this automatically.                                |
| `OLLAMA_HOST`                  | Override the Ollama base URL.                                                                                  |
| Provider-specific env vars     | See [providers.md](./providers.md) — auto-detected when you don't pass `api-key:`.                             |

## Per-feature toggles via CLI

If you want a one-off run that ignores config:

```bash
npx @ecodrix/erix-buddy --no-walkthrough --no-mermaid --no-architecture --severity major
```

Flags always win over file config.

## Where credentials are stored

- **CI:** in your repo's GitHub Secrets, never written to disk.
- **Local:** `~/.config/erix-reviewer.json` with mode `0600` (owner-only). Contents are JSON; safe to inspect, but **never** check it in.

Wipe it any time with:

```bash
npx @ecodrix/erix-buddy --reset-config
```
