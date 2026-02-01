export interface DiscountInput {
  priceBeforeVat: number;
  totalCost: number;
  profitPerOrder: number;
  discountPercent: number; // e.g., 0.20 for 20% PWD/Senior discount
}

export interface DiscountResult {
  discount: number;
  discountedPrice: number;
  profitAfterDiscount: number;
  profitDifference: number;
}

/**
 * Calculate PWD/Senior discount pricing
 */
export function calculateDiscount(input: DiscountInput): DiscountResult {
  const { priceBeforeVat, totalCost, profitPerOrder, discountPercent } = input;

  const discount = discountPercent * priceBeforeVat;
  const discountedPrice = priceBeforeVat - discount;
  const profitAfterDiscount = discountedPrice - totalCost;
  const profitDifference = profitPerOrder - profitAfterDiscount;

  return {
    discount,
    discountedPrice,
    profitAfterDiscount,
    profitDifference,
  };
}
