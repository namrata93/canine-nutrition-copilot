// Unit conversion, ported directly from the workbook's "Food Calc" sheet.
//
// Every nutrient value in the ingredient database is stored per 100 g. To scale
// an entered amount we first convert it to grams, then divide by 100. Keeping
// these two steps explicit (and pure) is what lets the same recipe expressed in
// ounces or grams produce identical nutrient totals.

export type MassUnit = "g" | "mg" | "mcg" | "kg" | "oz" | "lb";

/** Grams per one unit of each supported mass unit. */
const GRAMS_PER_UNIT: Record<MassUnit, number> = {
  g: 1,
  mg: 0.001,
  mcg: 0.000001,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

export function isMassUnit(unit: string): unit is MassUnit {
  return unit in GRAMS_PER_UNIT;
}

/** Convert an amount in a supported mass unit to grams. */
export function toGrams(amount: number, unit: MassUnit): number {
  return amount * GRAMS_PER_UNIT[unit];
}

/**
 * The multiplier applied to a per-100 g nutrient value for a given amount.
 * e.g. 150 g of an ingredient uses 1.5x its per-100 g values.
 */
export function per100gScale(amount: number, unit: MassUnit): number {
  return toGrams(amount, unit) / 100;
}
