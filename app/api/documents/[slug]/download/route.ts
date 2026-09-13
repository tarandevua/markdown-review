import { getDocumentBySlug, getRevisions } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) return new Response("Not found", { status: 404 });
  const revisions = await getRevisions(doc.id);
  const markdown = revisions[0]?.renderedMarkdown ?? doc.sourceMarkdown;
  const filename = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "review";
  return new Response(markdown, { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="${filename}.md"` } });
}
