import type { RevisionValues } from "@/lib/markdown/types";

export type DocumentRecord = {
  id: string;
  slug: string;
  title: string;
  sourceMarkdown: string;
  createdAt: string;
};

export type RevisionRecord = {
  id: string;
  documentId: string;
  version: number;
  values: RevisionValues;
  renderedMarkdown: string;
  createdAt: string;
};

export interface StoreRepository {
  createDocument(title: string, sourceMarkdown: string): Promise<DocumentRecord>;
  getDocumentBySlug(slug: string): Promise<DocumentRecord | null>;
  createRevision(
    documentId: string,
    values: RevisionValues,
    renderedMarkdown: string,
  ): Promise<RevisionRecord>;
  getRevisions(documentId: string): Promise<RevisionRecord[]>;
}
