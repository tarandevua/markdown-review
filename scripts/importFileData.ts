import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { RevisionValues } from "../lib/markdown/types";
import type { DocumentRecord, RevisionRecord } from "../lib/store/types";

const dataDirectory = path.join(process.cwd(), "data");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error(`Expected ${key} to be a string`);
  return value;
}

function parseDocument(value: unknown): DocumentRecord {
  if (!isRecord(value)) throw new Error("Expected each document to be an object");
  return {
    id: requireString(value, "id"),
    slug: requireString(value, "slug"),
    title: requireString(value, "title"),
    sourceMarkdown: requireString(value, "sourceMarkdown"),
    createdAt: requireString(value, "createdAt"),
  };
}

function parseRevision(value: unknown): RevisionRecord {
  if (!isRecord(value)) throw new Error("Expected each revision to be an object");
  const version = value.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new Error("Expected revision version to be a positive integer");
  }
  if (!isRecord(value.values)) throw new Error("Expected revision values to be an object");

  return {
    id: requireString(value, "id"),
    documentId: requireString(value, "documentId"),
    version,
    values: value.values as RevisionValues,
    renderedMarkdown: requireString(value, "renderedMarkdown"),
    createdAt: requireString(value, "createdAt"),
  };
}

async function readArray<T>(filename: string, parse: (value: unknown) => T): Promise<T[]> {
  const contents = await fs.readFile(path.join(dataDirectory, filename), "utf8");
  const value: unknown = JSON.parse(contents);
  if (!Array.isArray(value)) throw new Error(`${filename} must contain a JSON array`);
  return value.map(parse);
}

async function main() {
  const documents = await readArray("documents.json", parseDocument);
  const revisions = await readArray("revisions.json", parseRevision);

  if (process.argv.includes("--dry-run")) {
    console.log(`Validated ${documents.length} document(s) and ${revisions.length} revision(s).`);
    return;
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY before importing data");
  }

  const client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  if (documents.length) {
    const { error } = await client.from("documents").upsert(
      documents.map((document) => ({
        id: document.id,
        slug: document.slug,
        title: document.title,
        source_markdown: document.sourceMarkdown,
        created_at: document.createdAt,
      })),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw new Error(`Could not import documents: ${error.message}`);
  }

  if (revisions.length) {
    const { error } = await client.from("revisions").upsert(
      revisions.map((revision) => ({
        id: revision.id,
        document_id: revision.documentId,
        version: revision.version,
        values: revision.values,
        rendered_markdown: revision.renderedMarkdown,
        created_at: revision.createdAt,
      })),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw new Error(`Could not import revisions: ${error.message}`);
  }

  console.log(`Imported ${documents.length} document(s) and ${revisions.length} revision(s).`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown import failure";
  console.error(message);
  process.exitCode = 1;
});
