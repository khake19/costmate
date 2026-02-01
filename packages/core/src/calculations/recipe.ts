export interface RecipeCostInput {
  ingredientCosts: number[];
  otherCosts: number[]; // packaging, etc.
  batchSize: number;
}

export interface RecipeCostResult {
  totalIngredientsCost: number;
  totalOtherCost: number;
  ingredientsPerOrder: number;
  otherPerOrder: number;
  totalCostPerOrder: number;
}

/**
 * Calculate recipe totals and per-order costs
 */
export function calculateRecipeCost(input: RecipeCostInput): RecipeCostResult {
  const { ingredientCosts, otherCosts, batchSize } = input;

  const totalIngredientsCost = ingredientCosts.reduce((sum, cost) => sum + cost, 0);
  const totalOtherCost = otherCosts.reduce((sum, cost) => sum + cost, 0);

  const safeBatchSize = batchSize || 1;
  const ingredientsPerOrder = totalIngredientsCost / safeBatchSize;
  const otherPerOrder = totalOtherCost / safeBatchSize;
  const totalCostPerOrder = ingredientsPerOrder + otherPerOrder;

  return {
    totalIngredientsCost,
    totalOtherCost,
    ingredientsPerOrder,
    otherPerOrder,
    totalCostPerOrder,
  };
}
