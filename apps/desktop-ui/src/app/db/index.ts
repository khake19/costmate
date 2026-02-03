import {
  createCategoriesDb,
  createIngredientsDb,
  createRecipesDb,
  createPackagingDb,
  type CategoryDocument,
  type IngredientDocument,
  type RecipeDocument,
  type PackagingDocument,
  type PouchLike,
} from "@costmate/core";
import { db } from "./client";

// Create typed db services
export const categoriesDb = createCategoriesDb(
  db as unknown as PouchLike<CategoryDocument>
);

export const ingredientsDb = createIngredientsDb(
  db as unknown as PouchLike<IngredientDocument>
);

export const recipesDb = createRecipesDb(
  db as unknown as PouchLike<RecipeDocument>
);

export const packagingDb = createPackagingDb(
  db as unknown as PouchLike<PackagingDocument>
);

// Seed default data
export async function initializeDb() {
  await categoriesDb.seedDefaults();
}

// Re-export for convenience
export { db } from "./client";
