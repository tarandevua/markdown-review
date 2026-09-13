# Security Notes

## Threat model
Inputs are untrusted:
- uploaded/pasted Markdown
- reviewer field values
- document titles / filenames
- share tokens received through URLs

## Rules
1. Do not enable arbitrary raw HTML rendering without a sanitizer and explicit need.
2. Do not execute scripts embedded in Markdown.
3. Restrict/sanitize custom URL protocols. `field://` is an internal marker only; normal outgoing links still need safe handling.
4. Escape/safely render reviewer values on preview/export surfaces.
5. Sanitize download filenames.
6. Generate share tokens with cryptographically secure randomness.
7. Avoid sequential public document IDs.
8. Rate-limit public save/load endpoints in production.
9. Add payload/file-size limits.
10. Do not expose server filesystem paths in responses.
11. Production persistence must use the Supabase repository; JSON/file storage is local-development-only.
12. Secrets belong in environment variables; never commit them. `SUPABASE_SECRET_KEY` (or the legacy service-role key) is server-only and must never use a `NEXT_PUBLIC_` prefix.
13. Keep Row Level Security enabled even when server routes use a privileged key, and expose no public table policies unless the access model explicitly changes.

## Share URLs
An unguessable URL is a bearer secret. Anyone with the URL can access what it grants. Production should support:
- revoke
- expiry
- optional password
- least-privilege access (review vs admin)

## Markdown downloads
User-entered values may contain Markdown syntax. Decide explicitly whether serialization should:
- preserve raw Markdown entered by reviewer, or
- escape it as plain text.

Default safer reviewer behavior should be plain text unless rich Markdown answers are intentionally supported.

## Privacy
Documents can contain private business/legal/medical review information. Production deployments should document retention and access controls and avoid putting sensitive content in logs.
