'use client';

import { useState } from 'react';
import StepShell from './StepShell';
import PrimaryButton from './PrimaryButton';
import type { Recipe } from '@/types';

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onStartOver: () => void;
}

function formatAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export default function RecipeDetailScreen({ recipe, onBack, onStartOver }: Props) {
  const [servings, setServings] = useState(recipe.servings);
  const [isSaved, setIsSaved] = useState(false);
  const scale = servings / recipe.servings;

  return (
    <StepShell step={5} totalSteps={5} title={recipe.title} onBack={onBack}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
        <span className="rounded bg-neutral-100 px-2 py-0.5">{recipe.cuisine}</span>
        <span>⏱ {recipe.timeMinutes} min</span>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
          {recipe.matchScore}% match
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">Ingredients</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200 hover:bg-neutral-300"
          >
            −
          </button>
          <span className="text-sm">{servings} servings</span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(24, s + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200 hover:bg-neutral-300"
          >
            +
          </button>
        </div>
      </div>

      <ul className="mt-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {recipe.ingredients.map((ing, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-2.5 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                ing.haveOnHand ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
              title={ing.haveOnHand ? 'On hand' : 'Need to buy'}
            >
              {ing.haveOnHand ? '✓' : '＋'}
            </span>
            <span className="flex-1">{ing.name}</span>
            <span className="shrink-0 text-neutral-500">
              {formatAmount(ing.amount * scale)} {ing.unit}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-5 mb-2 text-sm font-semibold text-neutral-700">Steps</h2>
      <ol className="space-y-3">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 space-y-2">
        <PrimaryButton
          variant={isSaved ? 'secondary' : 'primary'}
          onClick={() => setIsSaved((s) => !s)}
        >
          {isSaved ? '✓ Saved' : '♡ Save recipe'}
        </PrimaryButton>
        <PrimaryButton variant="secondary" onClick={onStartOver}>
          Start over
        </PrimaryButton>
      </div>
    </StepShell>
  );
}
