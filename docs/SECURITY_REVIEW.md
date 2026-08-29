# Public Release Security Review

## Release policy

This repository is a clean-room public demo. The private production application is not used as a code source and is not modified by this project.

The public demo must remain self-contained and credential-free.

## Automated scan

Run:

```bash
npm run security
```

The scanner checks tracked text sources for common secret/token signatures, production Supabase URLs, private source repository markers and private Factory infrastructure markers.

## Manual checklist

Before a public release, verify all of the following:

- [x] No `.env` is required to run the app.
- [x] No TikTok credentials or LIVE connector credentials are present.
- [x] No Supabase credentials or project URLs are present.
- [x] No OpenAI, Gemini or other AI-provider keys are present.
- [x] No GitHub token or webhook secret is present.
- [x] No private production endpoint is present.
- [x] No private Factory package or infrastructure reference is present.
- [x] No internal document was copied into the repository.
- [x] No production code was copied from a private repository.
- [x] The demo explicitly states that LIVE events are simulated.

## Scope boundary

The v1 public demo intentionally excludes production SDKs, economy systems, a Visual Logic Compiler and any real LIVE bridge.
