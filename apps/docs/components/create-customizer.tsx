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
import { Field, FieldLabel } from "@multiclubes/ui/components/field";
import { Input } from "@multiclubes/ui/components/input";
import { Popover, PopoverContent, PopoverTrigger } from "@multiclubes/ui/components/popover";
import { DownloadSimpleIcon, FileCodeIcon, FileCssIcon } from "@phosphor-icons/react";
import * as React from "react";
import { CreateBoard } from "@/components/create-previews";
import { PALETTES } from "@/lib/create-palettes";
import {
  type ChoiceOptions,
  choicesFromSearch,
  choicesToSearch,
  editUrlFromFile,
  type ThemeChoices,
  themeFile,
  themeFileName,
} from "@/lib/create-theme-file";
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
  const defaults: ThemeChoices = {
    cliente: "",
    cor: DEFAULT_COLOR,
    graficos: DEFAULT_COLOR,
    raio: DEFAULT_RADIUS,
    fonte: defaultFont.name,
    titulos: SAME_FONT,
  };
  const options: ChoiceOptions = {
    colors: COLORS.map((entry) => entry.name),
    charts: CHART_COLORS.map((entry) => entry.name),
    radii: RADII,
    fonts: fonts.map((font) => font.name),
  };
  const [choices, setChoices] = React.useState<ThemeChoices>(defaults);
  // A URL só é escrita depois de lida: senão, o tema padrão apagaria os parâmetros com que
  // a página foi aberta.
  const [ready, setReady] = React.useState(false);
  const [editUrl, setEditUrl] = React.useState("");
  const { cliente, cor: colorName, graficos: chartName, raio: radius, fonte: fontName } = choices;
  const headingName = choices.titulos;
  const choose = (key: keyof ThemeChoices) => (value: string) =>
    setChoices((current) => ({ ...current, [key]: value }));

  // biome-ignore lint/correctness/useExhaustiveDependencies: lê a URL só ao abrir a página.
  React.useEffect(() => {
    setChoices(choicesFromSearch(window.location.search, options, defaults));
    setReady(true);
  }, []);

  const [openError, setOpenError] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  /** Restaura as escolhas a partir do link "Editar:" de um arquivo gerado aqui. */
  async function openThemeFile(file: File) {
    const url = editUrlFromFile(await file.text());
    let search: string | null = null;
    try {
      search = url ? new URL(url).search : null;
    } catch {
      search = null;
    }
    if (search === null) {
      setOpenError(true);
      return;
    }
    setOpenError(false);
    setChoices(choicesFromSearch(search, options, defaults));
  }

  React.useEffect(() => {
    if (!ready) return;
    const search = choicesToSearch(choices);
    window.history.replaceState(null, "", `?${search}`);
    setEditUrl(`${window.location.origin}${window.location.pathname}?${search}`);
  }, [choices, ready]);

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
    // biome-ignore lint/a11y/noStaticElementInteractions: soltar o arquivo é atalho de mouse; o botão "Abrir tema" faz o mesmo pelo teclado.
    <div
      data-slot="create"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) event.preventDefault();
      }}
      onDrop={(event) => {
        const file = event.dataTransfer.files[0];
        if (!file) return;
        event.preventDefault();
        void openThemeFile(file);
      }}
      className="flex flex-1 flex-col gap-4 p-4 lg:h-[calc(100svh-var(--header-height))] lg:flex-none lg:flex-row lg:pt-0"
    >
      <aside className="flex shrink-0 flex-col overflow-hidden rounded-surface border bg-card lg:w-72">
        <div className="border-b px-4 py-3">
          <h1 className="text-sm font-medium">Tema</h1>
          <p className="text-xs text-muted-foreground">Cores, fontes e arredondamento.</p>
        </div>
        <div className="flex flex-col gap-2 p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <Field className="gap-1.5 px-1 pb-1">
            <FieldLabel htmlFor="create-cliente" className="text-xs text-muted-foreground">
              Nome do cliente
            </FieldLabel>
            <Input
              id="create-cliente"
              value={cliente}
              maxLength={80}
              placeholder="Ex.: Flamengo"
              onChange={(event) => choose("cliente")(event.target.value)}
            />
          </Field>
          <ColorRow label="Cor" color={color} presets={COLORS} onPreset={choose("cor")} />
          <ColorRow
            label="Gráficos"
            color={chart}
            presets={CHART_COLORS}
            onPreset={choose("graficos")}
          />
          <Picker
            label="Arredondamento"
            value={radius}
            onChange={choose("raio")}
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
            onChange={choose("fonte")}
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
            onChange={choose("titulos")}
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
        <div className="flex flex-col gap-2 border-t p-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => fileInput.current?.click()}>
              Abrir tema
            </Button>
            <ThemeDialog cliente={cliente} editUrl={editUrl} css={css} layout={layout} />
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".css,text/css"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void openThemeFile(file);
            }}
          />
          {openError && (
            <p role="alert" className="text-xs text-destructive">
              Este arquivo não foi gerado pelo Mosaico. Abra um tema baixado do /create.
            </p>
          )}
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

/** Data local no formato AAAA-MM-DD. */
function today() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function ThemeDialog({
  cliente,
  editUrl,
  css,
  layout,
}: {
  cliente: string;
  editUrl: string;
  css: string;
  layout: string | null;
}) {
  const fileName = themeFileName(cliente);
  const file = themeFile({ cliente, editUrl, css, date: today() });

  function download() {
    const url = URL.createObjectURL(new Blob([file], { type: "text/css" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Usar este tema</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Usar este tema</DialogTitle>
          <DialogDescription>
            Salve o arquivo no projeto do cliente e carregue-o depois do globals.css. O link no
            começo do arquivo reabre este tema aqui.
            {layout && " As fontes entram no layout, no lugar da Geist."}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={download} className="justify-self-start">
          <DownloadSimpleIcon data-icon="inline-start" />
          Baixar tema
        </Button>
        <Snippet title={fileName} icon={<FileCssIcon />} code={file} />
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
