import type { Ingredient, Preferences, Recipe } from '@/types';

export type RecipeDietType = 'vegan' | 'veg' | 'eggetarian' | 'non_veg';

export interface CandidateRecipe extends Recipe {
  dietType: RecipeDietType;
}

const DIET_RANK: Record<RecipeDietType, number> = {
  vegan: 0,
  veg: 1,
  eggetarian: 2,
  non_veg: 3,
};

const TIME_CAP_MINUTES: Partial<Record<NonNullable<Preferences['timeAvailable']>, number>> = {
  quick: 20,
  moderate: 40,
};

const MAX_RESULTS = 4;
const MAX_MISSING_INGREDIENTS = 3;

/**
 * Code-level ranking and filtering. The prompt already asks for cuisine,
 * diet, time, and exclusions to be respected, but — same principle as the
 * allergen check — none of that is trusted alone. This recomputes
 * matchScore from the actual confirmed pantry and enforces every
 * preference as a hard filter rather than a suggestion.
 */
export function rankAndFilterRecipes(
  candidates: CandidateRecipe[],
  ingredients: Ingredient[],
  preferences: Preferences
): Recipe[] {
  const pantry = new Set(ingredients.map((i) => i.name.trim().toLowerCase()));

  let pool = candidates;

  const userDietRank = DIET_RANK[preferences.dietType];
  pool = pool.filter((r) => DIET_RANK[r.dietType] <= userDietRank);

  const timeCap = preferences.timeAvailable
    ? TIME_CAP_MINUTES[preferences.timeAvailable]
    : undefined;
  if (timeCap !== undefined) {
    pool = pool.filter((r) => r.timeMinutes <= timeCap);
  }

  const excludes = (preferences.excludeIngredients ?? [])
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (excludes.length > 0) {
    pool = pool.filter((r) => {
      const names = [...r.ingredients.map((i) => i.name), ...r.missingIngredients].map((n) =>
        n.toLowerCase()
      );
      return !excludes.some((ex) => names.some((n) => n.includes(ex)));
    });
  }

  if (preferences.cuisine && preferences.cuisine !== 'surprise_me') {
    const wanted = preferences.cuisine.trim().toLowerCase();
    pool = pool.filter((r) => r.cuisine.trim().toLowerCase() === wanted);
  }

  const rescored = pool.map((r) => {
    const rescoredIngredients = r.ingredients.map((ing) => ({
      ...ing,
      haveOnHand: pantry.has(ing.name.trim().toLowerCase()),
    }));
    const total = rescoredIngredients.length;
    const missingIngredients = rescoredIngredients
      .filter((i) => !i.haveOnHand)
      .map((i) => i.name);
    const matchScore =
      total === 0 ? 0 : Math.round(((total - missingIngredients.length) / total) * 100);

    return {
      id: r.id,
      title: r.title,
      cuisine: r.cuisine,
      matchScore,
      missingIngredients,
      servings: r.servings,
      timeMinutes: r.timeMinutes,
      ingredients: rescoredIngredients,
      steps: r.steps,
      imageUrl: r.imageUrl,
    };
  });

  return rescored
    .filter((r) => r.missingIngredients.length <= MAX_MISSING_INGREDIENTS)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_RESULTS);
}
