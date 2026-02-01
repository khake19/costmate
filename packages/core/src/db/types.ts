import type { Category, Unit } from '../types';

// Base document type for PouchDB
export interface BaseDocument {
  _id: string;
  _rev?: string;
  createdAt: string;
  updatedAt: string;
}

// Ingredient document
export interface IngredientDocument extends BaseDocument {
  type: 'ingredient';
  name: string;
  category: Category;
  quantity: string;
  unit: Unit;
  price: string;
}

// Recipe ingredient (embedded in recipe)
export interface RecipeIngredientItem {
  ingredientId: string;
  name: string;
  quantity: string;
  unit: Unit;
  unitCost: number;
}

// Packaging item (embedded in recipe)
export interface PackagingItemDocument {
  id: string;
  name: string;
  quantity: string;
  unitCost: number;
}

// Recipe document
export interface RecipeDocument extends BaseDocument {
  type: 'recipe';
  name: string;
  ingredients: RecipeIngredientItem[];
  packaging: PackagingItemDocument[];
  targetMarginPercent: string;
  batchSize: string;
  ordersPerMonth: string;
  isVatRegistered: boolean;
}

// Generic PouchDB interface (minimal, platform-agnostic)
export interface PouchLike<T> {
  put(doc: T): Promise<{ ok: boolean; id: string; rev: string }>;
  get(id: string): Promise<T>;
  remove(doc: T): Promise<{ ok: boolean; id: string; rev: string }>;
  allDocs(options?: {
    include_docs?: boolean;
    startkey?: string;
    endkey?: string;
  }): Promise<{
    rows: Array<{ id: string; doc?: T }>;
  }>;
}
