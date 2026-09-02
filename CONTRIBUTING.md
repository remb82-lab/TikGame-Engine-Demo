# Contributing to TikGame Engine Demo

Thanks for your interest in the project.

TikGame Engine Demo is intentionally a **small public showcase** built around:

```text
EVENT → ENGINE → GAME
```

## Scope

Good contributions improve the public demo without turning it into the private production platform.

In scope:

- event-model clarity and type safety;
- Battle Arena polish;
- simulator scenarios;
- accessibility and responsive UX;
- performance and test coverage;
- documentation and developer experience.

Out of scope for this public repository:

- real TikTok/LIVE credentials or unofficial connectors;
- production LIVE bridge code;
- Visual Logic Compiler;
- Economy systems;
- SDK packaging;
- private Factory infrastructure;
- code copied from private production repositories.

## Development

Requirements: Node.js 20+.

```bash
npm install
npm run security
npm run typecheck
npm test
npm run build
```

Please keep pull requests focused and explain the user-visible or architectural benefit.

## Security

Never commit secrets, credentials, tokens, private endpoints or user data. See [SECURITY.md](./SECURITY.md) for reporting security-sensitive issues.
