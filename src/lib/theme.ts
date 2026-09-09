// Plain module (no "use client") so both the server-rendered inline script
// in layout.tsx and the client-side ThemeToggle can read the same literal —
// importing this constant from ThemeToggle.tsx directly would cross the
// client/server boundary and not resolve to its value.
export const THEME_STORAGE_KEY = 'leastcount_theme';
