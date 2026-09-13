"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const demo = `# Client Review\n\nPlease confirm the following.\n\n| ID | Statement | Decision |\n|---|---|---|\n| \`BR-01\` | Primary public brand is **Example Inc.** | \`[ ] TRUE [ ] FALSE [ ] CORRECTED: __________\` |\n| \`BR-02\` | Website is https://example.com | \`[ ] TRUE [ ] FALSE [ ] CORRECTED: __________\` |\n\nOwner name: ____________________\n\n[ ] I approve this review.`;

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("Client Review");
  const [markdown, setMarkdown] = useState(demo);
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    const res = await fetch("/api/documents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, markdown }) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push(`/review/${data.slug}`);
  }

  async function onFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    setMarkdown(text);
    if (!title || title === "Client Review") setTitle(file.name.replace(/\.md$/i, ""));
  }

  return (
    <section className="creator">
      <div className="creator-intro">
        <div className="eyebrow">Markdown, made interactive</div>
        <h1>Turn a document into a clear review.</h1>
        <p className="lead">Create a focused, shareable workspace from the Markdown you already use.</p>
        <ul className="feature-list">
          <li><span className="feature-check">✓</span><span>Editable fields appear automatically</span></li>
          <li><span className="feature-check">✓</span><span>Original Markdown stays untouched</span></li>
          <li><span className="feature-check">✓</span><span>Every saved revision is preserved</span></li>
        </ul>
      </div>
      <div className="creator-form">
        <div className="eyebrow">New review</div>
        <h2>Prepare your document</h2>
        <p className="muted">Paste Markdown below or start from a local <code>.md</code> file.</p>
        <label className="field-label" htmlFor="document-title">
          <span>Document title</span><span className="field-hint">Shown to reviewers</span>
        </label>
        <input id="document-title" className="wide-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="field-label" htmlFor="document-markdown">
          <span>Markdown content</span><span className="field-hint">Underscores and checkboxes become fields</span>
        </label>
        <textarea id="document-markdown" value={markdown} onChange={(e) => setMarkdown(e.target.value)} rows={24} spellCheck={false} />
        <div className="create-actions">
          <label className="button secondary upload">Upload .md<input type="file" accept=".md,text/markdown,text/plain" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <button onClick={create} disabled={loading}>{loading ? "Creating review…" : "Create shareable review"}</button>
        </div>
      </div>
    </section>
  );
}
