# 🤖 Erix Buddy

> **Open-source AI code reviewer for any GitHub repo.** Bring your own LLM key. Drop into a workflow in two minutes. CodeRabbit-class output, zero lock-in.

[![GitHub Marketplace](https://img.shields.io/badge/GitHub%20Marketplace-erix--buddy-purple?logo=github)](https://github.com/marketplace/actions/erix-buddy)
[![npm](https://img.shields.io/npm/v/@ecodrix/erix-buddy.svg)](https://www.npmjs.com/package/@ecodrix/erix-buddy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/ecodrix/erix-buddy?style=social)](https://github.com/ecodrix/erix-buddy)

Erix Buddy is a CodeRabbit-style PR / codebase reviewer that runs as a GitHub Action **or** locally as a CLI. It produces walkthroughs, mermaid sequence diagrams, severity-tiered findings, suggested patches, SARIF, GitHub annotations, and risk-scored markdown reports — using **any LLM provider you have a key for**.

This repository hosts the **GitHub Action manifest** (`action.yml`), workflow recipes, and end-user documentation. The runtime lives in a separate npm package and is invoked via `npx`. → [`@ecodrix/erix-buddy`](https://www.npmjs.com/package/@ecodrix/erix-buddy)

---

## ⚡ 60-second setup

```bash
# 1. Scaffold a review workflow + config in your repo
npx @ecodrix/erix-buddy init

# 2. Set your provider API key as a GitHub secret
gh secret set GEMINI_API_KEY

# 3. Commit and push
git add .github/workflows/erix-review.yml .codereview.json .erixignore
git commit -m "chore: add Erix code review"
git push
```

Your next pull request gets an automatic AI review.

> Want to try it locally first? `GEMINI_API_KEY=… npx @ecodrix/erix-buddy --staged`

---

## ✨ Features

|                             |                                                                                                                                          |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| 🔌 **12 LLM providers**     | Gemini, Vertex AI, OpenAI, Anthropic Claude, Ollama (local), OpenRouter, Groq, Azure OpenAI, DeepSeek, Mistral, xAI Grok, ECODrix-hosted |
| 🔑 **Bring your own key**   | Credentials never leave your machine or your CI runner                                                                                   |
| 📝 **PR walkthrough**       | Title, summary, change table, mermaid sequence diagrams                                                                                  |
| 🎯 **Per-file deep review** | Severity tiers (`critical / major / minor / nitpick / info`), 10 categories, confidence, CWE IDs                                         |
| 🧭 **Cross-cutting pass**   | Architecture / consistency issues that span files                                                                                        |
| 💬 **Sticky PR comment**    | Updates in place on every push, no comment spam                                                                                          |
| 📊 **Risk score**           | Per-file and PR-level (0–100)                                                                                                            |
| 📂 **Full audit mode**      | Walk the whole codebase with content-hash cache, file-limit guard                                                                        |
| 🔧 **Auto-fix patches**     | Optional `git apply` of high-confidence fixes                                                                                            |
| 🛠 **Reports**              | Markdown, JSON, SARIF (drops into GitHub code-scanning), GH annotations, console                                                         |
| 🚦 **CI gating**            | Fail the build on critical/major issues                                                                                                  |
| 🔓 **MIT licensed**         | No telemetry, no phone-home, hackable                                                                                                    |

---

## 🧪 GitHub Action — copy-paste workflow

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
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 } # full history for branch diffs

      - uses: ecodrix/erix-buddy@v1
        with:
          provider: gemini
          api-key: ${{ secrets.GEMINI_API_KEY }}
          mode: branch
          branch: origin/${{ github.base_ref }}
          severity: minor
          fail-on-blocking: "true"
          post-pr-comment: "true"
```

The full input list is in [`action.yml`](./action.yml). Other recipes live in [`examples/`](./examples).

---

## 🔌 Supported providers

| Provider          | `provider:` id | Required secret(s)                                                         | Local? |
| :---------------- | :------------- | :------------------------------------------------------------------------- | :----: |
| Google Gemini API | `gemini`       | `GEMINI_API_KEY`                                                           |   ❌   |
| Google Vertex AI  | `vertex`       | `GOOGLE_CLOUD_PROJECT`, `CLOUD_ML_REGION`                                  |   ❌   |
| OpenAI            | `openai`       | `OPENAI_API_KEY`                                                           |   ❌   |
| Anthropic Claude  | `anthropic`    | `ANTHROPIC_API_KEY`                                                        |   ❌   |
| Ollama            | `ollama`       | `OLLAMA_HOST` (default `http://127.0.0.1:11434`)                           |   ✅   |
| OpenRouter        | `openrouter`   | `OPENROUTER_API_KEY`                                                       |   ❌   |
| Groq              | `groq`         | `GROQ_API_KEY`                                                             |   ❌   |
| Azure OpenAI      | `azure-openai` | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` |   ❌   |
| DeepSeek          | `deepseek`     | `DEEPSEEK_API_KEY`                                                         |   ❌   |
| Mistral AI        | `mistral`      | `MISTRAL_API_KEY`                                                          |   ❌   |
| xAI Grok          | `xai`          | `XAI_API_KEY`                                                              |   ❌   |
| ECODrix Hosted    | `ecodrix`      | `ECODRIX_REVIEWER_TOKEN`                                                   |   ❌   |

> The `ecodrix` provider is the **optional** ECODrix-hosted relay for users who don't want to bring their own key. The reviewer itself never contacts ECODrix unless you explicitly select it.

---

## 💻 Run locally

```bash
# Interactive setup (saves credentials to ~/.config/erix-reviewer.json, mode 0600)
npx @ecodrix/erix-buddy

# Review staged changes
npx @ecodrix/erix-buddy --staged

# Audit the whole codebase, only major+ issues
npx @ecodrix/erix-buddy --full --severity major --max-files 200

# Use Ollama, no API key required
npx @ecodrix/erix-buddy --provider ollama --model qwen2.5-coder:7b
```

`pnpm dlx` and `bunx` work the same. Full local CLI guide → [`docs/local-cli.md`](./docs/local-cli.md).

---

## 📚 Documentation

- 🚀 [Getting started](./docs/getting-started.md)
- 🧪 [GitHub Actions](./docs/github-actions.md)
- 🔌 [Providers in depth](./docs/providers.md)
- ⚙️ [Configuration reference](./docs/configuration.md)
- 🍳 [CI recipes](./docs/ci-recipes.md)
- 💻 [Local CLI](./docs/local-cli.md)
- 🩹 [Troubleshooting](./docs/troubleshooting.md)
- ❓ [FAQ](./docs/faq.md)

---

## 🍳 Recipes

- [PR review on every pull request](./examples/github-workflow.yml)
- [Nightly full-codebase audit](./examples/nightly-audit.yml)
- [Multi-provider matrix](./examples/matrix-providers.yml)
- [Monorepo with path filters](./examples/monorepo-with-paths.yml)
- [Self-hosted Ollama runner](./examples/ollama-self-hosted.yml)
- [GitLab CI integration](./examples/gitlab-ci.yml)

---

## 🛡️ Security

- API keys live only in GitHub Secrets (CI) or `~/.config/erix-reviewer.json` mode `0600` (local). They are **never** sent anywhere except the provider you selected.
- Erix Buddy never phones home. There is no telemetry, no usage tracking, no analytics.
- Treat LLM-generated patches as **suggestions** — always review before applying.
- See [`SECURITY.md`](./SECURITY.md) for the responsible disclosure policy.

---

## 🆚 How does this compare to CodeRabbit?

|                                       | CodeRabbit |          Erix Buddy           |
| :------------------------------------ | :--------: | :---------------------------: |
| Open source                           |     ❌     |            ✅ MIT             |
| Bring your own LLM key                |  Limited   |        ✅ 12 providers        |
| Run locally without a server          |     ❌     |              ✅               |
| Local Ollama support (free / private) |     ❌     |              ✅               |
| GitHub Action                         |     ✅     |              ✅               |
| GitHub Marketplace                    |     ✅     |              ✅               |
| Inline review comments                |     ✅     |        🟡 in progress         |
| Sticky PR walkthrough                 |     ✅     |              ✅               |
| Mermaid sequence diagrams             |     ✅     |              ✅               |
| Severity tiers + categories           |     ✅     |              ✅               |
| SARIF export                          |     🟡     |              ✅               |
| Self-hostable                         |     ❌     |              ✅               |
| Cost                                  | $24/dev/mo | $0 + your provider's metering |

We're not pretending to have full parity yet — see the [roadmap](https://github.com/ecodrix/erix-buddy/blob/main/ROADMAP.md). But the trade-off is clear: own your tooling, choose your model, pay only for the tokens you actually use.

---

## 🤝 Contributing

We welcome issues, PRs, and recipes! Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before submitting.

---

## 📄 License

[MIT](./LICENSE) — built and maintained by [ECODrix](https://ecodrix.com).
