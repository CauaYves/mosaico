import { readFileSync } from "node:fs";
import { join } from "node:path";
import { componentGuideRows } from "./component-guide.ts";

// Fonte única do conteúdo voltado a IA: content/docs/para-ia.mdx. Daqui saem o /llms.txt, os
// endpoints /md/* e a referência das skills (scripts/sync-ia.mjs). A tabela "Qual componente usar"
// vem de lib/component-guide.ts.

const START = "## Instruções";
const END = "\n---\n\n## Para quem mantém";

/** Texto do MDX sem o frontmatter. */
export function readDocBody(file: string, root = process.cwd()) {
  const source = readFileSync(join(root, "content", "docs", file), "utf8");
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

/** As instruções para a IA, sem a introdução nem a nota para quem mantém a página. */
export function iaPayload(root = process.cwd()) {
  const body = readDocBody("para-ia.mdx", root).replace(/\r\n/g, "\n");
  const start = body.indexOf(START);
  const end = body.indexOf(END);
  if (start === -1 || end === -1) {
    throw new Error("para-ia.mdx: não achei os marcadores de início e fim das instruções.");
  }
  return body.slice(start, end).trim();
}

/** Troca os componentes do MDX por Markdown puro, para ler fora do site. */
export function toPlainMarkdown(body: string) {
  return body.replace(
    /<Callout(?: title="([^"]*)")?>\s*([\s\S]*?)\s*<\/Callout>/g,
    (_, title: string | undefined, text: string) => {
      const lines = [...(title ? [`**${title}**`, ""] : []), ...text.split("\n")];
      return lines.map((line) => (line ? `> ${line}` : ">")).join("\n");
    },
  );
}

/** Arquivo de referência da skill: as instruções, com um aviso de que é gerado. */
export function skillReference(root = process.cwd()) {
  return `<!-- Gerado de apps/docs/content/docs/para-ia.mdx e apps/docs/lib/component-guide.ts por "pnpm --filter docs sync:ia". Não edite aqui. -->

# Princípios do Mosaico para materiais fora do código

${iaPayload(root).replace(START, "## Instruções")}

${componentGuideMarkdown()}
`;
}

/** Seção "Qual componente usar": uma tabela por categoria, gerada do guia. */
export function componentGuideMarkdown() {
  const rows = componentGuideRows();
  const categories = [...new Set(rows.map((row) => row.category))];
  const cell = (text: string) => text.replace(/\|/g, "\\|");
  const tables = categories.map((category) => {
    const lines = rows
      .filter((row) => row.category === category)
      .map(
        (row) =>
          `| ${cell(row.need)} | \`${row.slug}\` | ${cell([row.useWhen, row.avoidWhen, row.build].filter(Boolean).join(" "))} |`,
      );
    return [
      `### ${category}`,
      "",
      "| Necessidade | Componente | Quando usar |",
      "| --- | --- | --- |",
      ...lines,
    ].join("\n");
  });
  return [
    "## Qual componente usar",
    "",
    "Antes de criar qualquer elemento visual, ache aqui o componente do kit que resolve a necessidade. Instale com `npx shadcn@latest add CauaYves/mosaico/<componente>`, salvo quando a linha diz outro caminho. Os componentes com página ficam em `/docs/components/<componente>`.",
    "",
    tables.join("\n\n"),
  ].join("\n");
}
