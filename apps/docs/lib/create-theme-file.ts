// Arquivo de tema de cliente gerado no /create: as escolhas viajam na URL da página e no
// cabeçalho do arquivo, para que um tema baixado possa ser reaberto e ajustado depois.

/** Escolhas do /create, com os nomes usados nos parâmetros da URL. */
export type ThemeChoices = {
  cliente: string;
  cor: string;
  graficos: string;
  raio: string;
  fonte: string;
  /** "" segue a fonte do texto. */
  titulos: string;
};

/** Valores aceitos em cada escolha. */
export type ChoiceOptions = {
  colors: string[];
  charts: string[];
  radii: string[];
  fonts: string[];
};

const CLIENT_MAX_LENGTH = 80;
const DEFAULT_FILE_NAME = "tema-mosaico.css";
const EDIT_PREFIX = "Editar:";

/** Parâmetros da URL, sem "?", na ordem fixa. */
export function choicesToSearch(choices: ThemeChoices): string {
  return new URLSearchParams([
    ["cliente", choices.cliente],
    ["cor", choices.cor],
    ["graficos", choices.graficos],
    ["raio", choices.raio],
    ["fonte", choices.fonte],
    ["titulos", choices.titulos],
  ]).toString();
}

/** Lê as escolhas da URL. Parâmetro ausente ou inválido volta ao padrão. */
export function choicesFromSearch(
  search: string,
  options: ChoiceOptions,
  defaults: ThemeChoices,
): ThemeChoices {
  const params = new URLSearchParams(search);
  const pick = (key: keyof ThemeChoices, allowed: string[]) => {
    const value = params.get(key);
    return value !== null && allowed.includes(value) ? value : defaults[key];
  };
  const cliente = params.get("cliente");

  return {
    cliente:
      cliente === null ? defaults.cliente : cliente.trim().slice(0, CLIENT_MAX_LENGTH).trim(),
    cor: pick("cor", options.colors),
    graficos: pick("graficos", options.charts),
    raio: pick("raio", options.radii),
    fonte: pick("fonte", options.fonts),
    titulos: pick("titulos", ["", ...options.fonts]),
  };
}

/** Nome do arquivo: o cliente em kebab-case, sem acentos. */
export function themeFileName(cliente: string): string {
  const slug = cliente
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `${slug}.css` : DEFAULT_FILE_NAME;
}

/** Nome do cliente seguro dentro de um comentário CSS de uma linha. */
function commentSafe(text: string) {
  return text.replaceAll("*/", "").replace(/\s+/g, " ").trim();
}

/** Arquivo de tema: cabeçalho com o link de edição e o CSS. */
export function themeFile({
  cliente,
  editUrl,
  css,
  date,
}: {
  cliente: string;
  editUrl: string;
  css: string;
  date: string;
}): string {
  const name = commentSafe(cliente);
  return [
    "/*",
    name ? ` * Tema Mosaico: ${name}` : " * Tema Mosaico",
    ` * ${EDIT_PREFIX} ${commentSafe(editUrl)}`,
    ` * Gerado em ${date}`,
    " *",
    " * Carregue este arquivo depois do globals.css do projeto.",
    " */",
    css,
    "",
  ].join("\n");
}

/** Link de edição do cabeçalho, ou null se o arquivo não foi gerado pelo Mosaico. */
export function editUrlFromFile(text: string): string | null {
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*\*\s*Editar:\s*(\S+)\s*$/);
    if (match) return match[1] ?? null;
  }
  return null;
}
