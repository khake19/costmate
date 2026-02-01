export interface OpexInput {
  monthlyExpenses: number[];
  contingencyPercent: number; // e.g., 0.10 for 10%
}

export interface OpexResult {
  baseOpex: number;
  monthlyOpex: number;
}

/**
 * Calculate OPEX with contingency
 * Base OPEX = SUM(all monthly expenses)
 * Monthly OPEX = Base OPEX + (Base OPEX × Contingency%)
 */
export function calculateOpex(input: OpexInput): OpexResult {
  const { monthlyExpenses, contingencyPercent } = input;

  const baseOpex = monthlyExpenses.reduce((sum, expense) => sum + expense, 0);
  const monthlyOpex = baseOpex + baseOpex * contingencyPercent;

  return {
    baseOpex,
    monthlyOpex,
  };
}
