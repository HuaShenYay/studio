'use client';

import { useEffect, useState } from 'react';
import { morandiColorPalettes } from '@/lib/colors';
import type { ColorPalette } from '@/lib/colors';

export const ColorSchemeLoader = () => {
  const [palette, setPalette] = useState<ColorPalette | null>(null);

  useEffect(() => {
    const randomPalette = morandiColorPalettes[Math.floor(Math.random() * morandiColorPalettes.length)];
    setPalette(randomPalette);
  }, []);

  if (!palette) {
    return null;
  }

  const cssVariables = `
    :root {
      --background: ${palette.light.background};
      --foreground: ${palette.light.foreground};
      --card: ${palette.light.card};
      --card-foreground: ${palette.light.cardForeground};
      --popover: ${palette.light.popover};
      --popover-foreground: ${palette.light.popoverForeground};
      --primary: ${palette.light.primary};
      --primary-foreground: ${palette.light.primaryForeground};
      --secondary: ${palette.light.secondary};
      --secondary-foreground: ${palette.light.secondaryForeground};
      --muted: ${palette.light.muted};
      --muted-foreground: ${palette.light.mutedForeground};
      --accent: ${palette.light.accent};
      --accent-foreground: ${palette.light.accentForeground};
      --destructive: ${palette.light.destructive};
      --destructive-foreground: ${palette.light.destructiveForeground};
      --border: ${palette.light.border};
      --input: ${palette.light.input};
      --ring: ${palette.light.ring};
    }
    .dark {
      --background: ${palette.dark.background};
      --foreground: ${palette.dark.foreground};
      --card: ${palette.dark.card};
      --card-foreground: ${palette.dark.cardForeground};
      --popover: ${palette.dark.popover};
      --popover-foreground: ${palette.dark.popoverForeground};
      --primary: ${palette.dark.primary};
      --primary-foreground: ${palette.dark.primaryForeground};
      --secondary: ${palette.dark.secondary};
      --secondary-foreground: ${palette.dark.secondaryForeground};
      --muted: ${palette.dark.muted};
      --muted-foreground: ${palette.dark.mutedForeground};
      --accent: ${palette.dark.accent};
      --accent-foreground: ${palette.dark.accentForeground};
      --destructive: ${palette.dark.destructive};
      --destructive-foreground: ${palette.dark.destructiveForeground};
      --border: ${palette.dark.border};
      --input: ${palette.dark.input};
      --ring: ${palette.dark.ring};
    }
  `;

  return <style>{cssVariables}</style>;
};
