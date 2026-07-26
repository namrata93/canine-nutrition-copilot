import type { Recipe } from "../engine/recipe.js";

// The workbook's "Saved Profiles" sheet ships the same sample recipe twice: once
// in ounces and once in grams. That pair is the ideal regression fixture,
// because after unit conversion both versions must describe the same meal.

export const sampleRecipeOunces: Recipe = {
  name: "Sample recipe (ounces)",
  items: [
    { ingredient: "Raw Chicken Back, Bone, Meat and Skin", amount: 5.5, unit: "oz" },
    { ingredient: "Raw Beef Liver", amount: 0.5, unit: "oz" },
    { ingredient: "Raw Beef Kidney", amount: 1.6, unit: "oz" },
  ],
};

// Gram amounts as stored in the workbook (rounded to one decimal place).
export const sampleRecipeGrams: Recipe = {
  name: "Sample recipe (grams)",
  items: [
    { ingredient: "Raw Chicken Back, Bone, Meat and Skin", amount: 155.9, unit: "g" },
    { ingredient: "Raw Beef Liver", amount: 14.2, unit: "g" },
    { ingredient: "Raw Beef Kidney", amount: 45.4, unit: "g" },
  ],
};
