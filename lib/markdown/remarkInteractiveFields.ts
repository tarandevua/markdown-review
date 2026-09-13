import type { Break, Html, Root, Parent, PhrasingContent, Text, InlineCode, Link } from "mdast";

const choicePattern = /(?:\[ \]\s*[^\[]+){2,}/;

function encodeField(id: string, type: string, extra: Record<string, string> = {}): Link {
  const qs = new URLSearchParams({ id, type, ...extra }).toString();
  return { type: "link", url: `field://interactive?${qs}`, children: [{ type: "text", value: id }] };
}

function parseHtmlBreak(node: Html): Break | null {
  if (!/^<br\s*\/?>$/i.test(node.value)) return null;
  return node.position ? { type: "break", position: node.position } : { type: "break" };
}

function parseChoiceGroup(value: string, id: string): PhrasingContent[] | null {
  if (!choicePattern.test(value)) return null;
  const options = [...value.matchAll(/\[ \]\s*([^\[]+?)(?=(?:\s*\[ \])|$)/g)]
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (options.length < 2) return null;

  let correction = "";
  const normalized = options.map((opt) => {
    const parts = opt.split(/_{5,}/);
    if (parts.length > 1) {
      correction = parts[0].replace(/[:\s]+$/, "").trim();
      return correction;
    }
    return opt.replace(/[:\s]+$/, "").trim();
  });

  return [encodeField(id, "choice", { options: normalized.join("|"), correctionLabel: correction })];
}

function extractRowId(node: Parent): string | null {
  const first = node.children?.[0] as Parent | undefined;
  if (!first || !Array.isArray(first.children)) return null;
  const text = first.children
    .map((c: any) => c.value ?? c.children?.map((x: any) => x.value ?? "").join("") ?? "")
    .join("")
    .replace(/`/g, "")
    .trim();
  return /^[A-Z]{2,4}-[A-Z0-9]+$/i.test(text) ? text : null;
}

export default function remarkInteractiveFields() {
  return (tree: Root) => {
    let globalFieldIndex = 0;
    let globalChoiceIndex = 0;
    const rowCounters = new Map<string, number>();

    function nextSimpleId(rowId: string | null) {
      if (!rowId) return `field-${++globalFieldIndex}`;
      const n = (rowCounters.get(rowId) ?? 0) + 1;
      rowCounters.set(rowId, n);
      return `${rowId}-${n}`;
    }

    function splitSimpleFields(value: string, rowId: string | null): PhrasingContent[] {
      const tokens: PhrasingContent[] = [];
      const matches = [...value.matchAll(/\[ \]|_{5,}/g)];
      if (!matches.length) return [{ type: "text", value } as Text];
      let cursor = 0;
      for (const match of matches) {
        const index = match.index ?? 0;
        if (index > cursor) tokens.push({ type: "text", value: value.slice(cursor, index) } as Text);
        const raw = match[0];
        tokens.push(encodeField(nextSimpleId(rowId), raw.startsWith("[") ? "checkbox" : "text"));
        cursor = index + raw.length;
      }
      if (cursor < value.length) tokens.push({ type: "text", value: value.slice(cursor) } as Text);
      return tokens;
    }

    function walk(parent: Parent, rowId: string | null = null) {
      const currentRowId = parent.type === "tableRow" ? extractRowId(parent) ?? rowId : rowId;
      const nextChildren: any[] = [];

      for (const child of parent.children as any[]) {
        if (child?.type === "html") {
          nextChildren.push(parseHtmlBreak(child as Html) ?? child);
          continue;
        }
        if (child && Array.isArray(child.children)) {
          walk(child as Parent, currentRowId);
          nextChildren.push(child);
          continue;
        }
        if (child?.type !== "text" && child?.type !== "inlineCode") {
          nextChildren.push(child);
          continue;
        }

        const node = child as Text | InlineCode;
        const value = node.value;
        if (!/\[ \]|_{5,}/.test(value)) {
          nextChildren.push(child);
          continue;
        }

        const choiceId = currentRowId ?? `choice-${++globalChoiceIndex}`;
        const choice = parseChoiceGroup(value, choiceId);
        if (choice) nextChildren.push(...choice);
        else nextChildren.push(...splitSimpleFields(value, currentRowId));
      }
      parent.children = nextChildren as any;
    }

    walk(tree as unknown as Parent, null);
  };
}
