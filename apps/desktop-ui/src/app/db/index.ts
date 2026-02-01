import {
  createIngredientsDb,
  createRecipesDb,
  createPackagingDb,
  type IngredientDocument,
  type RecipeDocument,
  type PackagingDocument,
  type PouchLike,
} from "@costmate/core";
import { db } from "./client";

// Create typed db services
export const ingredientsDb = createIngredientsDb(
  db as unknown as PouchLike<IngredientDocument>
);

export const recipesDb = createRecipesDb(
  db as unknown as PouchLike<RecipeDocument>
);

export const packagingDb = createPackagingDb(
  db as unknown as PouchLike<PackagingDocument>
);

// Re-export for convenience
export { db } from "./client";
