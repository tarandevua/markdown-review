# Field Syntax Contract

This file defines how editable fields are recognized and how they serialize.

## 1. Legacy blank
Source:

```md
Legal entity: ____________________
```

Render: text input.

Completed Markdown example:

```md
Legal entity: Breathe Love Academy
```

A run of five or more underscores is considered an editable blank.

## 2. Standalone checkbox
Source:

```md
[ ] Approved
```

Render: checkbox.

Completed Markdown:

```md
[x] Approved
```

## 3. Decision group
Source:

```md
[ ] TRUE [ ] FALSE [ ] CORRECTED: __________
```

Render as one mutually exclusive choice field with options `TRUE`, `FALSE`, `CORRECTED`. `CORRECTED` has an associated text value.

Completed examples:

```md
[x] TRUE [ ] FALSE [ ] CORRECTED: __________
```

```md
[ ] TRUE [ ] FALSE [x] CORRECTED: Correct replacement text
```

### Important
A decision group is not multiple independent checkbox fields.

## 4. Explicit syntax — planned/preferred
Explicit syntax should be used for new advanced templates.

### Text
```md
{{text:legal_entity}}
```

### Text with label/placeholder (proposed)
```md
{{text:legal_entity|Legal entity}}
```

### Textarea
```md
{{textarea:notes}}
```

### Checkbox
```md
{{checkbox:approved|Approved}}
```

### Radio
```md
{{radio:BR-01|TRUE|FALSE|CORRECTED}}
```

### Date
```md
{{date:review_date}}
```

## Field ID requirements
- unique within a document template
- stable across renders
- URL/JSON-safe
- IDs derived from semantic row IDs should preserve those IDs where possible

## Ambiguity rules
- If a pattern cannot be safely recognized, leave the text unchanged.
- Do not convert checked source `[x]` into a new field until checked-state parsing is explicitly supported.
- Do not treat underscore text inside code fences as fields.
- Inline code handling must be explicit and tested before enabling conversion there.
- Escaped Markdown should remain escaped.

## Required fixtures
Parser behavior should be tested against:
- paragraphs
- list items
- blockquotes
- table cells
- multiple blanks on one line
- multiple standalone checkboxes
- one grouped decision field
- row IDs
- code fences containing placeholder-like text
- URLs containing underscores
- existing `[x]` content
