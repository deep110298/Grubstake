import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, RECIPE_MODEL, extractJson } from '@/lib/anthropic';
import { filterSafeRecipes } from '@/lib/allergenCheck';
import type { Ingredient, Preferences, Recipe } from '@/types';

const SYSTEM_PROMPT = `You are a recipe generator. Given a list of available ingredients
and user preferences, generate 2-3 recipes.

HARD CONSTRAINTS (never violate):
- Every recipe must exclude all listed allergens completely — no
  substitutions that reintroduce them, no "trace amount" suggestions.
- Respect dietType strictly (non_veg recipes must not appear for veg/vegan users).
- Respect excludeIngredients even if the ingredient is on hand.

Rank recipes by how much of the ingredient list they use. Recipes
needing 1-2 items the user doesn't have are fine — flag those items.

Return ONLY valid JSON matching this shape, no other text:
[{"title": string, "cuisine": string, "matchScore": number, "missingIngredients": string[], "servings": number, "timeMinutes": number, "ingredients": [{"name": string, "amount": number, "unit": string, "haveOnHand": boolean}], "steps": string[]}]`;

function buildUserPrompt(
  ingredients: Ingredient[],
  preferences: Preferences,
  avoid?: string[]
): string {
  const lines = [
    `Available ingredients: ${ingredients.map((i) => i.name).join(', ') || 'none listed'}`,
    `Cuisine preference: ${preferences.cuisine}`,
    `Diet type: ${preferences.dietType}`,
    `Allergies (must exclude entirely): ${preferences.allergies.join(', ') || 'none'}`,
    `Servings: ${preferences.servings}`,
  ];
  if (preferences.timeAvailable) lines.push(`Time available: ${preferences.timeAvailable}`);
  if (preferences.equipment?.length) lines.push(`Equipment on hand: ${preferences.equipment.join(', ')}`);
  if (preferences.spiceLevel) lines.push(`Spice level: ${preferences.spiceLevel}`);
  if (preferences.excludeIngredients?.length)
    lines.push(`Exclude even if on hand: ${preferences.excludeIngredients.join(', ')}`);
  if (avoid?.length)
    lines.push(
      `The previous attempt incorrectly included these allergens — regenerate without them: ${avoid.join(', ')}`
    );
  return lines.join('\n');
}

async function requestRecipes(
  ingredients: Ingredient[],
  preferences: Preferences,
  avoid?: string[]
): Promise<Recipe[]> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: RECIPE_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(ingredients, preferences, avoid) },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return [];

  const parsed = extractJson<Omit<Recipe, 'id'>[]>(textBlock.text);
  return parsed.map((recipe) => ({ ...recipe, id: crypto.randomUUID() }));
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients, preferences } = (await req.json()) as {
      ingredients: Ingredient[];
      preferences: Preferences;
    };

    let recipes = await requestRecipes(ingredients, preferences);
    let { safe, violations } = filterSafeRecipes(recipes, preferences.allergies);

    // Safety-critical: never trust the model's own allergen exclusion.
    // One regeneration pass naming the exact offending allergens, then
    // drop anything that still fails rather than ever serving it.
    if (violations.length > 0) {
      const avoid = Array.from(new Set(violations.map((v) => v.allergen)));
      recipes = await requestRecipes(ingredients, preferences, avoid);
      ({ safe, violations } = filterSafeRecipes(recipes, preferences.allergies));

      if (violations.length > 0) {
        console.warn('Dropping recipes that still violate allergens after retry', violations);
      }
    }

    const ranked = [...safe].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    return NextResponse.json({ recipes: ranked });
  } catch (error) {
    console.error('generate-recipes failed', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
