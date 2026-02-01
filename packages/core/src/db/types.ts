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

// PouchDB attachment stub
export interface AttachmentStub {
  content_type: string;
  digest: string;
  length: number;
  stub: true;
}

// PouchDB attachment data
export interface AttachmentData {
  content_type: string;
  data: Blob | string;
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
  _attachments?: {
    image?: AttachmentStub | AttachmentData;
  };
}

// Generic PouchDB interface (minimal, platform-agnostic)
export interface PouchLike<T> {
  put(doc: T): Promise<{ ok: boolean; id: string; rev: string }>;
  get(id: string, options?: { attachments?: boolean }): Promise<T>;
  remove(doc: T): Promise<{ ok: boolean; id: string; rev: string }>;
  allDocs(options?: {
    include_docs?: boolean;
    startkey?: string;
    endkey?: string;
  }): Promise<{
    rows: Array<{ id: string; doc?: T }>;
  }>;
  putAttachment(
    docId: string,
    attachmentId: string,
    rev: string,
    attachment: Blob,
    type: string
  ): Promise<{ ok: boolean; id: string; rev: string }>;
  getAttachment(docId: string, attachmentId: string): Promise<Blob>;
  removeAttachment(
    docId: string,
    attachmentId: string,
    rev: string
  ): Promise<{ ok: boolean; id: string; rev: string }>;
}
