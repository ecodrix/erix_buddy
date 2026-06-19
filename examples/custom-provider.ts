/**
 * Example — register a custom LLM provider with `@ecodrix/erix-buddy`.
 *
 * Use this when:
 *   - Your team runs an internal LLM behind a private endpoint.
 *   - You're prototyping a new provider before contributing it upstream.
 *   - You need a provider with bespoke auth (mTLS, signed requests, etc.).
 *
 * Run:
 *   pnpm add @ecodrix/erix-buddy
 *   tsx custom-provider.ts
 *
 * Or compile to JS and ship as part of your tooling.
 */

import { Reviewer, type LLMProvider } from "@ecodrix/erix-buddy";

// ─── 1. Implement the LLMProvider contract ─────────────────────────────────

const internalProvider: LLMProvider = {
  id: "internal",
  displayName: "Internal LLM",
  defaultModel: "internal-v2",
  envHints: ["INTERNAL_LLM_URL", "INTERNAL_LLM_TOKEN"],
  isLocal: false,
  supportsJsonMode: true,
  suggestedModels: [
    {
      id: "internal-v2",
      name: "Internal v2 (recommended)",
      recommended: true,
      contextWindow: 128_000,
    },
    { id: "internal-fast", name: "Internal Fast", contextWindow: 32_000 },
  ],
  async generate(opts) {
    const url = process.env.INTERNAL_LLM_URL ?? "";
    const token = process.env.INTERNAL_LLM_TOKEN ?? "";
    if (!url) throw new Error("INTERNAL_LLM_URL not set");

    // Adjust the request body to match your internal API. This example assumes
    // an OpenAI-compatible /v1/chat/completions shape; adapt as needed.
    const res = await fetch(`${url.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Add custom headers your gateway expects:
        // "X-Tenant-Id": process.env.INTERNAL_TENANT_ID ?? "",
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [{ role: "user", content: opts.prompt }],
        temperature: opts.temperature ?? 0.1,
        max_tokens: opts.maxTokens ?? 8192,
        ...(opts.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: opts.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Internal LLM error (${res.status}): ${text.slice(0, 500)}`,
      );
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? "";
  },
};

// ─── 2. Pass the instance into Reviewer (no registry required) ─────────────

async function main() {
  const reviewer = new Reviewer({
    provider: internalProvider,
    config: {
      model: "internal-v2",
      severityThreshold: "major",
      customInstructions:
        "Multi-tenant SaaS — every database query must include tenantId.",
    },
  });

  // Review the staged diff against the working tree.
  await reviewer.review({ mode: "staged" });

  // Or for a full audit:
  // await reviewer.review({ mode: "full", maxFiles: 200, paths: ["src/api"] });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
