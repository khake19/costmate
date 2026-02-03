import { z } from 'zod';
import { UNITS } from '../constants';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Quantity must be a positive number'
    ),
  unit: z.enum(UNITS),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      'Price must be a valid number'
    ),
});

export type IngredientSchemaType = z.infer<typeof ingredientSchema>;

// Recipe validators
export {
  recipeSchema,
  recipeIngredientSchema,
  packagingItemSchema,
  type RecipeIngredient,
  type PackagingItem,
  type RecipeFormData,
} from './recipe';
