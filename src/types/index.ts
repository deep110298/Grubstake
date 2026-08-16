export type IngredientCategory =
  | 'produce'
  | 'dairy'
  | 'protein'
  | 'pantry'
  | 'spice'
  | 'other';

export type CaptureCategory = 'fridge' | 'freezer' | 'pantry';

export interface Ingredient {
  id: string;
  name: string;
  category?: IngredientCategory;
  confidence?: number; // from vision detection, 0-1
  source: 'detected' | 'manual';
}

export type DietType = 'veg' | 'non_veg' | 'vegan' | 'eggetarian';
export type TimeAvailable = 'quick' | 'moderate' | 'no_rush';
export type Equipment =
  | 'stovetop'
  | 'oven'
  | 'air_fryer'
  | 'instant_pot'
  | 'microwave';
export type SpiceLevel = 'mild' | 'medium' | 'hot';

export interface Preferences {
  cuisine: string; // or 'surprise_me'
  dietType: DietType;
  allergies: string[]; // MUST be respected strictly
  servings: number;
  timeAvailable?: TimeAvailable;
  equipment?: Equipment[];
  spiceLevel?: SpiceLevel;
  excludeIngredients?: string[];
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  haveOnHand: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  matchScore: number; // 0-100
  missingIngredients: string[];
  servings: number;
  timeMinutes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  imageUrl?: string; // from the generation response; omitted falls back to a placeholder
}

export interface CapturedPhoto {
  id: string;
  category: CaptureCategory;
  dataUrl: string; // for local preview
  base64: string; // stripped of data: prefix, sent to API
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}
