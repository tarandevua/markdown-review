"use client";

import type { FieldValue, RevisionValues } from "@/lib/markdown/types";

type Props = {
  href?: string;
  values: RevisionValues;
  onChange: (id: string, value: FieldValue) => void;
};

export default function InteractiveField({ href, values, onChange }: Props) {
  if (!href?.startsWith("field://interactive?")) return null;
  const params = new URLSearchParams(href.split("?")[1]);
  const id = params.get("id") || "field";
  const type = params.get("type") || "text";
  const current = values[id];

  if (type === "checkbox") {
    const checked = current?.type === "checkbox" ? current.checked : false;
    return (
      <label className="inline-check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(id, { type: "checkbox", checked: e.target.checked })}
        />
      </label>
    );
  }

  if (type === "choice") {
    const options = (params.get("options") || "").split("|").filter(Boolean);
    const correctionLabel = params.get("correctionLabel") || "";
    const selected = current?.type === "choice" ? current.selected : "";
    const correction = current?.type === "choice" ? current.correction || "" : "";
    return (
      <span className="choice-group" data-field-id={id}>
        {options.map((option) => (
          <label key={option} className="choice-option">
            <input
              type="radio"
              name={id}
              checked={selected === option}
              onChange={() => onChange(id, { type: "choice", selected: option, correction })}
            />
            <span>{option}</span>
          </label>
        ))}
        {correctionLabel && selected === correctionLabel ? (
          <input
            className="inline-input correction-input"
            aria-label={`${id} correction`}
            value={correction}
            placeholder="Enter correction"
            onChange={(e) => onChange(id, { type: "choice", selected, correction: e.target.value })}
          />
        ) : null}
      </span>
    );
  }

  const value = current?.type === "text" ? current.value : "";
  return (
    <input
      className="inline-input"
      aria-label={id}
      value={value}
      placeholder="Enter value"
      onChange={(e) => onChange(id, { type: "text", value: e.target.value })}
    />
  );
}
