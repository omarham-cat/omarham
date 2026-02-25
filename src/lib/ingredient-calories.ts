/**
 * Approximate calories per 100g for common Indian sweet / food ingredients.
 * Keys are lowercase for case-insensitive matching.
 */
export const INGREDIENT_CALORIE_MAP: Record<string, number> = {
  // Dairy
  "milk": 42,
  "khoya": 458,
  "khoya (mawa)": 458,
  "mawa": 458,
  "paneer": 265,
  "paneer (cottage cheese)": 265,
  "condensed milk": 321,
  "cream": 340,
  "butter": 717,
  "yogurt": 59,
  "curd": 59,

  // Sweeteners
  "sugar": 387,
  "jaggery": 383,
  "honey": 304,
  "sugar syrup": 260,

  // Fats
  "ghee": 900,
  "oil": 884,
  "vegetable oil": 884,

  // Flours & grains
  "besan": 387,
  "besan (gram flour)": 387,
  "gram flour": 387,
  "wheat flour": 364,
  "maida": 364,
  "rice flour": 366,
  "semolina": 360,
  "sooji": 360,
  "cornflour": 381,

  // Nuts
  "almonds": 579,
  "almond": 579,
  "cashews": 553,
  "cashew": 553,
  "pistachios": 560,
  "pistachio": 560,
  "walnuts": 654,
  "walnut": 654,
  "peanuts": 567,
  "peanut": 567,
  "dry fruit mix": 520,

  // Seeds
  "sesame": 573,
  "sesame seeds": 573,
  "poppy seeds": 525,
  "melon seeds": 557,
  "flax seeds": 534,

  // Dried fruits
  "raisins": 299,
  "raisin": 299,
  "dates": 282,
  "date": 282,
  "coconut": 354,
  "desiccated coconut": 660,

  // Spices & flavourings
  "cardamom": 311,
  "saffron": 310,
  "cinnamon": 247,
  "clove": 274,
  "nutmeg": 525,
  "fennel seeds": 345,
  "rose water": 0,
  "kewra water": 0,
  "vanilla": 288,

  // Chocolate
  "cocoa powder": 228,
  "dark chocolate": 546,
  "milk chocolate": 535,
  "white chocolate": 539,

  // Decorative (negligible calories)
  "silver leaf": 0,
  "silver leaf (vark)": 0,
  "vark": 0,
  "edible glitter": 0,
};

/**
 * Estimate approximate calories per 100g of a product based on its ingredient list.
 * Uses equal-weight averaging across matched ingredients (a reasonable
 * approximation when exact proportions are unknown).
 * Returns 0 if no ingredients match.
 */
export function estimateCaloriesPer100g(ingredientNames: string[]): number {
  if (ingredientNames.length === 0) return 0;

  let total = 0;
  let matched = 0;

  for (const name of ingredientNames) {
    const key = name.toLowerCase().trim();
    if (key in INGREDIENT_CALORIE_MAP) {
      total += INGREDIENT_CALORIE_MAP[key];
      matched++;
    }
  }

  if (matched === 0) return 0;
  return Math.round(total / matched);
}
