import { NextResponse } from "next/server";
import { createDocument } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const { title, markdown }: { title?: unknown; markdown?: unknown } = await request.json();
    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "Markdown is required" }, { status: 400 });
    }
    if (title !== undefined && typeof title !== "string") {
      return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
    }
    const doc = await createDocument(title || "Untitled document", markdown);
    return NextResponse.json({ slug: doc.slug, id: doc.id });
  } catch (error) {
    console.error("Document creation failed", error);
    return NextResponse.json({ error: "Could not create document" }, { status: 500 });
  }
}
