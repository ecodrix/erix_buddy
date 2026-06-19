# Getting Started

This guide gets you from zero to a working AI code review on your next pull request in about 5 minutes.

## What you'll need

- A GitHub repository.
- An API key for at least one of the [supported providers](./providers.md) (or a local Ollama install — free, no key needed).
- Node.js 18+ installed locally if you want to test before committing the workflow.

## Path 1 — Auto-scaffold (recommended)

```bash
npx @ecodrix/erix-buddy init
```

The interactive scaffolder will:

1. Detect your repo (git remote, package manager, project type).
2. Ask which provider you want to use.
3. Ask when reviews should run (PR-only, PR + nightly audit, manual).
4. Write `.github/workflows/erix-review.yml`, `.codereview.json`, and `.erixignore`.
5. Tell you exactly which secret to set and the `gh secret set` command to copy.

Then commit and push:

```bash
git add .github .codereview.json .erixignore
git commit -m "chore: add Erix code review"
git push
```

Your next PR gets an automatic review.

## Path 2 — Manual setup

Drop this file into `.github/workflows/erix-review.yml`:

```yaml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: ecodrix/erix-buddy@v1
        with:
          provider: gemini
          api-key: ${{ secrets.GEMINI_API_KEY }}
          mode: branch
          branch: origin/${{ github.base_ref }}
```

Set your provider's secret in **Settings → Secrets and variables → Actions** (or via `gh secret set GEMINI_API_KEY`).

## Try it locally first

Don't trust the AI yet? Run it locally on a branch you already changed:

```bash
GEMINI_API_KEY=… npx @ecodrix/erix-buddy --staged
# or for Ollama (no API key)
npx @ecodrix/erix-buddy --provider ollama --model qwen2.5-coder:7b --staged
```

You'll get a markdown report at `code-review-report.md` and a console summary.

## What you'll see on a PR

When the action runs, you get:

- A **sticky PR comment** with the walkthrough, summary table, and findings (updates in place on every push, no comment spam).
- **Inline GitHub annotations** at the exact lines the reviewer flagged.
- Optional **CI failure** if there are critical or major issues (`fail-on-blocking: "true"`).

## Next steps

- 🔌 [Pick a provider](./providers.md) — pricing, quality, speed comparison.
- ⚙️ [Tune the configuration](./configuration.md) — ignore patterns, custom rules, severity thresholds.
- 🍳 [Browse recipes](./ci-recipes.md) — nightly audits, multi-provider matrices, monorepo patterns.
- 🩹 [Troubleshooting](./troubleshooting.md) — common errors and fixes.
