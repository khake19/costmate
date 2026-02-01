import {
  createIngredientsDb,
  createRecipesDb,
  type IngredientDocument,
  type RecipeDocument,
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

// Re-export for convenience
export { db } from "./client";
