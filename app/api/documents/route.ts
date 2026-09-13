import { NextResponse } from "next/server";
import { createDocument } from "@/lib/store/fileStore";

export async function POST(request: Request) {
  const { title, markdown } = await request.json();
  if (!markdown || typeof markdown !== "string") return NextResponse.json({ error: "Markdown is required" }, { status: 400 });
  const doc = await createDocument(title || "Untitled document", markdown);
  return NextResponse.json({ slug: doc.slug, id: doc.id });
}
