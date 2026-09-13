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
      <div className="eyebrow">Markdown → interactive review</div>
      <h1>Create a review document</h1>
      <p>Paste Markdown or upload a .md file. Blank underscores and unchecked boxes become editable controls automatically.</p>
      <label>Title<input className="wide-input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>Markdown<textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} rows={24} /></label>
      <div className="create-actions">
        <label className="button secondary upload">Upload .md<input type="file" accept=".md,text/markdown,text/plain" onChange={(e) => onFile(e.target.files?.[0])} /></label>
        <button onClick={create} disabled={loading}>{loading ? "Creating…" : "Create shareable review"}</button>
      </div>
    </section>
  );
}
