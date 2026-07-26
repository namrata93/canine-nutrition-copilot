// The nutrients this engine currently tracks. This is a deliberate subset of the
// ~50 columns in the source workbook's "Food Data" sheet, chosen to exercise the
// full calculation path (energy, macros, and the minerals that matter most in raw
// feeding) before expanding coverage.

export const NUTRIENTS = {
  calories_kcal: { label: "Calories", unit: "kcal" },
  protein_g: { label: "Protein", unit: "g" },
  fat_g: { label: "Fat", unit: "g" },
  calcium_mg: { label: "Calcium", unit: "mg" },
  phosphorus_mg: { label: "Phosphorus", unit: "mg" },
  magnesium_mg: { label: "Magnesium", unit: "mg" },
  potassium_mg: { label: "Potassium", unit: "mg" },
  sodium_mg: { label: "Sodium", unit: "mg" },
  iron_mg: { label: "Iron", unit: "mg" },
  zinc_mg: { label: "Zinc", unit: "mg" },
  copper_mg: { label: "Copper", unit: "mg" },
} as const;

export type NutrientKey = keyof typeof NUTRIENTS;

export const NUTRIENT_KEYS = Object.keys(NUTRIENTS) as NutrientKey[];

/** An empty nutrient tally with every tracked nutrient initialized to zero. */
export function zeroNutrients(): Record<NutrientKey, number> {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as Record<
    NutrientKey,
    number
  >;
}
