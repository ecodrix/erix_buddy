# FAQ

## Is this really free?

The action and CLI are MIT-licensed and free forever. You pay only for the LLM tokens you use, billed by your chosen provider directly. Local Ollama is genuinely free (you pay for electricity).

## Does ECODrix see my code?

Only if you explicitly choose `provider: ecodrix`. With any other provider, your code goes from your runner directly to that provider's API. We have no servers in the path.

## Can I use this in a private repo?

Yes. Both the GitHub Action (which you `uses:` from a public repo) and the npm runtime work fine in private repos. Your code stays in your runner.

## Can I commit `.codereview.json` and `.erixignore`?

Yes — they're meant to be checked in. They contain no secrets.

## What's the difference between `@ecodrix/erix-buddy` and the GitHub Action?

- **`ecodrix/erix_buddy@v1`** is the GitHub Action (this public repo). It contains only `action.yml` + docs. The action delegates to the npm runtime.
- **`@ecodrix/erix-buddy`** is the npm package — the actual reviewer code, CLI, and providers. The action runs it via `npx` at execution time.

You only ever interact with the action in CI, and the npm package locally.

## How is this different from CodeRabbit?

|                            | CodeRabbit |          Erix Buddy           |
| :------------------------- | :--------: | :---------------------------: |
| Open source                |     ❌     |            ✅ MIT             |
| Bring your own key         |  Limited   |        ✅ 12 providers        |
| Local CLI                  |     ❌     |              ✅               |
| Self-hostable / air-gapped |     ❌     |         ✅ via Ollama         |
| Cost                       | $24/dev/mo | $0 + your provider's metering |

We're not at full feature parity — see the [roadmap](https://github.com/ecodrix/erix_buddy/blob/main/ROADMAP.md). But if you want to own the tooling and pay only for what you use, this is for you.

## Does it support languages other than TypeScript?

Yes — TypeScript / JavaScript, Python, Go, Rust, Ruby, Java, Kotlin, C / C++, C#, Bash, SQL, Vue, Svelte. Language-specific best-practices coverage varies; TS/JS is strongest today.

## Will it leak my code to train models?

Provider-specific:

- **OpenAI**: API traffic is not used for training by default ([source](https://platform.openai.com/docs/guides/your-data)).
- **Anthropic**: API traffic is not used for training by default ([source](https://www.anthropic.com/legal/privacy)).
- **Google**: Vertex AI traffic is not used for training; the consumer Gemini API has different terms — read carefully.
- **Ollama**: 100% local, never leaves your machine.

When in doubt, run locally with Ollama for sensitive code.

## Can I use multiple providers in one workflow?

Yes — see [`examples/matrix-providers.yml`](../examples/matrix-providers.yml). Useful for comparing review quality.

## How much does a typical PR review cost?

For a PR touching ~10 files / ~500 changed lines:

| Provider           | Rough cost |
| :----------------- | :--------- |
| Gemini 2.5 Flash   | ~$0.005    |
| GPT-4o-mini        | ~$0.01     |
| Claude 3.5 Sonnet  | ~$0.10     |
| Groq Llama 3.3 70B | ~$0.02     |
| Ollama             | $0         |

Audit mode on a 200-file repo costs roughly 20× a single PR review.

## Does it work offline?

Yes, if you use Ollama as the provider. All other providers require an internet connection to call their APIs.

## Can I run it in a corporate environment with no internet?

- **Yes**, with Ollama on a self-hosted runner, fully air-gapped.
- **Yes**, with Azure OpenAI behind your corporate proxy (set `base-url:` to your private endpoint).
- **Yes**, with any OpenAI-compatible relay you host yourself (vLLM, LiteLLM, etc.) — pass `provider: openai` and `base-url: https://your-relay.internal/v1`.

## How do I disable Erix on a specific PR?

Add a label like `skip-review` to the PR and gate the workflow:

```yaml
if: |
  !contains(github.event.pull_request.labels.*.name, 'skip-review')
```

Or skip via commit message: `[skip review]`.

## Does it work with monorepos?

Yes — see [`examples/monorepo-with-paths.yml`](../examples/monorepo-with-paths.yml). You can scope reviews to specific subdirectories using path filters.

## How do I contribute?

Issues, recipes, and PRs are welcome — see [`CONTRIBUTING.md`](../CONTRIBUTING.md). For runtime changes, the actual code lives in a separate repo; we route those issues from here.
