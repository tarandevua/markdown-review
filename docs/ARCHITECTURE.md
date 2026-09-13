# Architecture

## High-level flow

```text
Markdown source
  -> Markdown parser / remark plugins
  -> mdast with interactive field markers
  -> react-markdown renderer
  -> React form controls
  -> structured values
  -> draft/revision persistence
  -> deterministic Markdown serializer/export
```

## Boundaries

### Parsing (`lib/markdown`)
Responsibilities:
- recognize supported editable syntax
- associate fields with stable IDs
- preserve all non-field Markdown
- output renderable field markers / descriptors

Must not:
- read/write database state
- depend on React UI state
- mutate persisted source Markdown

### Rendering (`components`)
Responsibilities:
- render normal Markdown safely
- render field markers as controlled React inputs
- collect values keyed by field ID
- show validation/progress state

Must not:
- invent field IDs
- parse source Markdown independently
- directly access storage

### Serialization (`lib/markdown/serialize.ts`)
Responsibilities:
- merge stored values into the correct editable locations
- preserve original Markdown structure as closely as possible
- produce deterministic completed Markdown

Serialization must use the same field identity contract as parsing.

### Persistence (`lib/store`)
Current MVP: local JSON files.

Target interface:

```ts
interface DocumentRepository {
  createDocument(input: CreateDocumentInput): Promise<Document>;
  getDocumentBySlug(slug: string): Promise<Document | null>;
}

interface RevisionRepository {
  getLatestDraft(documentId: string, actorKey?: string): Promise<Draft | null>;
  saveDraft(input: SaveDraftInput): Promise<Draft>;
  createRevision(input: CreateRevisionInput): Promise<Revision>;
  listRevisions(documentId: string): Promise<Revision[]>;
}
```

Production adapter: Supabase/Postgres.

### API routes (`app/api`)
Responsibilities:
- validate request payloads
- authorize admin actions when auth exists
- enforce share-token/document access constraints
- call repository/service functions
- return stable API shapes

Do not place Markdown parsing business logic directly in route handlers.

## Field identity strategy
Priority order:
1. explicit field ID in `{{...}}` syntax
2. recognized row/document semantic ID such as `BR-01`
3. deterministic derived ID based on structural location + normalized nearby content

Avoid global sequential IDs as the long-term identity strategy because inserting a new field earlier in a document can shift every later ID.

## Security model
Markdown and reviewer input are untrusted.
- no raw HTML execution by default
- no arbitrary scriptable URLs
- no unsafe hydration from user HTML
- generated download filenames are sanitized
- share tokens are high-entropy and unguessable
- production endpoints require rate limits

See `SECURITY.md`.

## Production storage recommendation
Tables:
- `documents`
- `document_shares` or share fields on documents for MVP
- `drafts`
- `revisions`

The source Markdown belongs on `documents` and is immutable after document creation except through an explicit template-edit workflow that creates a new template/document version.

## Future template versioning
Do not silently change a document template that already has revisions. If source/template editing is introduced, model it explicitly:

```text
Template
  -> TemplateVersion 1
      -> Document / review instance(s)
  -> TemplateVersion 2
      -> new instances
```
