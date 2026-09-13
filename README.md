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

Production uses Supabase/Postgres. Local development falls back to these zero-configuration files when Supabase environment variables are absent:

- `data/documents.json`
- `data/revisions.json`

Vercel never uses the file fallback because its deployment filesystem is read-only.

### Configure Supabase and Vercel

1. Create or connect a Supabase project.
2. Run `supabase/migrations/20260913090000_create_markdown_review_tables.sql` in the Supabase SQL Editor (or apply it with the Supabase CLI).
3. Add these server-side environment variables to every relevant Vercel environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your-server-only-key
```

Use the legacy `SUPABASE_SERVICE_ROLE_KEY` only if the project does not yet provide a secret key. Never prefix a privileged key with `NEXT_PUBLIC_` or expose it to client code. Redeploy after adding the variables.

The SQL migration enables Row Level Security without public policies, preserves source Markdown through a trigger, prevents revision updates/deletes, and allocates revision numbers atomically.

### Import existing local data

If `data/documents.json` or `data/revisions.json` contains data you want to retain, validate and import it after applying the SQL migration:

```bash
npm run storage:import-json -- --dry-run
npm run storage:import-json
```

The importer reads the same Supabase variables from its shell environment, preserves IDs and timestamps, and ignores records already present by ID so it can be rerun safely. It never modifies the source JSON files. If the credentials are only in `.env.local`, run the importer with `npx tsx --env-file=.env.local scripts/importFileData.ts`.

## Sample
`samples/owner-confirmation-packet.md` is a real-world regression/sample document.
