import { notFound } from "next/navigation";
import MarkdownForm from "@/components/MarkdownForm";
import { getDocumentBySlug, getRevisions } from "@/lib/store/fileStore";

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) notFound();
  const revisions = await getRevisions(doc.id);
  const latest = revisions[0];

  return (
    <section className="review-page">
      <header className="review-header">
        <div><div className="eyebrow">Shared review</div><h1>{doc.title}</h1></div>
        <div className="muted">{revisions.length ? `${revisions.length} revision${revisions.length === 1 ? "" : "s"}` : "No revisions yet"}</div>
      </header>
      <MarkdownForm slug={slug} markdown={doc.sourceMarkdown} initialValues={latest?.values ?? {}} />
      {revisions.length ? (
        <aside className="revision-list"><h2>Revision history</h2>{revisions.map((r) => <div key={r.id}>Revision {r.version} · {new Date(r.createdAt).toLocaleString()}</div>)}</aside>
      ) : null}
    </section>
  );
}
