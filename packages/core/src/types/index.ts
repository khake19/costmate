import type { CATEGORIES, UNITS } from '../constants';

export type Category = (typeof CATEGORIES)[number];
export type Unit = (typeof UNITS)[number];

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  quantity: string;
  unit: Unit;
  price: string;
}

export type IngredientFormData = Omit<Ingredient, 'id'>;
