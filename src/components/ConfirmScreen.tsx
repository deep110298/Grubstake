'use client';

import { useState } from 'react';
import StepShell from './StepShell';
import PrimaryButton from './PrimaryButton';
import type { Ingredient, IngredientCategory } from '@/types';

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  produce: 'Produce',
  dairy: 'Dairy',
  protein: 'Protein',
  pantry: 'Pantry',
  spice: 'Spices',
  other: 'Other',
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'produce',
  'protein',
  'dairy',
  'pantry',
  'spice',
  'other',
];

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
  onContinue: (ingredients: Ingredient[]) => void;
}

export default function ConfirmScreen({ ingredients: initial, onBack, onContinue }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initial);
  const [newName, setNewName] = useState('');

  function updateName(id: string, name: string) {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  }

  function remove(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  function addManual() {
    const name = newName.trim();
    if (!name) return;
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, category: 'other', source: 'manual' },
    ]);
    setNewName('');
  }

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: ingredients.filter((i) => (i.category ?? 'other') === category),
  })).filter((g) => g.items.length > 0);

  return (
    <StepShell
      step={2}
      totalSteps={5}
      title="Confirm ingredients"
      subtitle="Fix anything the camera misread, and add what's not visible."
      onBack={onBack}
      footer={
        <PrimaryButton onClick={() => onContinue(ingredients)} disabled={ingredients.length === 0}>
          Continue
        </PrimaryButton>
      }
    >
      {ingredients.length === 0 && (
        <p className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-500">
          No ingredients yet — add what you have below.
        </p>
      )}

      <div className="space-y-5">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <h2 className="mb-2 text-sm font-semibold text-neutral-500">
              {CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    value={item.name}
                    onChange={(e) => updateName(item.id, e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-red-600"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManual()}
          placeholder="e.g. cumin, soy sauce"
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={addManual}
          className="shrink-0 rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-300"
        >
          + Add
        </button>
      </div>
    </StepShell>
  );
}
