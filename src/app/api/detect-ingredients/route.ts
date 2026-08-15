import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, VISION_MODEL, extractJson } from '@/lib/anthropic';
import type { CaptureCategory, Ingredient, IngredientCategory } from '@/types';

const SYSTEM_PROMPT = `You are analyzing photos of a refrigerator, freezer, or pantry.
Identify every visible food ingredient. Be specific — "red bell
pepper" not "pepper", "greek yogurt" not "yogurt" if the label is
readable. Ignore non-food items and packaging you can't identify.

Return ONLY valid JSON, no other text:
[{"name": string, "category": "produce"|"dairy"|"protein"|"pantry"|"spice"|"other", "confidence": number}]`;

interface IncomingPhoto {
  category: CaptureCategory;
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
}

interface DetectedIngredient {
  name: string;
  category: IngredientCategory;
  confidence: number;
}

export async function POST(req: NextRequest) {
  try {
    const { photos } = (await req.json()) as { photos: IncomingPhoto[] };

    if (!photos?.length) {
      return NextResponse.json({ ingredients: [] as Ingredient[] });
    }

    const client = getAnthropicClient();

    // One call per category keeps the model's attention on a clean, labeled
    // batch of photos rather than a mixed pile — matches the spec's guided
    // multi-shot rationale.
    const byCategory = new Map<CaptureCategory, IncomingPhoto[]>();
    for (const photo of photos) {
      const list = byCategory.get(photo.category) ?? [];
      list.push(photo);
      byCategory.set(photo.category, list);
    }

    const results = await Promise.all(
      Array.from(byCategory.entries()).map(async ([category, group]) => {
        const message = await client.messages.create({
          model: VISION_MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `These photos are all of the ${category}.`,
                },
                ...group.map((photo) => ({
                  type: 'image' as const,
                  source: {
                    type: 'base64' as const,
                    media_type: photo.mediaType,
                    data: photo.base64,
                  },
                })),
              ],
            },
          ],
        });

        const textBlock = message.content.find((b) => b.type === 'text');
        if (!textBlock || textBlock.type !== 'text') return [];

        try {
          return extractJson<DetectedIngredient[]>(textBlock.text);
        } catch {
          return [];
        }
      })
    );

    const ingredients: Ingredient[] = results.flat().map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      category: item.category,
      confidence: item.confidence,
      source: 'detected',
    }));

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('detect-ingredients failed', error);
    return NextResponse.json(
      { error: 'Failed to detect ingredients' },
      { status: 500 }
    );
  }
}
