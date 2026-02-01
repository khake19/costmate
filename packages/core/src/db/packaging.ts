import type { PouchLike } from './types';

export interface PackagingDocument {
  _id: string;
  _rev?: string;
  type: 'packaging';
  name: string;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
}

export type PackagingInput = Omit<
  PackagingDocument,
  '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt'
>;

export function createPackagingDb(pouch: PouchLike<PackagingDocument>) {
  return {
    async getAll(): Promise<PackagingDocument[]> {
      const result = await pouch.allDocs({
        include_docs: true,
        startkey: 'packaging:',
        endkey: 'packaging:\ufff0',
      });
      return result.rows
        .map((row) => row.doc)
        .filter((doc): doc is PackagingDocument => doc !== undefined);
    },

    async getById(id: string): Promise<PackagingDocument> {
      return pouch.get(id);
    },

    async add(input: PackagingInput): Promise<PackagingDocument> {
      const now = new Date().toISOString();
      const doc: PackagingDocument = {
        _id: `packaging:${crypto.randomUUID()}`,
        type: 'packaging',
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      await pouch.put(doc);
      return doc;
    },

    async update(
      id: string,
      input: Partial<PackagingInput>
    ): Promise<PackagingDocument> {
      const existing = await pouch.get(id);
      const updated: PackagingDocument = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      await pouch.put(updated);
      return updated;
    },

    async remove(id: string): Promise<void> {
      const doc = await pouch.get(id);
      await pouch.remove(doc);
    },
  };
}

export type PackagingDb = ReturnType<typeof createPackagingDb>;
