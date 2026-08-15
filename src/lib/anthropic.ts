import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// Vision quality matters most for ingredient detection; Sonnet handles both calls.
export const VISION_MODEL = 'claude-sonnet-5';
export const RECIPE_MODEL = process.env.RECIPE_MODEL || 'claude-sonnet-5';

export function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  const start = trimmed.search(/[[{]/);
  const end = Math.max(trimmed.lastIndexOf(']'), trimmed.lastIndexOf('}'));
  const jsonSlice =
    start >= 0 && end >= start ? trimmed.slice(start, end + 1) : trimmed;
  return JSON.parse(jsonSlice) as T;
}
