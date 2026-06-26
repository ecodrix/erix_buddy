# GitHub Actions Guide

Everything you need to wire Erix Buddy into your repo's CI. Working examples for every common scenario live in [`../examples/`](../examples).

## Minimum viable workflow

```yaml
# .github/workflows/erix-review.yml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: ecodrix/erix_buddy@v1
        with:
          provider: gemini
          api-key: ${{ secrets.GEMINI_API_KEY }}
```

## Required permissions

```yaml
permissions:
  contents: read # to read your code
  pull-requests: write # to post the sticky PR comment
```

For SARIF upload to the GitHub Security tab, also add:

```yaml
security-events: write
```

## Triggers

The reviewer is most useful on `pull_request`:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
```

Skip drafts to save tokens:

```yaml
jobs:
  review:
    if: github.event.pull_request.draft == false
```

For nightly audits, use `schedule:` — see [`examples/nightly-audit.yml`](../examples/nightly-audit.yml).

## Action inputs

| Input                 | Default                 | Description                                                                     |
| :-------------------- | :---------------------- | :------------------------------------------------------------------------------ |
| `provider`            | `gemini`                | LLM provider id.                                                                |
| `api-key`             | —                       | Provider API key. Use `${{ secrets.* }}`.                                       |
| `model`               | provider default        | Model id.                                                                       |
| `mode`                | `branch`                | `branch` / `staged` / `last` / `unstaged` / `full` / `audit`.                   |
| `branch`              | `origin/main`           | Base branch for `mode: branch`. Set to `origin/${{ github.base_ref }}` for PRs. |
| `severity`            | `minor`                 | Minimum severity to surface.                                                    |
| `concurrency`         | `4`                     | Parallel file reviews.                                                          |
| `report-path`         | `code-review-report.md` | Where to write markdown.                                                        |
| `fail-on-blocking`    | `true`                  | Exit non-zero on critical/major issues.                                         |
| `post-pr-comment`     | `true`                  | Post sticky PR comment.                                                         |
| `custom-instructions` | —                       | Free-form text appended to the prompt.                                          |
| `full-root`           | `.`                     | Subtree for `mode: full`.                                                       |
| `paths`               | —                       | Path filters for audit mode (comma- or newline-separated).                      |
| `max-files`           | `500`                   | Cap files reviewed in audit mode.                                               |
| `vertex-project`      | —                       | GCP project id for `provider: vertex`.                                          |
| `vertex-location`     | `us-central1`           | GCP region for `provider: vertex`.                                              |
| `base-url`            | —                       | Override provider API base URL.                                                 |
| `azure-deployment`    | —                       | Azure OpenAI deployment name.                                                   |

## Action outputs

```yaml
- id: review
  uses: ecodrix/erix_buddy@v1
  with: { ... }

- run: cat ${{ steps.review.outputs.report-path }}
```

## Failing the build on critical issues

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    severity: major
    fail-on-blocking: "true"
```

Combined with branch protection rules, this gates merges on AI review.

## Uploading SARIF to GitHub Security

```yaml
- uses: ecodrix/erix_buddy@v1
  id: review
  with:
    provider: gemini
    api-key: ${{ secrets.GEMINI_API_KEY }}
    # Tell the action to also emit SARIF
    # (the underlying CLI runs with --format markdown,sarif,github-annotations)

- uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: code-review-report.sarif
```

## Self-hosted runners (Ollama)

```yaml
runs-on: self-hosted # must have Ollama running
steps:
  - uses: actions/checkout@v4
    with: { fetch-depth: 0 }
  - uses: ecodrix/erix_buddy@v1
    with:
      provider: ollama
      model: qwen2.5-coder:7b
      base-url: http://localhost:11434
```

Full recipe → [`examples/ollama-self-hosted.yml`](../examples/ollama-self-hosted.yml).

## Concurrency control

Avoid overlapping reviews on rapid pushes:

```yaml
concurrency:
  group: erix-review-${{ github.ref }}
  cancel-in-progress: true
```

## Skipping the review

Add a label to the PR (`skip-review`) and gate the job:

```yaml
if: |
  github.event.pull_request.draft == false &&
  !contains(github.event.pull_request.labels.*.name, 'skip-review')
```

Or skip via commit message:

```yaml
if: |
  !contains(github.event.head_commit.message, '[skip review]')
```

## Pinning the action

Pin to a specific version for reproducibility:

```yaml
uses: ecodrix/erix_buddy@v1.2.3   # pinned to exact version
# or
uses: ecodrix/erix_buddy@v1       # latest v1.x.x
```

We follow semver. Major-version branches (`v1`, `v2`) track the latest release in that major.

## Debugging

- Add `--verbose` via the underlying CLI by setting `INPUT_VERBOSE=true` in the step's `env:` (or use a verbose recipe).
- Check the action logs — every file review prints `[i/N] file → status`.
- The action also writes `code-review-report.md` to the workspace; download it as an artifact:

```yaml
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: erix-review-report
    path: code-review-report.md
```

## Branch protection integration

In **Settings → Branches → Branch protection rules → main → Require status checks**, enable the `review` job. The `fail-on-blocking: "true"` input ensures the check fails when critical/major issues exist.
