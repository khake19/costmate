export interface PricingInput {
  totalCost: number;
  targetMarginPercent: number; // e.g., 0.30 for 30%
  vatPercent: number; // e.g., 0.12 for 12%
  isVatRegistered: boolean;
}

export interface PricingResult {
  priceBeforeVat: number;
  vat: number;
  sellingPrice: number;
  profitPerOrder: number;
}

/**
 * Calculate pricing with margin and VAT
 * Price Before VAT = ROUNDUP(Total Cost / (1 - Target Margin%), 0)
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const { totalCost, targetMarginPercent, vatPercent, isVatRegistered } = input;

  const marginFactor = 1 - targetMarginPercent;
  const priceBeforeVat = marginFactor > 0 ? Math.ceil(totalCost / marginFactor) : 0;

  const vat = isVatRegistered ? priceBeforeVat * vatPercent : 0;
  const sellingPrice = priceBeforeVat + vat;
  const profitPerOrder = priceBeforeVat - totalCost;

  return {
    priceBeforeVat,
    vat,
    sellingPrice,
    profitPerOrder,
  };
}
