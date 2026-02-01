// Constants
export { CATEGORIES, UNITS, UNIT_CONFIG } from './constants';

// Types
export type { Category, Unit, Ingredient, IngredientFormData } from './types';

// Calculations
export {
  // Ingredient
  calculatePricePerUnit,
  formatQuantityUnit,
  // Unit cost
  calculateUnitCost,
  calculateLineItemCost,
  // Recipe
  calculateRecipeCost,
  type RecipeCostInput,
  type RecipeCostResult,
  // Pricing
  calculatePricing,
  type PricingInput,
  type PricingResult,
  // Discount
  calculateDiscount,
  type DiscountInput,
  type DiscountResult,
  // OPEX
  calculateOpex,
  type OpexInput,
  type OpexResult,
  // Projections
  calculateRecipeProjection,
  calculateSummary,
  type RecipeProjectionInput,
  type RecipeProjectionResult,
  type SummaryInput,
  type SummaryResult,
} from './calculations';

// Validators
export {
  ingredientSchema,
  recipeSchema,
  recipeIngredientSchema,
  packagingItemSchema,
} from './validators';
export type {
  IngredientSchemaType,
  RecipeIngredient,
  PackagingItem,
  RecipeFormData,
} from './validators';

// Database
export {
  createIngredientsDb,
  createRecipesDb,
  createPackagingDb,
  type BaseDocument,
  type IngredientDocument,
  type RecipeDocument,
  type RecipeIngredientItem,
  type PackagingItemDocument,
  type PackagingDocument,
  type PouchLike,
  type IngredientsDb,
  type RecipesDb,
  type PackagingDb,
  type IngredientInput,
  type RecipeInput,
  type PackagingInput,
} from './db';
