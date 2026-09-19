# Stretch Ceiling Calculator Pages mirror

This repository temporarily hosts the public GitHub Pages mirror at `/ceiling/`.

Canonical development source: `remb82-lab/Stretch-Ceiling-Calculator`.
Public mirror source used by the Pages workflow: `remb82-lab/remb82-lab/pages/stretch-ceiling/`.

Current public paths:
- `/ceiling/` — full landing calculator.
- `/ceiling/miniapp.html` — Telegram Mini App entry point.

The mirror includes the LumFer local browser price snapshot: 246 products, 377 price records, 23 categories.

The legacy MVP service worker is intentionally retired so previously cached old screens are removed.

Document stage: saved estimates now keep an immutable price snapshot and can generate three printable views: client estimate, installer sheet, and internal calculation.
