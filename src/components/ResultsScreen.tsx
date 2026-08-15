'use client';

import StepShell from './StepShell';
import type { Recipe } from '@/types';

interface Props {
  recipes: Recipe[];
  onBack: () => void;
  onSelect: (recipe: Recipe) => void;
}

export default function ResultsScreen({ recipes, onBack, onSelect }: Props) {
  return (
    <StepShell
      step={4}
      totalSteps={5}
      title="Recipes for you"
      subtitle={
        recipes.length
          ? `${recipes.length} recipe${recipes.length > 1 ? 's' : ''}, ranked by match`
          : undefined
      }
      onBack={onBack}
    >
      {recipes.length === 0 && (
        <p className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-500">
          No recipes came back that fit your constraints. Try loosening a preference and go back.
        </p>
      )}

      <div className="space-y-3">
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => onSelect(recipe)}
            className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-accent hover:shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold">{recipe.title}</h2>
              <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                {recipe.matchScore}% match
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
              <span className="rounded bg-neutral-100 px-2 py-0.5">{recipe.cuisine}</span>
              <span>⏱ {recipe.timeMinutes} min</span>
              <span>🍽 {recipe.servings} servings</span>
            </div>

            {recipe.missingIngredients.length > 0 ? (
              <p className="mt-2 text-sm text-amber-700">
                Missing {recipe.missingIngredients.length}: {recipe.missingIngredients.join(', ')}
              </p>
            ) : (
              <p className="mt-2 text-sm text-green-700">You have everything for this one</p>
            )}
          </button>
        ))}
      </div>
    </StepShell>
  );
}
