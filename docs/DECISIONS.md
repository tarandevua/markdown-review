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
**Status:** Accepted

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
