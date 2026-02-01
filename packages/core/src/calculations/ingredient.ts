import { UNIT_CONFIG } from "../constants";
import type { Unit } from "../types";

export function calculatePricePerUnit(
  quantity: string,
  unit: Unit,
  price: string,
): string {
  const qty = parseFloat(quantity) || 0;
  const priceVal = parseFloat(price) || 0;

  if (qty === 0 || priceVal === 0) {
    return "--";
  }

  const config = UNIT_CONFIG[unit];
  const pricePerBase = priceVal / (qty * config.multiplier);

  return `₱${pricePerBase.toFixed(3)}/${config.baseUnit}`;
}

export function formatQuantityUnit(quantity: string, unit: Unit): string {
  return `${quantity}${unit}`;
}
