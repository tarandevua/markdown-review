"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkInteractiveFields from "@/lib/markdown/remarkInteractiveFields";
import InteractiveField from "./InteractiveField";
import type { FieldValue, RevisionValues } from "@/lib/markdown/types";

type FieldContextValue = {
  values: RevisionValues;
  onChange: (id: string, value: FieldValue) => void;
};

const FieldContext = createContext<FieldContextValue | null>(null);

const MarkdownAnchor: NonNullable<Components["a"]> = ({ href, children, ...props }) => {
  const fields = useContext(FieldContext);

  if (href?.startsWith("field://interactive?")) {
    if (!fields) return null;
    return <InteractiveField href={href} values={fields.values} onChange={fields.onChange} />;
  }

  return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
};

const markdownComponents: Components = {
  a: MarkdownAnchor,
};

export default function MarkdownForm({ slug, markdown, initialValues = {} }: { slug: string; markdown: string; initialValues?: RevisionValues }) {
  const [values, setValues] = useState<RevisionValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const answered = useMemo(() => Object.values(values).filter((v) => {
    if (v.type === "text") return Boolean(v.value.trim());
    if (v.type === "checkbox") return v.checked;
    return Boolean(v.selected);
  }).length, [values]);

  const update = useCallback((id: string, value: FieldValue) => {
    setValues((old) => ({ ...old, [id]: value }));
    setMessage("");
  }, []);

  const fieldContext = useMemo(() => ({ values, onChange: update }), [values, update]);

  async function saveRevision() {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/documents/${slug}/revisions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ values }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMessage(data.error || "Could not save revision");
    setMessage(`Saved revision ${data.version}.`);
  }

  return (
    <>
      <div className="review-toolbar">
        <div className="progress-summary">
          <span className="progress-icon" aria-hidden="true">{answered}</span>
          <span><strong>Review in progress</strong>{answered} {answered === 1 ? "field" : "fields"} answered</span>
        </div>
        <div className="toolbar-actions">
          <button onClick={saveRevision} disabled={saving}>{saving ? "Saving…" : "Save revision"}</button>
          <a className="button secondary" href={`/api/documents/${slug}/download`}>Download completed .md</a>
        </div>
      </div>
      {message ? <div className={`notice${message.startsWith("Saved") ? "" : " error"}`} role="status">{message}</div> : null}
      <article className="markdown-body">
        <FieldContext.Provider value={fieldContext}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkInteractiveFields]}
            urlTransform={(url) => url.startsWith("field://interactive?") ? url : url}
            components={markdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        </FieldContext.Provider>
      </article>
    </>
  );
}
