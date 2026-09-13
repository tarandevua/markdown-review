# Testing Strategy

## Priority
Parser/serializer correctness is more important than snapshotting visual markup.

## Test layers

### 1. Parser unit tests — highest priority
Given Markdown source, assert extracted/encoded interactive fields and stable IDs.

Must cover:
- text blanks
- standalone checkbox
- decision group
- corrected value
- table rows with semantic IDs
- more than one field per line
- headings/lists/quotes
- code fences that resemble fields
- Markdown links/URLs with underscores
- Unicode content
- malformed patterns

### 2. Serializer unit tests
Given original Markdown + values, assert exact completed Markdown.

Critical property:
`parse(source) -> values -> serialize(source, values)` must target the same logical fields.

### 3. Integration tests
- create document API
- load review URL
- save draft/revision
- reopen values
- download completed Markdown

### 4. End-to-end tests
Add Playwright when the MVP stabilizes.
Key scenario:
1. create document
2. fill one text field
3. choose TRUE
4. choose CORRECTED and enter replacement on another row
5. submit
6. reopen revision
7. download and inspect Markdown

## Regression fixture
`samples/owner-confirmation-packet.md` is a real-world regression fixture. Do not depend only on this large fixture; maintain small focused unit fixtures too.

## Suggested tooling
- Vitest for TypeScript unit/integration tests
- React Testing Library where component behavior needs testing
- Playwright for browser flows

Do not add all tools at once unless the task includes test-infrastructure setup.
