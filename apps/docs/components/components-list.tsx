import Link from "next/link";
import { getComponentNeed } from "@/lib/component-guide";
import { getComponentPages } from "@/lib/docs";

/**
 * Lista de componentes para usar no MDX (`<ComponentsList />`), com a necessidade de cada um em
 * português. A página /docs/components não usa esta lista: ela mostra a ComponentsGallery.
 */
export function ComponentsList() {
  return (
    <div className="not-typeset mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
      {getComponentPages().map((page) => {
        const need = getComponentNeed(page.slug.at(-1) ?? "");
        return (
          <Link key={page.url} href={page.url} className="group flex flex-col gap-1">
            <span className="text-lg font-medium underline-offset-4 group-hover:underline md:text-base">
              {page.title}
            </span>
            {need && <span className="text-sm text-muted-foreground">{need}</span>}
          </Link>
        );
      })}
    </div>
  );
}
