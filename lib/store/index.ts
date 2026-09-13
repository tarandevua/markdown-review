import "server-only";

import type { RevisionValues } from "@/lib/markdown/types";
import { resolveStoreConfig } from "./config";
import { fileStore } from "./fileStore";
import { createSupabaseStore } from "./supabaseStore";
import type { StoreRepository } from "./types";

let repository: StoreRepository | undefined;

function getRepository(): StoreRepository {
  if (repository) return repository;

  const config = resolveStoreConfig(process.env);
  repository = config.kind === "supabase"
    ? createSupabaseStore(config.url, config.secretKey)
    : fileStore;
  return repository;
}

export function createDocument(title: string, sourceMarkdown: string) {
  return getRepository().createDocument(title, sourceMarkdown);
}

export function getDocumentBySlug(slug: string) {
  return getRepository().getDocumentBySlug(slug);
}

export function createRevision(
  documentId: string,
  values: RevisionValues,
  renderedMarkdown: string,
) {
  return getRepository().createRevision(documentId, values, renderedMarkdown);
}

export function getRevisions(documentId: string) {
  return getRepository().getRevisions(documentId);
}

export type { DocumentRecord, RevisionRecord, StoreRepository } from "./types";
