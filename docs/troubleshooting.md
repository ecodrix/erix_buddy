# Troubleshooting

## "No reviewable files changed"

The reviewer found nothing in the diff. Common causes:

- You ran in PR mode with no working-tree changes. Try `--staged` or `--full`.
- The base branch (`--branch origin/main`) doesn't exist in the runner. Make sure your action checkout uses `fetch-depth: 0`.
- All changed files match `.erixignore` or `ignorePatterns`.

```bash
# Check what diff git sees
git diff --name-status origin/main..HEAD
```

## "git: command failed"

The action runner needs full git history to diff against the base branch:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0 # ← must be 0, not 1
```

## "GitHub PATCH failed (403)"

The action couldn't post the sticky comment. Likely missing permissions:

```yaml
permissions:
  contents: read
  pull-requests: write # ← required to post / patch comments
```

## "Schema validation failed"

The LLM returned malformed JSON. Common with smaller / quantised models. Mitigations:

- Lower `--concurrency` to reduce rate-limit timeouts.
- Increase retries (config `retries: 3`).
- Use a model that natively supports JSON mode (`gemini-2.5-flash`, `gpt-4o-mini`, `groq/llama-3.3-70b-versatile`).
- Anthropic Claude has no native JSON mode — we coax with prompting; use `claude-3-5-sonnet-latest` for best parse rate.

## "API rate limit exceeded"

You're hammering the provider faster than your tier allows. Mitigations:

- Lower `--concurrency` (default 3, try 2 or 1).
- Switch to a higher-tier key (OpenAI Tier 4, Anthropic Build, Gemini Pay-as-you-go).
- Use Groq — same OpenAI-compatible schema, much higher throughput.

## "OOM" or "Cannot allocate memory" during audit

Audit mode loads file content into memory. For very large repos:

- Use `--max-files 200` to cap the run.
- Filter with `--path "src/api"` to scope.
- Lower `--concurrency` to 2.
- Increase the runner's memory budget (`runs-on: ubuntu-latest-4-cores`).

## "Sticky PR comment not updating"

The reporter looks for an HTML comment marker in existing comments to update. If the comment was edited and the marker stripped, a new comment is posted. To force a fresh start:

1. Delete the existing Erix comment from the PR.
2. Trigger a re-run (push a commit, or close-and-reopen the PR).

## Vertex AI: "Could not find application default credentials"

```yaml
- uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_CREDENTIALS }}

- uses: ecodrix/erix_buddy@v1
  with:
    provider: vertex
    vertex-project: ${{ secrets.GOOGLE_CLOUD_PROJECT }}
    vertex-location: us-central1
```

## Ollama: "fetch failed" or "ECONNREFUSED"

The runner can't reach the Ollama daemon. Check:

- Is Ollama running? `ollama list`
- Is the URL reachable? `curl http://localhost:11434/api/tags`
- For self-hosted runners, is Ollama bound to `0.0.0.0` (not just `127.0.0.1`)? Set `OLLAMA_HOST=0.0.0.0:11434` when starting Ollama.

## Action takes too long / times out

```yaml
jobs:
  review:
    timeout-minutes: 15 # ← default is 360, bump or lower as needed
```

Token-budget management:

- Audit mode is much heavier than PR mode. Use `--max-files`.
- Smaller models (Gemini Flash, GPT-4o-mini) are 2-5× faster than their pro counterparts at acceptable quality for review.

## "Unknown flag: --foo"

The CLI doesn't recognise the flag. Run `npx @ecodrix/erix-buddy --help` to see available flags. If you saw a flag in old docs, check the [CHANGELOG](../CHANGELOG.md) — flags occasionally get renamed.

## "Reviewer raised a clearly wrong issue"

LLMs hallucinate. Mitigations:

- Use the **learnings file** — drop a `.erix-reviewer/learnings.md` with project-specific rules (e.g. "We intentionally don't use semicolons; do not flag missing semicolons.").
- Use `customInstructions` in `.codereview.json` for shorter notes.
- Switch to a stronger model — Claude 3.5 Sonnet and GPT-4o have lower hallucination rates than their mini counterparts.

## Still stuck?

- Search [existing issues](https://github.com/ecodrix/erix_buddy/issues).
- Open a [bug report](https://github.com/ecodrix/erix_buddy/issues/new?template=bug_report.yml) with provider, model, action version, and a redacted log.
- Ask in [Discussions](https://github.com/ecodrix/erix_buddy/discussions).
