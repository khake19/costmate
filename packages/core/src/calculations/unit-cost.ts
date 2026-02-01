/**
 * Calculate unit cost for ingredients or packaging
 * Unit Cost = (Package Price + Shipping Fee) / Qty Per Pack
 */
export function calculateUnitCost(
  packagePrice: number,
  shippingFee: number,
  qtyPerPack: number
): number {
  if (qtyPerPack === 0) return 0;
  return (packagePrice + shippingFee) / qtyPerPack;
}

/**
 * Calculate recipe line item cost
 * Item Cost = Qty Needed × Unit Cost
 */
export function calculateLineItemCost(
  qtyNeeded: number,
  unitCost: number
): number {
  return qtyNeeded * unitCost;
}
