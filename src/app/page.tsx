'use client';

import { useState } from 'react';
import CaptureScreen from '@/components/CaptureScreen';
import ConfirmScreen from '@/components/ConfirmScreen';
import PreferencesScreen from '@/components/PreferencesScreen';
import ResultsScreen from '@/components/ResultsScreen';
import RecipeDetailScreen from '@/components/RecipeDetailScreen';
import type { Ingredient, Recipe } from '@/types';

type Step = 'capture' | 'confirm' | 'preferences' | 'results' | 'detail';

export default function Home() {
  const [step, setStep] = useState<Step>('capture');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  function startOver() {
    setStep('capture');
    setIngredients([]);
    setRecipes([]);
    setSelectedRecipe(null);
  }

  switch (step) {
    case 'capture':
      return (
        <CaptureScreen
          onComplete={(detected) => {
            setIngredients(detected);
            setStep('confirm');
          }}
        />
      );

    case 'confirm':
      return (
        <ConfirmScreen
          ingredients={ingredients}
          onBack={() => setStep('capture')}
          onContinue={(confirmed) => {
            setIngredients(confirmed);
            setStep('preferences');
          }}
        />
      );

    case 'preferences':
      return (
        <PreferencesScreen
          ingredients={ingredients}
          onBack={() => setStep('confirm')}
          onContinue={(generated) => {
            setRecipes(generated);
            setStep('results');
          }}
        />
      );

    case 'results':
      return (
        <ResultsScreen
          recipes={recipes}
          onBack={() => setStep('preferences')}
          onSelect={(recipe) => {
            setSelectedRecipe(recipe);
            setStep('detail');
          }}
        />
      );

    case 'detail':
      if (!selectedRecipe) {
        setStep('results');
        return null;
      }
      return (
        <RecipeDetailScreen
          recipe={selectedRecipe}
          onBack={() => setStep('results')}
          onStartOver={startOver}
        />
      );
  }
}
