import { CATEGORIES } from '../constants';
import type { CategoryDocument, PouchLike } from './types';

export type CategoryInput = Omit<
  CategoryDocument,
  '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt'
>;

export function createCategoriesDb(pouch: PouchLike<CategoryDocument>) {
  return {
    async getAll(): Promise<CategoryDocument[]> {
      const result = await pouch.allDocs({
        include_docs: true,
        startkey: 'category:',
        endkey: 'category:\ufff0',
      });
      return result.rows
        .map((row) => row.doc)
        .filter((doc): doc is CategoryDocument => doc !== undefined);
    },

    async getById(id: string): Promise<CategoryDocument> {
      return pouch.get(id);
    },

    async add(input: CategoryInput): Promise<CategoryDocument> {
      const now = new Date().toISOString();
      const doc: CategoryDocument = {
        _id: `category:${crypto.randomUUID()}`,
        type: 'category',
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      await pouch.put(doc);
      return doc;
    },

    async update(
      id: string,
      input: Partial<CategoryInput>
    ): Promise<CategoryDocument> {
      const existing = await pouch.get(id);
      const updated: CategoryDocument = {
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

    async seedDefaults(): Promise<void> {
      const existing = await this.getAll();
      if (existing.length > 0) {
        return; // Already seeded
      }

      const now = new Date().toISOString();
      for (const name of CATEGORIES) {
        const doc: CategoryDocument = {
          _id: `category:${crypto.randomUUID()}`,
          type: 'category',
          name,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        };
        await pouch.put(doc);
      }
    },
  };
}

export type CategoriesDb = ReturnType<typeof createCategoriesDb>;
