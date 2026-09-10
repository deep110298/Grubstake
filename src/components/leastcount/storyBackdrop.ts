import type { CSSProperties } from 'react';

// Story Mode's map screens sit on the app's own plain canvas — the same
// background every other mode uses — with a single soft wild-accent glow
// near the top as the only Story-specific touch.
export const STORY_GLOW_STYLE: CSSProperties = {
  backgroundImage:
    'radial-gradient(480px 340px at 50% 0%, color-mix(in srgb, var(--wild) 10%, transparent), transparent 70%)',
};
