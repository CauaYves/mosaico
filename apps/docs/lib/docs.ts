import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getComponentCategory } from "@/lib/component-categories";
import { getComponentNeed } from "@/lib/component-guide";

export type DocLinks = { doc?: string; api?: string };

export type DocPage = {
  slug: string[];
  url: string;
  title: string;
  description: string;
  links: DocLinks;
  /** Corpo MDX, sem o frontmatter. */
  body: string;
  /** Componente próprio da Multiclubes (não vem do shadcn/ui). */
  multiclubes: boolean;
};

export type TocItem = { title: string; url: string; depth: number };

export type NavItem = {
  title: string;
  url: string;
  badge?: string;
  /** Termos extras para a busca (Ctrl K), como a necessidade do componente em português. */
  keywords?: string[];
  /** Coluna do rodapé em que o item aparece. */
  group?: "docs" | "principios" | "ia";
};

const contentDir = join(process.cwd(), "content", "docs");

// Páginas de componentes: as geradas do shadcn/ui (scripts/sync-shadcn.mjs) e as dos
// componentes próprios da Multiclubes, mantidas à mão. As duas viram /docs/components/*.
const COMPONENT_DIRS = ["components", "components-multiclubes"] as const;

/** Páginas avulsas, na ordem em que aparecem na navegação. */
export const SECTIONS: NavItem[] = [
  { title: "Introdução", url: "/docs", group: "docs" },
  { title: "Por que um design system", url: "/docs/por-que-um-design-system", group: "principios" },
  { title: "Regras de design", url: "/docs/regras-de-design", group: "principios" },
  { title: "Animações", url: "/docs/animacoes", group: "principios" },
  { title: "Para IA", url: "/docs/para-ia", group: "ia" },
  { title: "Componentes", url: "/docs/components", group: "docs" },
  { title: "Marca", url: "/docs/marca", group: "docs" },
  { title: "Instalação", url: "/docs/installation", group: "docs" },
];

/** Lê o frontmatter simples usado nos MDX (chave: valor, com um nível de aninhamento). */
function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match?.[1]) return { data: {} as Record<string, unknown>, body: source };

  const data: Record<string, unknown> = {};
  let parent: Record<string, string> | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    const nested = line.match(/^\s+([\w-]+):\s*(.*)$/);
    if (nested && parent) {
      parent[nested[1] as string] = unquote(nested[2] as string);
      continue;
    }
    const entry = line.match(/^([\w-]+):\s*(.*)$/);
    if (!entry) continue;
    const [, key, value] = entry as unknown as [string, string, string];
    if (value === "") {
      parent = {};
      data[key] = parent;
    } else {
      parent = null;
      data[key] = unquote(value);
    }
  }
  return { data, body: source.slice(match[0].length) };
}

function unquote(value: string) {
  return value.trim().replace(/^["'](.*)["']$/, "$1");
}

function candidateFiles(slug: string[]): [string, boolean][] {
  if (slug.length === 0) return [[join(contentDir, "index.mdx"), false]];
  const name = `${slug.at(-1)}.mdx`;
  if (slug.length === 2 && slug[0] === "components") {
    return COMPONENT_DIRS.map((dir) => [join(contentDir, dir, name), dir !== "components"]);
  }
  return [[join(contentDir, ...slug.slice(0, -1), name), false]];
}

function readPage(slug: string[]): DocPage | null {
  let source: string | null = null;
  let multiclubes = false;
  for (const [file, isMulticlubes] of candidateFiles(slug)) {
    try {
      source = readFileSync(/* turbopackIgnore: true */ file, "utf8");
      multiclubes = isMulticlubes;
      break;
    } catch {}
  }
  if (source === null) return null;
  const { data, body } = parseFrontmatter(source);
  return {
    slug,
    url: ["/docs", ...slug].join("/"),
    title: String(data.title ?? slug.at(-1) ?? ""),
    description: String(data.description ?? ""),
    links: (data.links as DocLinks | undefined) ?? {},
    body,
    multiclubes,
  };
}

let componentsCache: DocPage[] | null = null;

/** Páginas de componentes, em ordem alfabética de título. */
export function getComponentPages(): DocPage[] {
  componentsCache ??= COMPONENT_DIRS.flatMap((dir) =>
    readdirSync(/* turbopackIgnore: true */ join(contentDir, dir)),
  )
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readPage(["components", file.replace(/\.mdx$/, "")]))
    .filter((page): page is DocPage => page !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
  return componentsCache;
}

/** Item de navegação de uma página de componente. */
export function toNavItem(page: DocPage): NavItem {
  const need = getComponentNeed(page.slug.at(-1) ?? "");
  return { title: page.title, url: page.url, ...(need && { keywords: [need] }) };
}

/**
 * Itens da navegação: os componentes de marca (categoria "Marca") ganham uma seção própria
 * na barra lateral e saem da lista geral de componentes.
 */
export function getComponentNav(): { brand: NavItem[]; components: NavItem[] } {
  const pages = getComponentPages();
  const isBrand = (page: DocPage) => getComponentCategory(page.slug.at(-1) ?? "") === "Marca";
  return {
    brand: pages.filter(isBrand).map(toNavItem),
    components: pages.filter((page) => !isBrand(page)).map(toNavItem),
  };
}

export function getPage(slug: string[]) {
  return readPage(slug);
}

export function getAllSlugs(): string[][] {
  return [
    ...SECTIONS.map((section) => section.url.split("/").slice(2)),
    ...getComponentPages().map((page) => page.slug),
  ];
}

/** Sequência usada pelos botões de anterior/próxima. */
export function getNeighbours(url: string) {
  const sequence: NavItem[] = [
    ...SECTIONS,
    ...getComponentPages().map((page) => ({ title: page.title, url: page.url })),
  ];
  const index = sequence.findIndex((item) => item.url === url);
  return {
    previous: index > 0 ? sequence[index - 1] : undefined,
    next: index >= 0 ? sequence[index + 1] : undefined,
  };
}

/** Demos usados em `<ComponentPreview type="block">`, exibidos em iframe pela rota /view. */
export function getBlockDemos(): string[] {
  const names = new Set<string>();
  for (const page of getComponentPages()) {
    for (const element of page.body.match(/<ComponentPreview\b[\s\S]*?\/>/g) ?? []) {
      const name = element.match(/\bname="([^"]+)"/)?.[1];
      if (name && /\btype="block"/.test(element)) names.add(name);
    }
  }
  return [...names];
}

/** Id de um título: o texto em minúsculas, com espaços trocados por hífen. */
export function headingId(text: string) {
  return text.trim().replace(/\s+/g, "-").replace(/'/g, "").replace(/\?/g, "").toLowerCase();
}
