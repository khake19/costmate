import { z } from 'zod';
import { UNITS } from '../constants';

export const recipeIngredientSchema = z.object({
  ingredientId: z.string().min(1, 'Ingredient is required'),
  name: z.string(),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Quantity must be a positive number'
    ),
  unit: z.enum(UNITS),
  unitCost: z.number(),
});

export const packagingItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Quantity must be a positive number'
    ),
  unitCost: z.number(),
});

export const recipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  ingredients: z.array(recipeIngredientSchema),
  packaging: z.array(packagingItemSchema),
  targetMarginPercent: z
    .string()
    .min(1, 'Target margin is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100,
      'Margin must be between 1-100%'
    ),
  batchSize: z
    .string()
    .min(1, 'Batch size is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 1,
      'Batch size must be at least 1'
    ),
  ordersPerMonth: z
    .string()
    .min(1, 'Orders per month is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0,
      'Orders must be a valid number'
    ),
  isVatRegistered: z.boolean(),
});

export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type PackagingItem = z.infer<typeof packagingItemSchema>;
export type RecipeFormData = z.infer<typeof recipeSchema>;
