import { getPage } from "@/lib/docs";
import { componentGuideMarkdown, iaPayload, toPlainMarkdown } from "@/lib/ia";
import { PRINCIPLE_PAGES } from "@/lib/ia-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return PRINCIPLE_PAGES.map((slug) => ({ slug }));
}

/** Uma página de princípios em Markdown puro, sem componentes MDX. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return new Response("Not found", { status: 404 });

  // "Para IA" serve as instruções e a tabela "Qual componente usar", o mesmo que a skill carrega.
  const body =
    slug[0] === "para-ia"
      ? `${iaPayload()}

${componentGuideMarkdown()}`
      : toPlainMarkdown(page.body.trim());
  return new Response(`# ${page.title}\n\n${body}\n`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
