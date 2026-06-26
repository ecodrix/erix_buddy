# Providers

Erix Buddy is **provider-agnostic** — pick whatever LLM you have a key for, or run locally via Ollama for free. Adding a new provider is ~30 lines of TypeScript.

## Quick comparison

| Provider               | Best for                 | Speed         | Quality | Cost (Aug 2026)         |
| :--------------------- | :----------------------- | :------------ | :------ | :---------------------- |
| **Gemini 2.5 Flash**   | Default, balanced        | ⚡⚡⚡        | ★★★★    | $0.10 / 1M input tokens |
| **Gemini 2.5 Pro**     | Highest quality          | ⚡⚡          | ★★★★★   | $1.25 / 1M input tokens |
| **GPT-4o-mini**        | Cost-efficient           | ⚡⚡⚡        | ★★★★    | $0.15 / 1M input tokens |
| **GPT-4o**             | High capability          | ⚡⚡          | ★★★★★   | $2.50 / 1M input tokens |
| **Claude 3.5 Sonnet**  | Code reasoning           | ⚡⚡          | ★★★★★   | $3.00 / 1M input tokens |
| **Groq Llama 3.3 70B** | Fast iteration           | ⚡⚡⚡⚡      | ★★★★    | $0.59 / 1M input tokens |
| **Ollama (local)**     | Free / offline / private | ⚡ (local HW) | ★★★     | $0                      |
| **OpenRouter**         | Try many models          | varies        | varies  | provider rates + 5%     |
| **DeepSeek**           | Cheap & strong           | ⚡⚡          | ★★★★    | $0.14 / 1M input tokens |
| **Mistral Large**      | EU residency             | ⚡⚡          | ★★★★    | $2.00 / 1M input tokens |

> Pricing snapshot — always check the provider's current rates.

## Setting up each provider

### Google Gemini API (`gemini`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: gemini
    api-key: ${{ secrets.GEMINI_API_KEY }}
    model: gemini-2.5-flash # or gemini-2.5-pro
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

### Google Vertex AI (`vertex`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: vertex
    vertex-project: ${{ secrets.GOOGLE_CLOUD_PROJECT }}
    vertex-location: us-central1
    model: gemini-2.5-flash
```

Vertex uses application default credentials; the action expects them to be set (typically via `google-github-actions/auth`).

### OpenAI (`openai`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: openai
    api-key: ${{ secrets.OPENAI_API_KEY }}
    model: gpt-4o-mini
```

### Anthropic Claude (`anthropic`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: anthropic
    api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    model: claude-3-5-sonnet-latest
```

Claude does not have native JSON-mode; we coax JSON via prompting. Quality is excellent but parse failures are slightly more common — bump retries with `concurrency: 2` if you see issues.

### Ollama (`ollama`) — local, free

```yaml
- runs-on: self-hosted # ← runner must have Ollama installed
  uses: ecodrix/erix_buddy@v1
  with:
    provider: ollama
    model: qwen2.5-coder:7b
    base-url: http://localhost:11434
```

Locally:

```bash
ollama pull qwen2.5-coder:7b
npx @ecodrix/erix-buddy --provider ollama --model qwen2.5-coder:7b --staged
```

Recommended models: `qwen2.5-coder:7b` (best code reasoning at this size), `llama3.1:8b` (general-purpose), `deepseek-r1:14b` (slow but smart).

### OpenRouter (`openrouter`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: openrouter
    api-key: ${{ secrets.OPENROUTER_API_KEY }}
    model: anthropic/claude-3.5-sonnet
```

OpenRouter routes to 200+ models with one key — handy for matrix testing. We default the `HTTP-Referer` to `https://ecodrix.com` and `X-Title` to `ECODrix Erix Reviewer`; override with `OPENROUTER_REFERRER` / `OPENROUTER_TITLE`.

### Groq (`groq`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: groq
    api-key: ${{ secrets.GROQ_API_KEY }}
    model: llama-3.3-70b-versatile
```

Groq is **very** fast (typically 5–10× faster than other providers). Great for iterative local use.

### Azure OpenAI (`azure-openai`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: azure-openai
    api-key: ${{ secrets.AZURE_OPENAI_API_KEY }}
    base-url: https://my-resource.openai.azure.com
    azure-deployment: gpt-4o-mini-prod # your deployment name
    model: gpt-4o-mini-prod # same as deployment
```

The `model` input on Azure is the deployment name, not the OpenAI model id.

### DeepSeek (`deepseek`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: deepseek
    api-key: ${{ secrets.DEEPSEEK_API_KEY }}
    model: deepseek-chat # or deepseek-reasoner for R1
```

### Mistral AI (`mistral`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: mistral
    api-key: ${{ secrets.MISTRAL_API_KEY }}
    model: codestral-latest # code-tuned, recommended for code review
```

### xAI Grok (`xai`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: xai
    api-key: ${{ secrets.XAI_API_KEY }}
    model: grok-2-latest
```

### ECODrix Hosted (`ecodrix`)

```yaml
- uses: ecodrix/erix_buddy@v1
  with:
    provider: ecodrix
    api-key: ${{ secrets.ECODRIX_REVIEWER_TOKEN }}
```

The optional ECODrix-hosted relay for users who don't want to bring their own key. We bill per-token at cost + a small platform fee. **The reviewer never contacts ECODrix unless you explicitly select this provider.**

## Choosing a provider

- **Just starting?** Gemini 2.5 Flash. It's cheap, fast, has a 1M token context, and JSON-mode is rock-solid.
- **Privacy critical?** Ollama with `qwen2.5-coder:7b` on a self-hosted runner.
- **Highest quality, cost no object?** Claude 3.5 Sonnet or Gemini 2.5 Pro.
- **Cheapest viable?** DeepSeek Chat or Gemini Flash.
- **Need EU data residency?** Mistral on AWS Frankfurt or Azure OpenAI in `westeurope`.

## Adding a new provider

If we don't ship support for your favourite provider yet, please [open an issue](https://github.com/ecodrix/erix_buddy/issues/new?template=feature_request.yml). Most providers are an OpenAI-compatible chat-completions endpoint — they take ~30 minutes to add.
