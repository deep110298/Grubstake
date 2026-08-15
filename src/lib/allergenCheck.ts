import type { Recipe } from '@/types';

// Common allergen synonyms, keyed by the toggle labels used on Screen 3.
// Free-text allergies fall back to a plain substring match.
const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  nuts: [
    'nut',
    'almond',
    'cashew',
    'walnut',
    'peanut',
    'pecan',
    'pistachio',
    'hazelnut',
    'macadamia',
    'praline',
    'marzipan',
  ],
  dairy: [
    'milk',
    'cheese',
    'butter',
    'cream',
    'yogurt',
    'yoghurt',
    'ghee',
    'paneer',
    'whey',
    'casein',
    'custard',
  ],
  gluten: [
    'wheat',
    'flour',
    'barley',
    'rye',
    'pasta',
    'bread',
    'breadcrumb',
    'couscous',
    'seitan',
    'soy sauce',
    'noodle',
  ],
  shellfish: [
    'shrimp',
    'prawn',
    'crab',
    'lobster',
    'scallop',
    'clam',
    'mussel',
    'oyster',
    'crawfish',
    'langoustine',
  ],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'tamari', 'miso'],
  egg: ['egg', 'mayonnaise', 'mayo', 'meringue'],
};

export interface AllergenViolation {
  recipeId: string;
  recipeTitle: string;
  allergen: string;
  matchedIngredient: string;
}

function termsForAllergen(allergen: string): string[] {
  const key = allergen.trim().toLowerCase();
  return ALLERGEN_SYNONYMS[key] ?? [key];
}

function findMatch(ingredientName: string, terms: string[]): string | null {
  const lower = ingredientName.toLowerCase();
  const hit = terms.find((term) => lower.includes(term));
  return hit ?? null;
}

/**
 * Code-level safety net behind the prompt-level allergen instructions.
 * Never trust the model alone for allergen exclusion.
 */
export function findAllergenViolations(
  recipes: Recipe[],
  allergies: string[]
): AllergenViolation[] {
  if (allergies.length === 0) return [];

  const violations: AllergenViolation[] = [];

  for (const recipe of recipes) {
    const ingredientNames = [
      ...recipe.ingredients.map((i) => i.name),
      ...recipe.missingIngredients,
    ];

    for (const allergen of allergies) {
      const terms = termsForAllergen(allergen);
      for (const name of ingredientNames) {
        const match = findMatch(name, terms);
        if (match) {
          violations.push({
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            allergen,
            matchedIngredient: name,
          });
        }
      }
    }
  }

  return violations;
}

export function filterSafeRecipes(
  recipes: Recipe[],
  allergies: string[]
): { safe: Recipe[]; violations: AllergenViolation[] } {
  const violations = findAllergenViolations(recipes, allergies);
  const unsafeIds = new Set(violations.map((v) => v.recipeId));
  const safe = recipes.filter((r) => !unsafeIds.has(r.id));
  return { safe, violations };
}
