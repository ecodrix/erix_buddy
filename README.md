# 🤖 Erix Buddy (`ecodrix/erix-buddy`)

> Open-source, multi-provider AI code reviewer GitHub Action and CLI configurations. Bring your own key.

Erix Buddy is a CodeRabbit-style GitHub Action / codebase reviewer. It produces walkthroughs, mermaid sequence diagrams, severity-tiered findings, suggested patches, SARIF, GitHub annotations, and risk-scored markdown reports — using **any LLM provider you have a key for**.

This repository contains only the GitHub Action definition (`action.yml`), configuration examples, and documentation. The review runner is compiled and published separately as a public npm package: [`@ecodrix/erix-buddy`](https://www.npmjs.com/package/@ecodrix/erix-buddy).

---

## ✨ Features

- **Multi-provider** — Gemini, Vertex AI, OpenAI, Anthropic, Ollama (local), OpenRouter, Groq, Azure OpenAI, DeepSeek, Mistral, xAI Grok, ECODrix-hosted relay.
- **Bring your own key** — credentials stay in your own environment / secrets.
- **PR mode** (diff-only) and **Full audit mode** (whole codebase, with content-hash cache).
- **Aesthetic and detailed reports** — walkthrough, mermaid sequence diagrams, severity tiers (`critical / major / minor / nitpick / info`), 10 categories, per-issue confidence, CWE IDs, suggested patches.
- **GitHub Action** with sticky PR comments, inline annotations, and CI gating on critical/major issues.
- **Reports**: markdown, JSON, SARIF (drops into GitHub code-scanning), GitHub-Actions annotations, console.

---

## 🧪 GitHub Action Setup

Use Erix Buddy directly in your workflow. The action posts (or updates) a sticky PR comment with the markdown report and emits inline GitHub annotations.

```yaml
# .github/workflows/review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  erix-review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history is required for branch diffing

      - name: Run Erix Buddy
        uses: ecodrix/erix-buddy@v1
        with:
          provider: gemini
          api-key: ${{ secrets.GEMINI_API_KEY }}
          mode: branch
          branch: origin/${{ github.base_ref }}
          severity: minor
          fail-on-blocking: "true"
          post-pr-comment: "true"
```

All inputs are listed in [`action.yml`](./action.yml). A more complete example lives in [`examples/github-workflow.yml`](./examples/github-workflow.yml).

---

## 🔌 Providers

| Provider          | Id             | Env var(s) / Secrets                                                       | Local? |
| ----------------- | -------------- | -------------------------------------------------------------------------- | ------ |
| Google Gemini API | `gemini`       | `GEMINI_API_KEY`                                                           | ❌     |
| Google Vertex AI  | `vertex`       | `GOOGLE_CLOUD_PROJECT`, `CLOUD_ML_REGION`                                  | ❌     |
| OpenAI            | `openai`       | `OPENAI_API_KEY`                                                           | ❌     |
| Anthropic Claude  | `anthropic`    | `ANTHROPIC_API_KEY`                                                        | ❌     |
| Ollama            | `ollama`       | `OLLAMA_HOST` (defaults to `http://127.0.0.1:11434`)                       | ✅     |
| OpenRouter        | `openrouter`   | `OPENROUTER_API_KEY`                                                       | ❌     |
| Groq              | `groq`         | `GROQ_API_KEY`                                                             | ❌     |
| Azure OpenAI      | `azure-openai` | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` | ❌     |
| DeepSeek          | `deepseek`     | `DEEPSEEK_API_KEY`                                                         | ❌     |
| Mistral AI        | `mistral`      | `MISTRAL_API_KEY`                                                          | ❌     |
| xAI Grok          | `xai`          | `XAI_API_KEY`                                                              | ❌     |
| ECODrix Hosted    | `ecodrix`      | `ECODRIX_REVIEWER_TOKEN`                                                   | ❌     |

---

## 🚀 Running via CLI

You can also run the reviewer locally via `npx` (which downloads and runs the `@ecodrix/erix-buddy` package):

```bash
# Interactive setup (recommended for first run)
npx @ecodrix/erix-buddy

# Non-interactive — review staged changes with Gemini
GEMINI_API_KEY=... npx @ecodrix/erix-buddy --staged

# Full codebase audit, only major+ issues
npx @ecodrix/erix-buddy --full --severity major --max-files 200
```

---

## ⚙️ Configuration

You can place an optional repo-level configuration file (`.codereview.json`, `.codereview.yaml`, or `.kiro/codereview.json`) at your repo root. See [`examples/codereview.config.json`](./examples/codereview.config.json) for options.

---

## 🛡️ Security

- API keys live only in your GitHub Secrets/Environment variables and are **never** shared with ECODrix. They are sent directly to the provider endpoint you select.
- Erix Buddy never telemetry-tracks your code.
- Treat LLM-generated patches as suggestions — always review them before applying.

---

## 🤝 Contributing & License

Issues and PRs welcome! Erix Buddy is MIT-licensed.
