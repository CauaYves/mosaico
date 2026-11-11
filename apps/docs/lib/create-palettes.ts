// Gerado a partir das cores do Tailwind (tailwindcss/theme.css). Os valores são copiados, e
// não var(--color-*), para o CSS exportado no /create funcionar sozinho. O primary é o tom
// mais claro em que o texto branco tem contraste AA (4,5:1); red e orange foram fixados à mão.

export type Palette = {
  name: string;
  /** primary, primary-foreground e ring nos modos claro e escuro. */
  light: Record<string, string>;
  dark: Record<string, string>;
  /** --chart-brand nos modos claro e escuro. */
  chart: { light: string; dark: string };
  /** Amostra do seletor. */
  swatch: string;
};

export const PALETTES: Palette[] = [
  {
    name: "red",
    light: {
      primary: "oklch(0.505 0.213 27.518)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(63.7% 0.237 25.331)",
    },
    dark: {
      primary: "oklch(0.505 0.213 27.518)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(63.7% 0.237 25.331)",
    },
    chart: { light: "oklch(0.505 0.213 27.518)", dark: "oklch(70.4% 0.191 22.216)" },
    swatch: "oklch(0.505 0.213 27.518)",
  },
  {
    name: "orange",
    light: {
      primary: "oklch(0.553 0.195 38.402)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(70.5% 0.213 47.604)",
    },
    dark: {
      primary: "oklch(0.553 0.195 38.402)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(70.5% 0.213 47.604)",
    },
    chart: { light: "oklch(0.553 0.195 38.402)", dark: "oklch(75% 0.183 55.934)" },
    swatch: "oklch(0.553 0.195 38.402)",
  },
  {
    name: "amber",
    light: {
      primary: "oklch(55.5% 0.163 48.998)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(76.9% 0.188 70.08)",
    },
    dark: {
      primary: "oklch(55.5% 0.163 48.998)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(76.9% 0.188 70.08)",
    },
    chart: { light: "oklch(66.6% 0.179 58.318)", dark: "oklch(82.8% 0.189 84.429)" },
    swatch: "oklch(55.5% 0.163 48.998)",
  },
  {
    name: "green",
    light: {
      primary: "oklch(52.7% 0.154 150.069)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(72.3% 0.219 149.579)",
    },
    dark: {
      primary: "oklch(52.7% 0.154 150.069)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(72.3% 0.219 149.579)",
    },
    chart: { light: "oklch(62.7% 0.194 149.214)", dark: "oklch(79.2% 0.209 151.711)" },
    swatch: "oklch(52.7% 0.154 150.069)",
  },
  {
    name: "teal",
    light: {
      primary: "oklch(51.1% 0.096 186.391)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(70.4% 0.14 182.503)",
    },
    dark: {
      primary: "oklch(51.1% 0.096 186.391)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(70.4% 0.14 182.503)",
    },
    chart: { light: "oklch(60% 0.118 184.704)", dark: "oklch(77.7% 0.152 181.912)" },
    swatch: "oklch(51.1% 0.096 186.391)",
  },
  {
    name: "sky",
    light: {
      primary: "oklch(50% 0.134 242.749)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(68.5% 0.169 237.323)",
    },
    dark: {
      primary: "oklch(50% 0.134 242.749)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(68.5% 0.169 237.323)",
    },
    chart: { light: "oklch(58.8% 0.158 241.966)", dark: "oklch(74.6% 0.16 232.661)" },
    swatch: "oklch(50% 0.134 242.749)",
  },
  {
    name: "violet",
    light: {
      primary: "oklch(54.1% 0.281 293.009)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(60.6% 0.25 292.717)",
    },
    dark: {
      primary: "oklch(54.1% 0.281 293.009)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(60.6% 0.25 292.717)",
    },
    chart: { light: "oklch(54.1% 0.281 293.009)", dark: "oklch(70.2% 0.183 293.541)" },
    swatch: "oklch(54.1% 0.281 293.009)",
  },
  {
    name: "pink",
    light: {
      primary: "oklch(59.2% 0.249 0.584)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(65.6% 0.241 354.308)",
    },
    dark: {
      primary: "oklch(59.2% 0.249 0.584)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(65.6% 0.241 354.308)",
    },
    chart: { light: "oklch(59.2% 0.249 0.584)", dark: "oklch(71.8% 0.202 349.761)" },
    swatch: "oklch(59.2% 0.249 0.584)",
  },
];
