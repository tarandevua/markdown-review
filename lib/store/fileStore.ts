import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { RevisionValues } from "@/lib/markdown/types";
import type { DocumentRecord, RevisionRecord, StoreRepository } from "./types";

const dataDir = path.join(process.cwd(), "data");
const documentsFile = path.join(dataDir, "documents.json");
const revisionsFile = path.join(dataDir, "revisions.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return fallback; }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

async function createDocument(title: string, sourceMarkdown: string) {
  const docs = await readJson<DocumentRecord[]>(documentsFile, []);
  const doc: DocumentRecord = {
    id: crypto.randomUUID(),
    slug: crypto.randomBytes(9).toString("base64url"),
    title: title || "Untitled document",
    sourceMarkdown,
    createdAt: new Date().toISOString(),
  };
  docs.push(doc);
  await writeJson(documentsFile, docs);
  return doc;
}

async function getDocumentBySlug(slug: string) {
  const docs = await readJson<DocumentRecord[]>(documentsFile, []);
  return docs.find((d) => d.slug === slug) ?? null;
}

async function createRevision(documentId: string, values: RevisionValues, renderedMarkdown: string) {
  const revisions = await readJson<RevisionRecord[]>(revisionsFile, []);
  const version = Math.max(0, ...revisions.filter((r) => r.documentId === documentId).map((r) => r.version)) + 1;
  const revision: RevisionRecord = {
    id: crypto.randomUUID(), documentId, version, values, renderedMarkdown, createdAt: new Date().toISOString(),
  };
  revisions.push(revision);
  await writeJson(revisionsFile, revisions);
  return revision;
}

async function getRevisions(documentId: string) {
  const revisions = await readJson<RevisionRecord[]>(revisionsFile, []);
  return revisions.filter((r) => r.documentId === documentId).sort((a, b) => b.version - a.version);
}

export const fileStore: StoreRepository = {
  createDocument,
  getDocumentBySlug,
  createRevision,
  getRevisions,
};
