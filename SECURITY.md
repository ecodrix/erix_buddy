# Security Policy

## Reporting a Vulnerability

If you believe you've found a security vulnerability in Erix Buddy, please report it privately. **Do not file a public GitHub issue.**

Email: <security@ecodrix.com>

Please include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce, ideally with a proof-of-concept.
- Affected versions of the action / npm package.
- Any suggested mitigations.

We commit to:

- Acknowledging your report within **3 business days**.
- Providing an initial assessment within **7 business days**.
- Keeping you informed of progress until resolution.
- Crediting you in the release notes (with your permission).

## Supported Versions

We provide security fixes for the latest major version (`v1.x`).

## Scope

In scope:

- The action runtime (`dist/action.js` published with the npm package).
- The CLI surface that processes user-controlled inputs (file paths, configs, diffs).
- Any code path that handles credentials.

Out of scope:

- Vulnerabilities in upstream LLM providers (please report to them directly).
- Vulnerabilities in dependencies that have already been disclosed and patched upstream.
- Issues that require a malicious workspace owner with write access to the repo (e.g. an attacker that already controls `.codereview.json` is outside the threat model).

## Threat model summary

- API keys are held only in environment variables / repo secrets / `~/.config/erix-reviewer.json` (mode `0600`). They are never logged, never sent anywhere except the chosen provider endpoint.
- LLM-generated patches must always be reviewed before applying. `--auto-fix` only applies patches that pass `git apply --check` and have confidence ≥ 0.8 by default.
- Untrusted PR content is treated as data, not instructions. We do not support prompt-injection-as-feature.

## Hall of fame

If you've reported a vulnerability and we've shipped a fix, you'll appear here (with permission). Empty for now — be the first.
