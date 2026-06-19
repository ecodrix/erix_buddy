# Local CLI

Run Erix Buddy on your laptop without touching CI. Useful for dry-runs, local audits, and "is this PR ready?" checks before you push.

## Install nothing — use `npx`

```bash
npx @ecodrix/erix-buddy
```

`pnpm dlx`, `bunx`, `yarn dlx` all work the same.

## First run

If you run with no flags, Erix walks you through an interactive setup:

```
🤖 Erix Buddy — guided setup

? Which AI Provider would you like to use?
  ❯ Google Gemini  ★
    OpenAI
    Anthropic Claude
    Groq (fast)
    OpenRouter (multi-model)
    Ollama (local, free)
    ...
? Enter your Gemini API key: ******************************
? Select a model: gemini-2.5-flash
? What is the project path to review? .
? Which review mode? PR · staged changes
? Report output path: code-review-report.md
? Save these settings to ~/.config/erix-reviewer.json? Yes
```

Settings are saved to `~/.config/erix-reviewer.json` (mode `0600`). You won't be asked again.

## PR-mode commands

```bash
# Unstaged changes (default)
npx @ecodrix/erix-buddy

# Staged changes only
npx @ecodrix/erix-buddy --staged

# Last commit
npx @ecodrix/erix-buddy --last

# Diff against a branch
npx @ecodrix/erix-buddy --branch main
npx @ecodrix/erix-buddy --branch origin/develop

# Explicit ref range
npx @ecodrix/erix-buddy --base v1.0.0 --head HEAD
```

## Audit mode (whole codebase)

```bash
# Full repo
npx @ecodrix/erix-buddy --full

# Limit to a subtree
npx @ecodrix/erix-buddy --full src/

# Cap how many files we look at
npx @ecodrix/erix-buddy --full --max-files 100

# Filter by path (substring or regex)
npx @ecodrix/erix-buddy --full --path "src/api"
npx @ecodrix/erix-buddy --full --path "re:.*\.controller\.ts$"

# Audit only major+ issues
npx @ecodrix/erix-buddy --full --severity major
```

Audit mode caches per-file results at `.cache/erix-reviewer/<sha256>.json`. Re-runs only re-review files whose content changed. Bypass with `--no-cache`.

## Override provider on the fly

```bash
# Skip the saved config; use Ollama instead
npx @ecodrix/erix-buddy --provider ollama --model qwen2.5-coder:7b --staged

# Try a different OpenAI model
OPENAI_API_KEY=… npx @ecodrix/erix-buddy --provider openai --model gpt-4o --staged

# Use a custom base URL (Azure, on-prem relay)
npx @ecodrix/erix-buddy --provider openai --base-url https://my-relay.example.com/v1
```

## Output controls

```bash
# Only emit machine-readable JSON
npx @ecodrix/erix-buddy --staged --format json

# Multi-format
npx @ecodrix/erix-buddy --staged --format markdown,sarif

# Different report path
npx @ecodrix/erix-buddy --staged -o reports/$(date +%F).md

# Quieter output
npx @ecodrix/erix-buddy --staged --severity major --no-walkthrough
```

## Auto-fix patches

```bash
npx @ecodrix/erix-buddy --staged --auto-fix
```

Patches with confidence ≥ 0.8 are validated with `git apply --check` first, then applied. Stored at `.cache/code-review-patches/`. Always review the resulting `git diff` before committing.

## Useful flag combinations

```bash
# Pre-commit guard — fail loudly on critical issues only
npx @ecodrix/erix-buddy --staged --severity major --no-mermaid

# Quick "what does this branch do?" walkthrough
npx @ecodrix/erix-buddy --branch main --no-architecture --no-tests

# Cheap nightly self-audit on a personal project
npx @ecodrix/erix-buddy --full --provider ollama --model qwen2.5-coder:7b
```

## Subcommands

The CLI has a few non-review subcommands:

```bash
npx @ecodrix/erix-buddy init      # scaffold a workflow + config in this repo
npx @ecodrix/erix-buddy doctor    # diagnose your local setup
npx @ecodrix/erix-buddy --reset-config   # wipe saved credentials
npx @ecodrix/erix-buddy --help    # full help
```

## Performance tips

- **Use Groq for iterative local runs.** It's typically 5–10× faster than other providers.
- **Use Ollama for offline / privacy-sensitive code.** `qwen2.5-coder:7b` runs fine on a 16 GB MacBook.
- **Cache big audits.** First run is slow; subsequent runs only re-do changed files.
- **Lower `--concurrency` if your provider rate-limits you.** Default is 3, raise to 6+ if you have headroom.
