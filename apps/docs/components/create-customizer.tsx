"use client";

import { Badge } from "@multiclubes/ui/components/badge";
import { Button } from "@multiclubes/ui/components/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@multiclubes/ui/components/code-block";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@multiclubes/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@multiclubes/ui/components/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@multiclubes/ui/components/popover";
import { FileCodeIcon, FileCssIcon } from "@phosphor-icons/react";
import * as React from "react";
import { CreateBoard } from "@/components/create-previews";
import { PALETTES } from "@/lib/create-palettes";
import type { CreateFont } from "@/lib/fonts";

type Color = {
  name: string;
  /** Amostra mostrada no seletor. */
  swatch: string;
  light?: Record<string, string>;
  dark?: Record<string, string>;
};

// "blue" é a cor do próprio tema (packages/ui/src/styles/globals.css): não gera nada para
// sobrescrever. Entra entre sky e violet, na ordem do círculo de cores.
const DEFAULT_COLOR = "blue";

/** Insere a cor do tema ("blue") antes de violet. */
function withDefault(entries: Color[], theme: Color) {
  const index = entries.findIndex((entry) => entry.name === "violet");
  if (index < 0) return [...entries, theme];
  return [...entries.slice(0, index), theme, ...entries.slice(index)];
}

// Cores do primary: as paletas do Tailwind (lib/create-palettes.ts) e a do tema.
const COLORS: Color[] = withDefault(
  PALETTES.map(({ name, swatch, light, dark }) => ({ name, swatch, light, dark })),
  { name: DEFAULT_COLOR, swatch: "oklch(0.44 0.213 263)" },
);

// Cores dos gráficos, independentes do primary, das mesmas paletas. "blue" é o --chart-brand do
// tema (azul no claro, amarelo no escuro).
const CHART_COLORS: Color[] = withDefault(
  PALETTES.map(({ name, chart }) => ({
    name,
    swatch: chart.light,
    light: { "chart-brand": chart.light },
    dark: { "chart-brand": chart.dark },
  })),
  { name: DEFAULT_COLOR, swatch: "#0540c5" },
);

const DEFAULT_RADIUS = "0.625";
const RADII = ["0", "0.3", "0.5", "0.625", "0.75", "1"];

const CHART_SCALE_CSS = `[data-create-preview] {
  --chart-1: var(--chart-brand);
  --chart-2: color-mix(in oklab, var(--chart-brand) 75%, var(--background));
  --chart-3: color-mix(in oklab, var(--chart-brand) 55%, var(--background));
  --chart-4: color-mix(in oklab, var(--chart-brand) 35%, var(--background));
  --chart-5: color-mix(in oklab, var(--chart-brand) 20%, var(--background));
}`;

/** Valor de "Títulos" que segue a fonte do texto. */
const SAME_FONT = "";

function block(selector: string, vars: Record<string, string>) {
  const lines = Object.entries(vars).map(([name, value]) => `  --${name}: ${value};`);
  return lines.length ? `${selector} {\n${lines.join("\n")}\n}` : "";
}

/** CSS com o que muda em relação ao tema padrão. */
function themeCss(color: Color, chart: Color, radius: string, root = ":root", dark = ".dark") {
  // Os gráficos têm cor própria (--chart-brand), escolhida à parte: trocar a cor do tema não
  // mexe neles.
  const rootVars = {
    ...(radius !== DEFAULT_RADIUS && { radius: `${radius}rem` }),
    ...color.light,
    ...chart.light,
  };
  return [block(root, rootVars), block(dark, { ...color.dark, ...chart.dark })]
    .filter(Boolean)
    .join("\n\n");
}

/** Trecho do app/layout.tsx que carrega as fontes escolhidas, ou null se nada muda. */
function layoutCode(sans: CreateFont, heading: CreateFont | null, defaultFont: CreateFont) {
  const fonts: [string, CreateFont, string][] = [];
  if (sans !== defaultFont) fonts.push(["fontSans", sans, "--font-sans"]);
  if (heading && heading !== sans) fonts.push(["fontHeading", heading, "--heading-font"]);
  if (fonts.length === 0) return null;

  const loaders = [...new Set(fonts.map(([, font]) => font.loader))].join(", ");
  return [
    `import { ${loaders} } from "next/font/google";`,
    "",
    ...fonts.map(
      ([name, font, variable]) =>
        `const ${name} = ${font.loader}({ subsets: ["latin"], variable: "${variable}" });`,
    ),
    "",
    "// No <html> do RootLayout:",
    `<html lang="pt-BR" className={\`${fonts.map(([name]) => `\${${name}.variable}`).join(" ")}\`}>`,
  ].join("\n");
}

export function CreateCustomizer({ fonts }: { fonts: CreateFont[] }) {
  const defaultFont = fonts[0] as CreateFont;
  const [colorName, setColorName] = React.useState(DEFAULT_COLOR);
  const [chartName, setChartName] = React.useState(DEFAULT_COLOR);
  const [radius, setRadius] = React.useState(DEFAULT_RADIUS);
  const [fontName, setFontName] = React.useState(defaultFont.name);
  const [headingName, setHeadingName] = React.useState(SAME_FONT);

  const color = COLORS.find((entry) => entry.name === colorName) as Color;
  const chart = CHART_COLORS.find((entry) => entry.name === chartName) as Color;
  const sans = fonts.find((entry) => entry.name === fontName) ?? defaultFont;
  const heading = fonts.find((entry) => entry.name === headingName) ?? null;

  const css = themeCss(color, chart, radius) || "/* Tema padrão: não há nada para sobrescrever. */";
  const layout = layoutCode(sans, heading, defaultFont);
  // A prévia recebe o mesmo tema, com os seletores restritos a ela. --surface-radius e
  // --heading-font são calculados no :root, então precisam ser recalculados aqui.
  const previewCss = [
    `[data-create-preview] { --surface-radius: calc(var(--radius) * 3.2); font-family: ${sans.family}; --heading-font: ${(heading ?? sans).family}; }`,
    // --chart-1..5 derivam de --chart-brand no :root; redeclarados aqui para seguirem a cor
    // de gráficos escolhida só dentro da prévia.
    CHART_SCALE_CSS,
    themeCss(color, chart, radius, "[data-create-preview]", ".dark [data-create-preview]"),
  ].join("\n");

  return (
    <div
      data-slot="create"
      className="flex flex-1 flex-col gap-4 p-4 lg:h-[calc(100svh-var(--header-height))] lg:flex-none lg:flex-row lg:pt-0"
    >
      <aside className="flex shrink-0 flex-col overflow-hidden rounded-surface border bg-card lg:w-72">
        <div className="border-b px-4 py-3">
          <h1 className="text-sm font-medium">Tema</h1>
          <p className="text-xs text-muted-foreground">Cores, fontes e arredondamento.</p>
        </div>
        <div className="flex flex-col gap-2 p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <ColorRow label="Cor" color={color} presets={COLORS} onPreset={setColorName} />
          <ColorRow label="Gráficos" color={chart} presets={CHART_COLORS} onPreset={setChartName} />
          <Picker
            label="Arredondamento"
            value={radius}
            onChange={setRadius}
            display={`${radius} rem`}
            indicator={
              <span
                className="size-4 border-t-2 border-r-2 border-foreground"
                style={{ borderTopRightRadius: `${Number(radius) * 10}px` }}
              />
            }
            options={RADII.map((value) => ({
              value,
              label: value === DEFAULT_RADIUS ? `${value} rem (padrão)` : `${value} rem`,
            }))}
          />
          <Picker
            label="Fonte"
            value={fontName}
            onChange={setFontName}
            indicator={<span style={{ fontFamily: sans.family }}>Aa</span>}
            group="Sans"
            options={fonts.map((font) => ({
              value: font.name,
              label: font.name,
              note: font.note,
              style: { fontFamily: font.family },
            }))}
          />
          <Picker
            label="Títulos"
            value={headingName}
            onChange={setHeadingName}
            display={heading?.name ?? "Igual ao texto"}
            indicator={<span style={{ fontFamily: (heading ?? sans).family }}>Aa</span>}
            group="Sans"
            options={[
              { value: SAME_FONT, label: "Igual ao texto" },
              ...fonts.map((font) => ({
                value: font.name,
                label: font.name,
                note: font.note,
                style: { fontFamily: font.family },
              })),
            ]}
          />
        </div>
        <div className="border-t p-3">
          <ThemeDialog css={css} layout={layout} />
        </div>
      </aside>
      <section aria-label="Prévia" className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="truncate text-sm font-medium">Prévia</h2>
            <p className="truncate text-xs text-muted-foreground">
              Role o quadro na horizontal e na vertical para ver todos os componentes.
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Dados ilustrativos
          </Badge>
        </div>
        <style>{previewCss}</style>
        {/* O quadro é mais largo que a tela: a caixa rola nos dois sentidos, e os componentes
            ficam no próprio tamanho em vez de se espremerem em colunas. */}
        <div
          data-create-preview
          className="h-[75svh] overflow-auto overscroll-contain rounded-surface border bg-muted/40 lg:h-auto lg:min-h-0 lg:flex-1"
        >
          <CreateBoard />
        </div>
      </section>
    </div>
  );
}

type PickerOption = {
  value: string;
  label: string;
  note?: string;
  style?: React.CSSProperties;
};

const ROW_CLASS =
  "flex w-full items-center gap-3 rounded-field border bg-background px-3 py-2 text-left transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-accent";

function RowContent({
  label,
  value,
  indicator,
}: {
  label: string;
  value: string;
  indicator: React.ReactNode;
}) {
  return (
    <>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium">{value}</span>
      </span>
      <span aria-hidden className="flex shrink-0 items-center text-base font-medium">
        {indicator}
      </span>
    </>
  );
}

/** Linha de cor ("Cor", "Gráficos"): abre as cores pré-definidas. */
function ColorRow({
  label,
  color,
  presets,
  onPreset,
}: {
  label: string;
  color: Color;
  presets: Color[];
  onPreset: (name: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger render={<button type="button" className={ROW_CLASS} />}>
        <RowContent
          label={label}
          value={color.name}
          indicator={
            <span
              className="size-4 rounded-full ring-1 ring-foreground/10"
              style={{ backgroundColor: color.swatch }}
            />
          }
        />
      </PopoverTrigger>
      <PopoverContent side="right" align="start" sideOffset={8} className="w-auto">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((entry) => (
              <button
                key={entry.name}
                type="button"
                title={entry.name}
                aria-label={entry.name}
                aria-pressed={entry.name === color.name}
                onClick={() => onPreset(entry.name)}
                className="size-7 rounded-full ring-1 ring-foreground/10 ring-offset-2 ring-offset-popover outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-foreground"
                style={{ backgroundColor: entry.swatch }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Linha do aside: rótulo e valor atual, abre um menu com as opções. */
function Picker({
  label,
  value,
  display,
  indicator,
  options,
  group,
  onChange,
}: {
  label: string;
  value: string;
  /** Texto do valor atual, quando difere do rótulo da opção. */
  display?: string;
  indicator: React.ReactNode;
  options: PickerOption[];
  group?: string;
  onChange: (value: string) => void;
}) {
  const current = display ?? options.find((option) => option.value === value)?.label ?? value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" className={ROW_CLASS} />}>
        <RowContent label={label} value={current} indicator={indicator} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-52">
        <DropdownMenuGroup>
          {group && <DropdownMenuLabel>{group}</DropdownMenuLabel>}
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} style={option.style}>
                {option.label}
                {option.note && (
                  <span className="ml-auto text-xs text-muted-foreground">{option.note}</span>
                )}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeDialog({ css, layout }: { css: string; layout: string | null }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button className="w-full" />}>Usar este tema</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Usar este tema</DialogTitle>
          <DialogDescription>
            Cole o CSS no CSS global da aplicação, depois do import do tema do Mosaico.
            {layout && " As fontes entram no layout, no lugar da Geist."}
          </DialogDescription>
        </DialogHeader>
        <Snippet title="app/globals.css" icon={<FileCssIcon />} code={css} />
        {layout && <Snippet title="app/layout.tsx" icon={<FileCodeIcon />} code={layout} />}
      </DialogContent>
    </Dialog>
  );
}

function Snippet({ title, icon, code }: { title: string; icon: React.ReactNode; code: string }) {
  return (
    <CodeBlock>
      <CodeBlockHeader>
        <CodeBlockTitle>
          {icon}
          {title}
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{code}</CodeBlockContent>
    </CodeBlock>
  );
}
