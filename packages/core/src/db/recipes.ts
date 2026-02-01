import type { RecipeDocument, PouchLike } from './types';

export type RecipeInput = Omit<
  RecipeDocument,
  '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt'
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
  };
}

export type RecipesDb = ReturnType<typeof createRecipesDb>;
