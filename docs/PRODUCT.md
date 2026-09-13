# Product Specification

## Product statement
Markdown Review converts a Markdown document containing explicit review blanks and choices into a shareable interactive review page. A reviewer fills only the designated fields; the rest of the Markdown remains read-only. The application stores revisions and can export a completed Markdown copy.

## Primary user flow
1. Owner pastes or uploads `.md` content.
2. App stores the immutable source Markdown.
3. App parses editable patterns and previews the document.
4. App creates an unguessable review URL.
5. Reviewer opens the URL without needing a Markdown editor.
   The browser title and share-preview metadata identify the current document.
6. Reviewer fills text fields, checkboxes, and decision groups.
7. Reviewer saves progress or submits a revision.
8. App stores structured values and generated Markdown.
9. Owner/reviewer can reopen or download a completed Markdown copy.

## MVP field types
- text blank: `__________`
- checkbox: `[ ]`
- decision group: `[ ] TRUE [ ] FALSE [ ] CORRECTED: ______`
- GFM-table fields
- row identifiers such as `BR-01` used as stable logical IDs when possible

## Near-term explicit syntax
Legacy heuristics remain supported, but advanced templates should evolve toward explicit syntax:

```md
{{text:legal_entity}}
{{date:review_date}}
{{checkbox:approved|Approved}}
{{radio:BR-01|TRUE|FALSE|CORRECTED}}
{{textarea:BR-01-correction}}
```

See `FIELD-SYNTAX.md` for the grammar contract.

## Core objects
### Document
- immutable source Markdown
- title
- public/share slug or token
- created timestamp
- document-level settings

### Draft
- mutable reviewer progress
- associated document/share session
- values keyed by stable field IDs
- updated timestamp

### Revision
- immutable snapshot created on submit/save-as-revision
- revision number
- values JSON
- generated Markdown
- created timestamp
- optional reviewer metadata

## UX principles
- The recipient should feel like they are completing a document, not editing Markdown.
- Preserve document structure and visual hierarchy.
- Treat `<br>` and `<br/>` tags as line breaks when rendering, without enabling other raw HTML.
- Inputs should be visually obvious but not dominate the document.
- Decision options that are mutually exclusive render as radio controls.
- Conditional correction inputs appear only when needed where practical.
- Show progress when the document has many fields.
- Autosave should not create revision spam; drafts and submitted revisions are separate concepts.

## Non-goals for MVP
- WYSIWYG Markdown authoring
- collaborative cursors
- full form-builder UI
- legally compliant electronic signatures
- document OCR
- arbitrary HTML forms embedded by users
