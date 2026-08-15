'use client';

import { useState } from 'react';
import StepShell from './StepShell';
import PrimaryButton from './PrimaryButton';
import type {
  DietType,
  Equipment,
  Ingredient,
  Preferences,
  Recipe,
  SpiceLevel,
  TimeAvailable,
} from '@/types';

const CUISINES = [
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Thai',
  'Japanese',
  'Mediterranean',
  'American',
  'French',
  'Korean',
];

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non-veg' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'eggetarian', label: 'Eggetarian' },
];

const ALLERGY_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Egg'];

const TIME_OPTIONS: { value: TimeAvailable; label: string }[] = [
  { value: 'quick', label: 'Quick (<20 min)' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'no_rush', label: 'No rush' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'stovetop', label: 'Stovetop' },
  { value: 'oven', label: 'Oven' },
  { value: 'air_fryer', label: 'Air fryer' },
  { value: 'instant_pot', label: 'Instant Pot' },
  { value: 'microwave', label: 'Microwave-only' },
];

const SPICE_OPTIONS: { value: SpiceLevel; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Hot' },
];

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        selected
          ? 'border-accent bg-accent text-accent-foreground'
          : 'border-neutral-300 bg-white text-neutral-700 hover:border-accent'
      }`}
    >
      {children}
    </button>
  );
}

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
  onContinue: (recipes: Recipe[], preferences: Preferences) => void;
}

export default function PreferencesScreen({ ingredients, onBack, onContinue }: Props) {
  const [cuisine, setCuisine] = useState('surprise_me');
  const [dietType, setDietType] = useState<DietType>('veg');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyText, setAllergyText] = useState('');
  const [servings, setServings] = useState(2);
  const [showMore, setShowMore] = useState(false);
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable | undefined>();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel | undefined>();
  const [excludeText, setExcludeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAllergy(label: string) {
    setAllergies((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  }

  function toggleEquipment(value: Equipment) {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  }

  async function handleContinue() {
    const freeTextAllergies = allergyText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const preferences: Preferences = {
      cuisine,
      dietType,
      allergies: [...allergies.map((a) => a.toLowerCase()), ...freeTextAllergies],
      servings,
      timeAvailable,
      equipment: equipment.length ? equipment : undefined,
      spiceLevel,
      excludeIngredients: excludeText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, preferences }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as { recipes: Recipe[] };
      onContinue(data.recipes, preferences);
    } catch {
      setError("Couldn't generate recipes. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <StepShell
      step={3}
      totalSteps={5}
      title="Your preferences"
      onBack={onBack}
      footer={
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <PrimaryButton onClick={handleContinue} loading={isGenerating}>
            Find recipes
          </PrimaryButton>
        </div>
      }
    >
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Cuisine</h2>
        <div className="flex flex-wrap gap-2">
          <Chip selected={cuisine === 'surprise_me'} onClick={() => setCuisine('surprise_me')}>
            Surprise me
          </Chip>
          {CUISINES.map((c) => (
            <Chip key={c} selected={cuisine === c} onClick={() => setCuisine(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Diet type</h2>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((opt) => (
            <Chip key={opt.value} selected={dietType === opt.value} onClick={() => setDietType(opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Allergies</h2>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => (
            <Chip key={a} selected={allergies.includes(a)} onClick={() => toggleAllergy(a)}>
              {a}
            </Chip>
          ))}
        </div>
        <input
          value={allergyText}
          onChange={(e) => setAllergyText(e.target.value)}
          placeholder="Other allergies, comma separated"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Servings</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 text-lg hover:bg-neutral-300"
          >
            −
          </button>
          <span className="w-6 text-center text-base font-medium">{servings}</span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(12, s + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 text-lg hover:bg-neutral-300"
          >
            +
          </button>
        </div>
      </section>

      <section className="mt-5">
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className="flex w-full items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700"
        >
          More options
          <span>{showMore ? '−' : '+'}</span>
        </button>

        {showMore && (
          <div className="mt-4 space-y-5">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-700">Time available</h3>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={timeAvailable === opt.value}
                    onClick={() => setTimeAvailable(timeAvailable === opt.value ? undefined : opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-700">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <Chip key={opt.value} selected={equipment.includes(opt.value)} onClick={() => toggleEquipment(opt.value)}>
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-700">Spice level</h3>
              <div className="flex flex-wrap gap-2">
                {SPICE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={spiceLevel === opt.value}
                    onClick={() => setSpiceLevel(spiceLevel === opt.value ? undefined : opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-700">Exclude</h3>
              <input
                value={excludeText}
                onChange={(e) => setExcludeText(e.target.value)}
                placeholder="e.g. cilantro (comma separated)"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </section>
    </StepShell>
  );
}
