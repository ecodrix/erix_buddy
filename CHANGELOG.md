# Changelog

All notable changes to Erix Buddy are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `init` subcommand in the CLI — auto-scaffolds GitHub Actions workflow, `.codereview.json`, `.erixignore`.
- `doctor` subcommand — diagnoses local setup (git, providers, config validity).
- Public-repo restructure: `docs/`, expanded `examples/`, `.github/` community templates.

## [0.2.0] - 2026-06-19

### Added

- Pluggable provider registry with 12 providers: Gemini, Vertex AI, OpenAI, Anthropic, Ollama, OpenRouter, Groq, Azure OpenAI, DeepSeek, Mistral, xAI, ECODrix-hosted.
- Programmatic API via `Reviewer` class.
- GitHub Action `action.yml` with sticky PR comment support.
- Full codebase audit mode with content-hash cache.
- SARIF and GitHub annotations reporters.

## [0.1.0] - 2026-06-17

### Added

- Initial release — Gemini-only PR mode, sticky PR comment, markdown report.
