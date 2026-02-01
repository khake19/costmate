import type { IngredientDocument, PouchLike } from './types';

export type IngredientInput = Omit<
  IngredientDocument,
  '_id' | '_rev' | 'type' | 'createdAt' | 'updatedAt'
>;

export function createIngredientsDb(pouch: PouchLike<IngredientDocument>) {
  return {
    async getAll(): Promise<IngredientDocument[]> {
      const result = await pouch.allDocs({
        include_docs: true,
        startkey: 'ingredient:',
        endkey: 'ingredient:\ufff0',
      });
      return result.rows
        .map((row) => row.doc)
        .filter((doc): doc is IngredientDocument => doc !== undefined);
    },

    async getById(id: string): Promise<IngredientDocument> {
      return pouch.get(id);
    },

    async add(input: IngredientInput): Promise<IngredientDocument> {
      const now = new Date().toISOString();
      const doc: IngredientDocument = {
        _id: `ingredient:${crypto.randomUUID()}`,
        type: 'ingredient',
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      await pouch.put(doc);
      return doc;
    },

    async update(
      id: string,
      input: Partial<IngredientInput>
    ): Promise<IngredientDocument> {
      const existing = await pouch.get(id);
      const updated: IngredientDocument = {
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

export type IngredientsDb = ReturnType<typeof createIngredientsDb>;
