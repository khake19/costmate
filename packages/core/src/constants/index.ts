export const CATEGORIES = [
  'Meat',
  'Vegetables',
  'Spices',
  'Grain',
  'Oil',
  'Others',
] as const;

export const UNITS = ['kg', 'g', 'L', 'ml', 'pc'] as const;

export const UNIT_CONFIG: Record<
  Unit,
  { multiplier: number; baseUnit: string }
> = {
  kg: { multiplier: 1000, baseUnit: 'g' },
  g: { multiplier: 1, baseUnit: 'g' },
  L: { multiplier: 1000, baseUnit: 'ml' },
  ml: { multiplier: 1, baseUnit: 'ml' },
  pc: { multiplier: 1, baseUnit: 'pc' },
};

// Import type after const to avoid circular dependency
import type { Unit } from '../types';
