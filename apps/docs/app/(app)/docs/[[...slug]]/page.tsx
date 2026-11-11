import { Button } from "@multiclubes/ui/components/button";
import { ArrowLeftIcon, ArrowRightIcon, ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComponentPreview } from "@/components/component-preview";
import { ComponentsGallery, type GalleryItem } from "@/components/components-gallery";
import { DocsCopyPage } from "@/components/docs-copy-page";
import { DocsTableOfContents } from "@/components/docs-toc";
import {
  COMPONENT_CATEGORIES,
  getComponentCategory,
  NEW_COMPONENTS,
} from "@/lib/component-categories";
import { getComponentNeed } from "@/lib/component-guide";
import { getComponentVariations } from "@/lib/component-variations";
import { getAllSlugs, getComponentPages, getNeighbours, getPage } from "@/lib/docs";
import { compileMdx } from "@/lib/mdx";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props) {
  const page = getPage((await params).slug ?? []);
  if (!page) notFound();
  return { title: page.title, description: page.description };
}

export default async function Page({ params }: Props) {
  const page = getPage((await params).slug ?? []);
  if (!page) notFound();

  if (page.url === "/docs/components") return <ComponentsPage brand={false} />;
  if (page.url === "/docs/marca") return <ComponentsPage brand />;

  const neighbours = getNeighbours(page.url);
  const { content, toc: pageToc } = await compileMdx(page.body);
  // Variações do componente (lib/component-variations.ts): seção no fim da página, também
  // nas páginas geradas do shadcn, e entradas no índice da página.
  const variations =
    page.slug[0] === "components" ? getComponentVariations(page.slug.at(-1) ?? "") : [];
  const toc = variations.length
    ? [
        ...pageToc,
        { title: "Variações", url: "#variacoes", depth: 2 },
        ...variations.map((variation, index) => ({
          title: variation.title,
          url: `#variacao-${index + 1}`,
          depth: 3,
        })),
      ]
    : pageToc;

  return (
    <div
      data-slot="docs"
      className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between md:items-start">
              <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">
                {page.title}
              </h1>
              <div className="docs-nav flex items-center gap-2">
                <div className="hidden sm:block">
                  <DocsCopyPage page={page.body} />
                </div>
                <div className="ml-auto flex gap-2">
                  {neighbours.previous && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="extend-touch-target size-8 shadow-none md:size-7"
                      nativeButton={false}
                      render={<Link href={neighbours.previous.url} />}
                    >
                      <ArrowLeftIcon />
                      <span className="sr-only">Anterior</span>
                    </Button>
                  )}
                  {neighbours.next && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="extend-touch-target size-8 shadow-none md:size-7"
                      nativeButton={false}
                      render={<Link href={neighbours.next.url} />}
                    >
                      <span className="sr-only">Próxima</span>
                      <ArrowRightIcon />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {page.description && (
              <p className="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]">
                {page.description}
              </p>
            )}
            {(page.links.doc || page.links.api) && (
              <div className="flex items-center gap-2 pt-4">
                {page.links.doc && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 rounded-md px-2 text-xs shadow-none"
                    nativeButton={false}
                    render={<a href={page.links.doc} target="_blank" rel="noreferrer" />}
                  >
                    Docs <ArrowSquareOutIcon />
                  </Button>
                )}
                {page.links.api && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 rounded-md px-2 text-xs shadow-none"
                    nativeButton={false}
                    render={<a href={page.links.api} target="_blank" rel="noreferrer" />}
                  >
                    Referência da API <ArrowSquareOutIcon />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="typeset w-full flex-1 pb-16 sm:pb-0">
            {content}
            {variations.length > 0 && (
              <>
                <h2 id="variacoes">Variações</h2>
                <p>Usos que se repetem entre as aplicações, montados com o próprio componente.</p>
                {variations.map((variation, index) => (
                  <section key={variation.example}>
                    <h3 id={`variacao-${index + 1}`}>{variation.title}</h3>
                    <p>{variation.description}</p>
                    <ComponentPreview name={variation.example} previewClassName="h-auto" />
                  </section>
                ))}
              </>
            )}
          </div>
          <div className="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0">
            {neighbours.previous && (
              <Button
                variant="secondary"
                size="sm"
                className="shadow-none"
                nativeButton={false}
                render={<Link href={neighbours.previous.url} />}
              >
                <ArrowLeftIcon /> {neighbours.previous.title}
              </Button>
            )}
            {neighbours.next && (
              <Button
                variant="secondary"
                size="sm"
                className="ml-auto shadow-none"
                nativeButton={false}
                render={<Link href={neighbours.next.url} />}
              >
                {neighbours.next.title} <ArrowRightIcon />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        {toc.length > 0 && (
          <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">
            <DocsTableOfContents toc={toc} />
          </div>
        )}
      </div>
    </div>
  );
}

/** /docs/components: galeria larga, com busca, filtros e prévias, no lugar do texto do MDX. */
/**
 * Galeria de componentes. `brand` separa os dois lados: /docs/marca mostra só os componentes
 * de identidade (categoria "Marca") e /docs/components mostra todos os outros.
 */
function ComponentsPage({ brand }: { brand: boolean }) {
  const pages = getComponentPages().filter(
    (entry) => (getComponentCategory(entry.slug.at(-1) ?? "") === "Marca") === brand,
  );
  const items: GalleryItem[] = pages.map((entry) => {
    const name = entry.slug.at(-1) ?? "";
    return {
      name,
      title: entry.title,
      description: entry.description,
      url: entry.url,
      category: getComponentCategory(name),
      multiclubes: entry.multiclubes,
      isNew: NEW_COMPONENTS.has(name),
      variations: getComponentVariations(name).length,
      need: getComponentNeed(name),
    };
  });

  return (
    <div data-slot="docs" className="flex min-w-0 flex-1 flex-col pb-16">
      <div className="h-(--top-spacing) shrink-0" />
      <div className="w-full px-4 py-4 md:px-6">
        <ComponentsGallery
          items={items}
          eyebrow={brand ? "Identidade" : "Componentes"}
          title={brand ? "Marca" : "Componentes"}
          description={
            brand
              ? "Componentes de identidade da Multiclubes, para campanhas, telas de entrada e seções de destaque."
              : "Componentes do Mosaico, cada um com a necessidade que resolve. Filtre por categoria ou ordene; a busca do topo (Ctrl K) acha pelo nome ou pela necessidade."
          }
          categories={
            brand ? ["Marca"] : [...COMPONENT_CATEGORIES.map((category) => category.name), "Outros"]
          }
        />
      </div>
    </div>
  );
}
