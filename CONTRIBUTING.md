# Contributing to Erix Buddy

Thanks for considering a contribution! Erix Buddy is small, opinionated, and open-source — there's plenty of room to improve it.

## Repository layout

- This public repo (`ecodrix/erix-buddy`) contains the **GitHub Action manifest, documentation, and example workflows**.
- The **runtime code** (CLI, providers, reporters, action runner) lives in the npm package `@ecodrix/erix-buddy` and is published from a separate repo. Issues and PRs about runtime behaviour can still be filed here — we triage and route them.

## What we love receiving

- 🍳 New CI recipes (Bitbucket, Drone, CircleCI, monorepo patterns).
- 📚 Documentation improvements, typo fixes, broken-link reports.
- 🐛 Bug reports with a minimal reproduction. The clearer the repro, the faster the fix.
- 💡 Feature ideas — open a discussion before submitting a large PR.
- 🌍 Translations of the README and docs.

## Filing an issue

1. Search [existing issues](https://github.com/ecodrix/erix-buddy/issues) first.
2. Use the appropriate template (bug, feature, recipe).
3. Include: provider, model, action version, and a redacted excerpt of the workflow if relevant.
4. **Never paste API keys, tokens, or secrets.** Redact them. Use `***` placeholders.

## Submitting a pull request

1. Fork the repo.
2. Create a branch: `git checkout -b feat/your-change`.
3. Keep changes focused — one PR per logical change.
4. Update relevant docs / recipes / README sections.
5. Sign off your commit (`git commit -s`).
6. Open the PR with a clear summary and link any related issues.

## Style

- Markdown lines wrap at ~100 chars; we don't enforce hard wrap.
- Keep recipe YAML lean: one job, the minimum useful inputs, comments only where non-obvious.
- Provider docs follow a consistent structure: env vars → models → quirks → example.
- README badges are MIT, npm, marketplace, stars — please don't add badge bloat.

## Code of conduct

By participating, you agree to abide by [our code of conduct](./CODE_OF_CONDUCT.md). In short: be respectful, assume good intent, and focus on the work.

## Releasing

Releases are cut from `main`:

1. Bump version in the underlying `@ecodrix/erix-buddy` package.
2. Tag the public repo (`v1.x.y`) with the same version.
3. The action.yml `runs.steps.run: npx -y --package=@ecodrix/erix-buddy@VERSION` is updated to pin the corresponding npm version (in the major-version branch).

The GitHub Marketplace listing tracks the latest `v1` major-version branch.
