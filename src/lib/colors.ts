export interface ColorTheme {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ColorPalette {
  name: string;
  light: ColorTheme;
  dark: ColorTheme;
}

export const morandiColorPalettes: ColorPalette[] = [
  {
    name: 'Dusty Rose',
    light: {
      background: '4 33% 96%',
      foreground: '358 28% 18%',
      card: '4 33% 93%',
      cardForeground: '358 28% 18%',
      popover: '4 33% 93%',
      popoverForeground: '358 28% 18%',
      primary: '357 41% 51%',
      primaryForeground: '0 0% 100%',
      secondary: '357 24% 86%',
      secondaryForeground: '358 28% 18%',
      muted: '357 24% 92%',
      mutedForeground: '358 12% 45%',
      accent: '357 32% 76%',
      accentForeground: '358 28% 18%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '357 24% 88%',
      input: '357 24% 90%',
      ring: '357 41% 51%',
    },
    dark: {
      background: '358 28% 10%',
      foreground: '4 33% 97%',
      card: '358 28% 13%',
      cardForeground: '4 33% 97%',
      popover: '358 28% 13%',
      popoverForeground: '4 33% 97%',
      primary: '357 41% 61%',
      primaryForeground: '358 28% 10%',
      secondary: '357 24% 22%',
      secondaryForeground: '4 33% 97%',
      muted: '357 24% 18%',
      mutedForeground: '4 33% 70%',
      accent: '357 32% 40%',
      accentForeground: '4 33% 97%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '357 24% 25%',
      input: '357 24% 27%',
      ring: '357 41% 61%',
    },
  },
  {
    name: 'Sage Green',
    light: {
      background: '100 20% 96%',
      foreground: '100 10% 20%',
      card: '100 20% 93%',
      cardForeground: '100 10% 20%',
      popover: '100 20% 93%',
      popoverForeground: '100 10% 20%',
      primary: '110 25% 45%',
      primaryForeground: '100 20% 98%',
      secondary: '100 15% 85%',
      secondaryForeground: '100 10% 20%',
      muted: '100 15% 92%',
      mutedForeground: '100 8% 45%',
      accent: '105 20% 75%',
      accentForeground: '100 10% 20%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '100 15% 88%',
      input: '100 15% 90%',
      ring: '110 25% 45%',
    },
    dark: {
      background: '100 10% 12%',
      foreground: '100 20% 97%',
      card: '100 10% 15%',
      cardForeground: '100 20% 97%',
      popover: '100 10% 15%',
      popoverForeground: '100 20% 97%',
      primary: '110 25% 55%',
      primaryForeground: '100 10% 12%',
      secondary: '100 15% 25%',
      secondaryForeground: '100 20% 97%',
      muted: '100 15% 20%',
      mutedForeground: '100 20% 70%',
      accent: '105 20% 35%',
      accentForeground: '100 20% 97%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '100 15% 28%',
      input: '100 15% 30%',
      ring: '110 25% 55%',
    },
  },
  {
    name: 'Misty Blue',
    light: {
      background: '210 40% 97%',
      foreground: '215 25% 15%',
      card: '210 40% 94%',
      cardForeground: '215 25% 15%',
      popover: '210 40% 94%',
      popoverForeground: '215 25% 15%',
      primary: '210 45% 48%',
      primaryForeground: '210 40% 99%',
      secondary: '210 30% 88%',
      secondaryForeground: '215 25% 15%',
      muted: '210 30% 94%',
      mutedForeground: '215 15% 45%',
      accent: '210 35% 80%',
      accentForeground: '215 25% 15%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '210 30% 90%',
      input: '210 30% 92%',
      ring: '210 45% 48%',
    },
    dark: {
      background: '215 25% 10%',
      foreground: '210 40% 98%',
      card: '215 25% 13%',
      cardForeground: '210 40% 98%',
      popover: '215 25% 13%',
      popoverForeground: '210 40% 98%',
      primary: '210 45% 58%',
      primaryForeground: '215 25% 10%',
      secondary: '210 30% 22%',
      secondaryForeground: '210 40% 98%',
      muted: '210 30% 18%',
      mutedForeground: '210 40% 70%',
      accent: '210 35% 38%',
      accentForeground: '210 40% 98%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '210 30% 25%',
      input: '210 30% 27%',
      ring: '210 45% 58%',
    },
  },
  {
    name: 'Warm Taupe',
    light: {
      background: '25 25% 96%',
      foreground: '25 15% 20%',
      card: '25 25% 93%',
      cardForeground: '25 15% 20%',
      popover: '25 25% 93%',
      popoverForeground: '25 15% 20%',
      primary: '25 35% 50%',
      primaryForeground: '25 25% 98%',
      secondary: '25 20% 86%',
      secondaryForeground: '25 15% 20%',
      muted: '25 20% 92%',
      mutedForeground: '25 10% 45%',
      accent: '25 28% 78%',
      accentForeground: '25 15% 20%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '25 20% 88%',
      input: '25 20% 90%',
      ring: '25 35% 50%',
    },
    dark: {
      background: '25 15% 10%',
      foreground: '25 25% 97%',
      card: '25 15% 13%',
      cardForeground: '25 25% 97%',
      popover: '25 15% 13%',
      popoverForeground: '25 25% 97%',
      primary: '25 35% 60%',
      primaryForeground: '25 15% 10%',
      secondary: '25 20% 22%',
      secondaryForeground: '25 25% 97%',
      muted: '25 20% 18%',
      mutedForeground: '25 25% 70%',
      accent: '25 28% 38%',
      accentForeground: '25 25% 97%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '25 20% 25%',
      input: '25 20% 27%',
      ring: '25 35% 60%',
    },
  },
];
