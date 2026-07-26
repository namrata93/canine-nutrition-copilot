import { IngredientDatabase, type Ingredient } from "../engine/ingredients.js";

// Values transcribed per 100 g from the Dog Formulator "Food Data" sheet, which
// in turn cites USDA FoodData Central. This is a small starter set; the full
// database will be generated from the workbook rather than hand-maintained.

export const INGREDIENTS: Ingredient[] = [
  {
    name: "Raw Chicken Back, Bone, Meat and Skin",
    per100g: {
      calories_kcal: 208,
      protein_g: 15.31,
      fat_g: 17.15,
      calcium_mg: 1330,
      phosphorus_mg: 740,
      magnesium_mg: 40,
      potassium_mg: 170,
      sodium_mg: 100,
      iron_mg: 3.341,
      zinc_mg: 2.305,
      copper_mg: 0.01008008064,
    },
  },
  {
    name: "Raw Beef Liver",
    source: "USDA FDC 169451",
    per100g: {
      calories_kcal: 135,
      protein_g: 20.4,
      fat_g: 3.63,
      calcium_mg: 5,
      phosphorus_mg: 387,
      magnesium_mg: 18,
      potassium_mg: 313,
      sodium_mg: 69,
      iron_mg: 4.9,
      zinc_mg: 4.0,
      copper_mg: 9.76,
    },
  },
  {
    name: "Raw Beef Kidney",
    source: "USDA FDC 169449",
    per100g: {
      calories_kcal: 99,
      protein_g: 17.4,
      fat_g: 3.09,
      calcium_mg: 13,
      phosphorus_mg: 257,
      magnesium_mg: 17,
      potassium_mg: 262,
      sodium_mg: 182,
      iron_mg: 4.6,
      zinc_mg: 1.92,
      copper_mg: 0.426,
    },
  },
  {
    name: "Raw Turkey Heart",
    source: "USDA FDC 171484",
    per100g: {
      calories_kcal: 140,
      protein_g: 16.7,
      fat_g: 7.44,
      calcium_mg: 18,
      phosphorus_mg: 183,
      magnesium_mg: 21,
      potassium_mg: 179,
      sodium_mg: 129,
      iron_mg: 3.7,
      zinc_mg: 3.21,
      copper_mg: 0.488,
    },
  },
];

export const ingredientDatabase = new IngredientDatabase(INGREDIENTS);
