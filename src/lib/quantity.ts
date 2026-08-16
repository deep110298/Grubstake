// Countable units are whole things you buy or count out — you can't have
// 1.33 cloves of garlic. Everything else (cups, tbsp, g, ml…) is continuous
// and snaps to the nearest quarter instead.
const COUNTABLE_BASES = new Set([
  '',
  'medium',
  'large',
  'clove(s)',
  'thighs',
  'stalks',
  'sheet',
  'cube',
  'handful',
  'small handful',
]);

function pluralizeCountable(base: string, amount: number): string {
  if (base === 'clove(s)') return amount === 1 ? 'clove' : 'cloves';
  if (amount === 1) return base;
  if (base === 'sheet') return 'sheets';
  if (base === 'cube') return 'cubes';
  if (base === 'handful') return 'handfuls';
  if (base === 'small handful') return 'small handfuls';
  return base;
}

/**
 * Formats a recipe ingredient amount for display, scaled from the recipe's
 * authored servings to the servings the user actually wants.
 */
export function formatQuantity(amount: number, unit: string, scale: number): string {
  const scaled = amount * scale;
  const commaIndex = unit.indexOf(',');
  const base = (commaIndex === -1 ? unit : unit.slice(0, commaIndex)).trim();
  const suffix = commaIndex === -1 ? '' : unit.slice(commaIndex);

  let numberText: string;
  let unitText: string;

  if (COUNTABLE_BASES.has(base)) {
    const whole = Math.max(1, Math.ceil(scaled - 0.05));
    numberText = String(whole);
    unitText = pluralizeCountable(base, whole);
  } else {
    const quarters = Math.round(scaled * 4) / 4;
    const value = Math.max(0.25, quarters);
    numberText = value.toString();
    unitText = base === 'cup' && value > 1 ? 'cups' : base;
  }

  const unitPart = unitText ? ` ${unitText}` : '';
  return `${numberText}${unitPart}${suffix}`;
}
