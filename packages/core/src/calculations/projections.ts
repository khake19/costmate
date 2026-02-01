export interface RecipeProjectionInput {
  sellingPrice: number;
  profitPerOrder: number;
  ordersPerMonth: number;
}

export interface RecipeProjectionResult {
  revenuePerMonth: number;
  profitPerMonth: number;
}

/**
 * Calculate monthly projections for a single recipe
 */
export function calculateRecipeProjection(
  input: RecipeProjectionInput
): RecipeProjectionResult {
  const { sellingPrice, profitPerOrder, ordersPerMonth } = input;

  return {
    revenuePerMonth: sellingPrice * ordersPerMonth,
    profitPerMonth: profitPerOrder * ordersPerMonth,
  };
}

export interface SummaryInput {
  recipeProjections: RecipeProjectionResult[];
  monthlyOpex: number;
  avgProfitPerOrder: number;
}

export interface SummaryResult {
  grossRevenue: number;
  grossProfit: number;
  netProfit: number;
  extraOrdersForBreakeven: number;
}

/**
 * Calculate summary across all recipes
 */
export function calculateSummary(input: SummaryInput): SummaryResult {
  const { recipeProjections, monthlyOpex, avgProfitPerOrder } = input;

  const grossRevenue = recipeProjections.reduce(
    (sum, proj) => sum + proj.revenuePerMonth,
    0
  );
  const grossProfit = recipeProjections.reduce(
    (sum, proj) => sum + proj.profitPerMonth,
    0
  );
  const netProfit = grossProfit - monthlyOpex;

  // If net profit is negative, calculate extra orders needed for breakeven
  const extraOrdersForBreakeven =
    netProfit < 0 && avgProfitPerOrder > 0
      ? Math.ceil(Math.abs(netProfit) / avgProfitPerOrder)
      : 0;

  return {
    grossRevenue,
    grossProfit,
    netProfit,
    extraOrdersForBreakeven,
  };
}
