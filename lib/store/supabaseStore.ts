import "server-only";

import crypto from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { RevisionValues } from "@/lib/markdown/types";
import type { DocumentRecord, RevisionRecord, StoreRepository } from "./types";

type DatabaseDocument = {
  id: string;
  slug: string;
  title: string;
  source_markdown: string;
  created_at: string;
};

type DatabaseRevision = {
  id: string;
  document_id: string;
  version: number;
  values: RevisionValues;
  rendered_markdown: string;
  created_at: string;
};

function mapDocument(row: DatabaseDocument): DocumentRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    sourceMarkdown: row.source_markdown,
    createdAt: row.created_at,
  };
}

function mapRevision(row: DatabaseRevision): RevisionRecord {
  return {
    id: row.id,
    documentId: row.document_id,
    version: row.version,
    values: row.values,
    renderedMarkdown: row.rendered_markdown,
    createdAt: row.created_at,
  };
}

function databaseError(action: string, message: string): Error {
  return new Error(`Could not ${action}: ${message}`);
}

export function createSupabaseStore(url: string, secretKey: string): StoreRepository {
  const client: SupabaseClient = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return {
    async createDocument(title, sourceMarkdown) {
      const { data, error } = await client
        .from("documents")
        .insert({
          slug: crypto.randomBytes(18).toString("base64url"),
          title: title || "Untitled document",
          source_markdown: sourceMarkdown,
        })
        .select("id, slug, title, source_markdown, created_at")
        .single();

      if (error) throw databaseError("create document", error.message);
      return mapDocument(data as DatabaseDocument);
    },

    async getDocumentBySlug(slug) {
      const { data, error } = await client
        .from("documents")
        .select("id, slug, title, source_markdown, created_at")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw databaseError("load document", error.message);
      return data ? mapDocument(data as DatabaseDocument) : null;
    },

    async createRevision(documentId, values, renderedMarkdown) {
      const { data, error } = await client.rpc("create_document_revision", {
        target_document_id: documentId,
        revision_values: values,
        completed_markdown: renderedMarkdown,
      });

      if (error) throw databaseError("create revision", error.message);
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw databaseError("create revision", "database returned no revision");
      return mapRevision(row as DatabaseRevision);
    },

    async getRevisions(documentId) {
      const { data, error } = await client
        .from("revisions")
        .select("id, document_id, version, values, rendered_markdown, created_at")
        .eq("document_id", documentId)
        .order("version", { ascending: false });

      if (error) throw databaseError("load revisions", error.message);
      return (data as DatabaseRevision[]).map(mapRevision);
    },
  };
}
