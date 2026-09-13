export type FieldValue =
  | { type: "text"; value: string }
  | { type: "checkbox"; checked: boolean }
  | { type: "choice"; selected: string; correction?: string };

export type RevisionValues = Record<string, FieldValue>;
