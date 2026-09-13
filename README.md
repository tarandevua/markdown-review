# Markdown Review

Turn Markdown review packets into interactive browser forms while keeping Markdown as the source of truth.

## For coding agents / Codex
Start with [`AGENTS.md`](./AGENTS.md). It defines project invariants, required checks, scope boundaries, and points to the source-of-truth docs under `docs/`.

Important docs:
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/FIELD-SYNTAX.md`
- `docs/ROADMAP.md`
- `docs/TESTING.md`
- `docs/SECURITY.md`

Nested rules exist in correctness-sensitive areas such as `lib/markdown/AGENTS.md` and `app/api/AGENTS.md`.

## Supported MVP syntax
- `__________` → text input
- `[ ]` → checkbox
- `[ ] TRUE [ ] FALSE [ ] CORRECTED: ______` → one radio/decision field with conditional correction input
- GFM Markdown tables
- Row IDs like `BR-01` used as stable decision field IDs where possible

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, paste Markdown or upload a `.md` file, then create the shareable review URL.

## Checks

```bash
npm run typecheck
npm run build
```

## Persistence
MVP files:
- `data/documents.json`
- `data/revisions.json`

This is deliberately zero-config and not the production persistence model. See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for the Supabase/Postgres migration plan.

## Sample
`samples/owner-confirmation-packet.md` is a real-world regression/sample document.
