// Converte o CSS do kit (globals.css) para o campo `css` dos itens do registry shadcn.
// Blocos marcados com /* @registry <item> */ ... /* @registry end */ vão para o item <item>;
// o resto vai para o tema.
import postcss, { type ChildNode } from "postcss";
import { THEME_TYPE } from "./config.ts";

type CssObject = { [key: string]: string | CssObject };

/** At-rules que só fazem sentido dentro do pacote. */
const DROPPED = new Set(["source"]);

function merge(target: CssObject, key: string, value: string | CssObject) {
  const current = target[key];
  if (typeof current === "object" && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) merge(current, k, v);
  } else {
    target[key] = value;
  }
}

function convert(nodes: ChildNode[]): CssObject {
  const out: CssObject = {};
  for (const node of nodes) {
    if (node.type === "decl") {
      merge(out, node.prop, node.value.replace(/\s+/g, " ").trim());
    } else if (node.type === "rule") {
      merge(out, node.selector.replace(/\s+/g, " ").trim(), convert(node.nodes));
    } else if (node.type === "atrule") {
      if (DROPPED.has(node.name)) continue;
      const key = `@${node.name}${node.params ? ` ${node.params.replace(/\s+/g, " ").trim()}` : ""}`;
      merge(out, key, node.nodes ? convert(node.nodes) : {});
    }
  }
  return out;
}

/** CSS (string) -> objeto do campo `css` do registry. */
export function cssToRegistry(css: string): Record<string, unknown> {
  return convert(postcss.parse(css).nodes);
}

/** Separa globals.css em blocos por item, pelos marcadores. Sem marcador = "theme". */
export function splitByItem(globalsCss: string): Record<string, string> {
  const parts: Record<string, string> = { theme: "" };
  const marker = /\/\*\s*@registry\s+([\w-]+)\s*\*\/([\s\S]*?)\/\*\s*@registry\s+end\s*\*\//g;
  let last = 0;
  for (const match of globalsCss.matchAll(marker)) {
    const [whole, item, body] = match as unknown as [string, string, string];
    parts.theme += globalsCss.slice(last, match.index);
    parts[item] = (parts[item] ?? "") + body;
    last = (match.index ?? 0) + whole.length;
  }
  parts.theme += globalsCss.slice(last);
  return parts;
}

export function buildThemeItem(
  themeCss: Record<string, unknown>,
  versions: Record<string, string>,
): {
  name: "theme";
  type: string;
  title: string;
  description: string;
  dependencies: string[];
  cssVars?: { theme: Record<string, string> };
  css: Record<string, unknown>;
} {
  const dependencies = ["shadcn", "tw-animate-css"].map((pkg) => {
    const range = versions[pkg];
    if (!range) throw new Error(`theme: o pacote "${pkg}" não está no package.json do ui`);
    return `${pkg}@${range}`;
  });
  // O CLI não aceita @theme no campo css (monta o conteúdo como regra e quebra); o caminho dele
  // para o @theme inline é cssVars.theme, com as chaves sem o "--".
  const { "@theme inline": themeInline, ...css } = themeCss;
  const theme = Object.fromEntries(
    Object.entries((themeInline ?? {}) as Record<string, string>).map(([key, value]) => [
      key.replace(/^--/, ""),
      value,
    ]),
  );
  return {
    name: "theme",
    type: THEME_TYPE,
    title: "Tema do Mosaico",
    description:
      "Tema padrão Multiclubes: cores, raios aninhados, fonte de títulos, modo escuro e transições fluidas.",
    dependencies,
    ...(themeInline ? { cssVars: { theme } } : {}),
    css,
  };
}
