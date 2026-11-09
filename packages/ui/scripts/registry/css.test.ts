import { readFileSync } from "node:fs";
import { join } from "node:path";
import { THEME_TYPE } from "./config.ts";
import { buildThemeItem, cssToRegistry, splitByItem } from "./css.ts";

test("regras, at-rules aninhadas e @apply", () => {
  expect(
    cssToRegistry(
      ":root { --primary: oklch(0.44 0.213 263); }\n@layer base { body { @apply bg-background text-foreground; } }",
    ),
  ).toEqual({
    ":root": { "--primary": "oklch(0.44 0.213 263)" },
    "@layer base": { body: { "@apply bg-background text-foreground": {} } },
  });
});

test("@import, @custom-variant e @source", () => {
  const out = cssToRegistry(
    '@import "tw-animate-css";\n@source "../";\n@custom-variant dark (&:is(.dark *));',
  );
  expect(out).toEqual({
    '@import "tw-animate-css"': {},
    "@custom-variant dark (&:is(.dark *))": {},
  });
});

test("keyframes, @utility e @supports aninhado", () => {
  const out = cssToRegistry(
    "@utility fluid-stagger { & > * { --fluid-index: 16; } @supports (x: y) { & > * { --fluid-index: 1; } } }",
  );
  expect(out).toEqual({
    "@utility fluid-stagger": {
      "& > *": { "--fluid-index": "16" },
      "@supports (x: y)": { "& > *": { "--fluid-index": "1" } },
    },
  });
});

test("seletor repetido junta as declarações e a última vence", () => {
  expect(cssToRegistry(":root { --a: 1; --b: 2; }\n:root { --b: 3; }")).toEqual({
    ":root": { "--a": "1", "--b": "3" },
  });
});

test("marcadores separam por item; o resto é theme", () => {
  const parts = splitByItem(
    "a{b:c}\n/* @registry brand-loader */\n@keyframes x{from{opacity:0}}\n/* @registry end */\nd{e:f}",
  );
  expect(Object.keys(parts).sort()).toEqual(["brand-loader", "theme"]);
  expect(parts["brand-loader"]).toContain("@keyframes x");
  expect(parts.theme).not.toContain("@keyframes x");
});

test("item do tema: tipo validado e dependências com faixa", () => {
  const item = buildThemeItem({ ":root": {} }, { shadcn: "4.22.1", "tw-animate-css": "^1.4.0" });
  expect(item).toMatchObject({
    name: "theme",
    type: THEME_TYPE,
    dependencies: ["shadcn@4.22.1", "tw-animate-css@^1.4.0"],
    css: { ":root": {} },
  });
  expect(() => buildThemeItem({}, {})).toThrow(/shadcn/);
});

const srcDir = join(import.meta.dirname, "../../src");

test("o globals.css real: theme tem :root, .dark e @theme inline, sem @source", () => {
  const parts = splitByItem(readFileSync(join(srcDir, "styles/globals.css"), "utf8"));
  const theme = cssToRegistry(parts.theme as string);
  expect(theme[":root"]).toMatchObject({
    "--primary": "oklch(0.44 0.213 263)",
    "--highlight": "oklch(0.914 0.191 101.4)",
  });
  expect(theme[".dark"]).toMatchObject({ "--primary": "oklch(0.62 0.2 263)" });
  expect(theme["@theme inline"]).toMatchObject({
    "--radius-field": "calc(var(--surface-radius) - var(--radius-step))",
  });
  expect(JSON.stringify(theme)).not.toContain("@source");
  expect(Object.keys(parts)).toEqual(
    expect.arrayContaining([
      "theme",
      "theme-toggle",
      "brand-loader",
      "mosaic-loader",
      "chart-donut",
    ]),
  );
});
