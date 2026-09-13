# Architecture Decision Log

Record durable decisions here. Do not use this for temporary implementation notes.

## ADR-001 — Markdown remains source of truth
**Status:** Accepted

The original Markdown is stored unchanged. Reviewer values and generated completed Markdown are stored separately.

Why:
- preserves provenance
- supports revision history
- makes export deterministic
- prevents accidental template destruction

## ADR-002 — Render fields through Markdown AST, not raw HTML
**Status:** Accepted

Use remark/mdast transformation and React components. Do not inject arbitrary HTML into Markdown.

Why:
- safer input boundary
- works with `react-markdown`
- custom controls can work inside GFM tables

## ADR-003 — Local file persistence is MVP-only
**Status:** Superseded by ADR-007

JSON files allow zero-config local testing. Production moves to a repository abstraction backed by Supabase/Postgres.

## ADR-004 — Decision groups are semantic single fields
**Status:** Accepted

Mutually exclusive sequences such as TRUE/FALSE/CORRECTED render as radio choices, despite being written with Markdown checkbox syntax.

## ADR-005 — Introduce explicit field syntax
**Status:** Planned

Heuristic placeholders are convenient for existing documents but insufficient for robust template authoring. New advanced behavior should use documented `{{type:id|...}}` syntax.

## ADR-006 — Drafts and revisions are different concepts
**Status:** Accepted for next persistence iteration

Autosave updates a draft. User submission/save-as-revision creates an immutable revision. Autosave must not create hundreds of revisions.

## ADR-007 — Supabase/Postgres is the production persistence adapter
**Status:** Accepted

Hosted deployments use Supabase/Postgres through the server-side repository. Local development may continue to use JSON files when Supabase is not configured. Vercel must fail closed if database credentials are absent rather than attempting local persistence.

The database enforces immutable source Markdown and append-only revisions. Revision numbers are allocated by a transaction-scoped database function to prevent concurrent submissions from receiving the same version.

Why:
- Vercel's deployment filesystem is read-only and ephemeral
- relational constraints match documents and ordered revisions
- database enforcement protects core invariants independently of application code
- the repository boundary preserves the option to replace the storage provider later

Consequences:
- deployments require the Supabase schema migration and server-only environment variables
- privileged Supabase keys must never be sent to client components or public responses

## ADR template
When adding a durable decision, use:

```md
## ADR-XXX — Title
**Status:** Proposed | Accepted | Superseded

Decision.

Why:
- reason

Consequences:
- consequence
```
