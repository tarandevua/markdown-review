import type { RevisionValues } from "./types";

export function applyValuesToMarkdown(source: string, values: RevisionValues) {
  const rowCounters: Record<string, number> = {};
  let globalField = 0;
  let globalChoice = 0;

  return source.split("\n").map((line) => {
    const rowMatch = line.match(/^\|\s*`?([A-Z]{2,4}-[A-Z0-9]+)`?\s*\|/i);
    const rowId = rowMatch?.[1] ?? null;

    const groupPattern = /(?:\[ \]\s*[^\[]+){2,}/;
    const group = line.match(groupPattern);
    if (group) {
      const id = rowId ?? `choice-${++globalChoice}`;
      const v = values[id];
      if (v?.type === "choice") {
        line = line.replace(group[0], (raw) => raw.replace(/\[ \]\s*([^\[]+?)(?=(?:\s*\[ \])|$)/g, (_full, label) => {
          const rawLabel = String(label).trim();
          const clean = rawLabel.split(/_{5,}/)[0].replace(/[:\s]+$/, "").trim();
          const mark = clean === v.selected ? "[x]" : "[ ]";
          if (clean === v.selected && v.correction && /_{5,}/.test(rawLabel)) return `${mark} ${clean}: ${v.correction}`;
          return `${mark} ${rawLabel}`;
        }));
      }
      return line;
    }

    return line.replace(/\[ \]|_{5,}/g, (token) => {
      let id: string;
      if (rowId) {
        rowCounters[rowId] = (rowCounters[rowId] ?? 0) + 1;
        id = `${rowId}-${rowCounters[rowId]}`;
      } else {
        id = `field-${++globalField}`;
      }
      const v = values[id];
      if (!v) return token;
      if (v.type === "checkbox") return v.checked ? "[x]" : "[ ]";
      if (v.type === "text") return v.value || token;
      return token;
    });
  }).join("\n");
}
