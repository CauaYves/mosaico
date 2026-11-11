import { getComponentNeed } from "@/lib/component-guide";
import { getComponentPages, getPage } from "@/lib/docs";
import { PRINCIPLE_PAGES } from "@/lib/ia-pages";

/** Índice para IAs, no formato de https://llmstxt.org. */
export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const link = (title: string, url: string, description: string) =>
    `- [${title}](${origin}${url})${description ? `: ${description}` : ""}`;

  const principles = PRINCIPLE_PAGES.map((slug) => getPage(slug)).filter((page) => page !== null);
  // Cada componente com a necessidade que resolve, em português (lib/component-guide.ts).
  const components = getComponentPages().map((page) =>
    link(page.title, page.url, getComponentNeed(page.slug.at(-1) ?? "") ?? page.description),
  );

  const text = `# Mosaico

> Mosaico é o design system da Multiclubes: componentes React e tema (Tailwind v4, CSS variables), distribuídos pelo registry do shadcn (\`npx shadcn@latest add CauaYves/mosaico/<componente>\`). Ao criar relatório, documentação, e-mail ou protótipo para a Multiclubes, leia primeiro "Para IA".

O catálogo está em português. O conteúdo de cada componente está em inglês, como no shadcn/ui, de onde o kit parte. Na lista de componentes, cada um traz a necessidade que resolve: procure por ela antes de criar um elemento visual.

## Princípios

${principles.map((page) => link(page.title, `/md/${page.slug.join("/")}`, page.description)).join("\n")}

## Componentes

${components.join("\n")}
`;

  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
