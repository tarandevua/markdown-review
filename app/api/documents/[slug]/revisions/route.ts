import { NextResponse } from "next/server";
import { createRevision, getDocumentBySlug } from "@/lib/store/fileStore";
import { applyValuesToMarkdown } from "@/lib/markdown/serialize";
import type { RevisionValues } from "@/lib/markdown/types";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDocumentBySlug(slug);
  if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  const body = await request.json();
  const values = (body.values || {}) as RevisionValues;
  const renderedMarkdown = applyValuesToMarkdown(doc.sourceMarkdown, values);
  const revision = await createRevision(doc.id, values, renderedMarkdown);
  return NextResponse.json({ id: revision.id, version: revision.version });
}
