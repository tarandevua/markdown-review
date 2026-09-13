# Roadmap and Work Queue

Keep this file current. Move completed tasks to the bottom with a short completion note rather than deleting important history.

## P0 — Make MVP trustworthy

### P0.1 Establish automated parser tests
Acceptance criteria:
- test legacy blank
- standalone checkbox
- TRUE/FALSE/CORRECTED group
- table cell behavior
- stable IDs
- source that should *not* be transformed

### P0.2 Fix field identity to be deterministic
Current MVP can fall back to sequential IDs. Replace fallback identity with deterministic structural/content-derived IDs.

Acceptance criteria:
- identical Markdown => identical IDs
- adding an unrelated field later in the document should not renumber earlier stable semantic fields
- duplicate IDs are detected

### P0.3 Separate drafts from revisions
Acceptance criteria:
- autosave/write draft without incrementing revision number
- explicit submit creates immutable revision
- reload restores draft or latest submitted values predictably

### P0.4 Validate production build
Acceptance criteria:
```bash
npm install
npm run typecheck
npm run build
```
all succeed.

## P1 — Production persistence

### P1.1 Repository interfaces
Decouple routes/components from file storage.

### P1.2 Supabase/Postgres adapter
Suggested schema:
- documents
- drafts
- revisions

### P1.3 Share-link controls
- cryptographically strong token
- expiry
- optional password
- disable/revoke

## P1 — Explicit template fields
Implement documented syntax from `FIELD-SYNTAX.md`:
- text
- textarea
- checkbox
- radio
- date

Legacy syntax remains backwards compatible.

## P1 — Export correctness
- completed `.md`
- clean finalized `.md`
- ensure Unicode and multiline answers round-trip
- sanitized filenames

## P2 — Reviewer UX
- progress indicator
- unanswered required fields
- autosave state
- submitted confirmation screen
- mobile table handling
- accessible labels/focus/errors

## P2 — Revision UX
- revision list
- diff between revisions
- restore/duplicate as new draft
- reviewer metadata

## P2 — Admin ownership/auth
Do not expose document administration purely through share URLs.

## P3 — Optional exports/integrations
- HTML
- PDF
- webhook/API
- email notification

Do not implement e-signature claims as part of ordinary approval workflow.

## Completed
- Initial Next.js MVP generated
- legacy blanks/checkboxes/decision patterns recognized
- GFM table rendering supported
- file-backed documents/revisions provided
