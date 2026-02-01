import type { RecipeDocument, PouchLike } from './types';

export type RecipeInput = Omit<
  RecipeDocument,
  '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt' | '_attachments'
>;

export function createRecipesDb(pouch: PouchLike<RecipeDocument>) {
  return {
    async getAll(): Promise<RecipeDocument[]> {
      const result = await pouch.allDocs({
        include_docs: true,
        startkey: 'recipe:',
        endkey: 'recipe:\ufff0',
      });
      return result.rows
        .map((row) => row.doc)
        .filter((doc): doc is RecipeDocument => doc !== undefined);
    },

    async getById(id: string): Promise<RecipeDocument> {
      return pouch.get(id);
    },

    async add(input: RecipeInput): Promise<RecipeDocument> {
      const now = new Date().toISOString();
      const doc: RecipeDocument = {
        _id: `recipe:${crypto.randomUUID()}`,
        type: 'recipe',
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      await pouch.put(doc);
      return doc;
    },

    async update(
      id: string,
      input: Partial<RecipeInput>
    ): Promise<RecipeDocument> {
      const existing = await pouch.get(id);
      const updated: RecipeDocument = {
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

    // Image attachment methods
    async addImage(id: string, imageBlob: Blob): Promise<void> {
      const doc = await pouch.get(id);
      if (!doc._rev) throw new Error('Document has no revision');
      await pouch.putAttachment(id, 'image', doc._rev, imageBlob, imageBlob.type);
    },

    async getImage(id: string): Promise<Blob | null> {
      try {
        return await pouch.getAttachment(id, 'image');
      } catch {
        return null;
      }
    },

    async removeImage(id: string): Promise<void> {
      const doc = await pouch.get(id);
      if (!doc._rev) throw new Error('Document has no revision');
      try {
        await pouch.removeAttachment(id, 'image', doc._rev);
      } catch {
        // Image might not exist, ignore
      }
    },

    hasImage(doc: RecipeDocument): boolean {
      return Boolean(doc._attachments?.image);
    },
  };
}

export type RecipesDb = ReturnType<typeof createRecipesDb>;
