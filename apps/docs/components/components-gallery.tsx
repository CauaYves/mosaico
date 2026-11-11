"use client";

import { ToggleGroup, ToggleGroupItem } from "@multiclubes/ui/components/toggle-group";
import { cn } from "cn";
import Link from "next/link";
import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { findExample } from "@/lib/examples";

export type GalleryItem = {
  /** Nome do arquivo, ex. "brand-card". */
  name: string;
  title: string;
  description: string;
  url: string;
  category: string;
  multiclubes: boolean;
  isNew: boolean;
  /** Quantas variações o componente tem (lib/component-variations.ts). */
  variations: number;
  /** A necessidade que o componente resolve, em português (lib/component-guide.ts). */
  need?: string;
  /** Nome do exemplo da prévia; padrão `${name}-demo`. */
  preview?: string;
};

type Loader = () => Promise<{ default: React.ComponentType }>;
type GetExample = (name: string, base?: string) => Loader | undefined;

type Sort = "new" | "az" | "za";

const SORTS: { value: Sort; label: string }[] = [
  { value: "new", label: "Novos" },
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
];

/**
 * Galeria de componentes: cabeçalho, atalhos de categoria, ordenação e grade de cartões com a
 * prévia viva de cada item.
 */
export function ComponentsGallery({
  items,
  categories,
  eyebrow = "Componentes",
  title = "Componentes",
  description,
  getExample = findExample,
}: {
  items: GalleryItem[];
  categories: string[];
  eyebrow?: string;
  title?: string;
  description?: string;
  getExample?: GetExample;
}) {
  const [sort, setSort] = React.useState<Sort>("new");
  const [category, setCategory] = React.useState("all");

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [items]);

  const available = categories.filter((name) => counts.has(name));
  const shortcuts = [...available]
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))
    .slice(0, 8);

  const visible = React.useMemo(() => {
    const filtered = items.filter((item) => category === "all" || item.category === category);
    return filtered.sort((a, b) => {
      if (sort === "new" && a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      const order = a.title.localeCompare(b.title, "pt-BR");
      return sort === "za" ? -order : order;
    });
  }, [items, sort, category]);

  const toggle = (value: string) => setCategory((current) => (current === value ? "all" : value));

  return (
    <div className="flex min-w-0 flex-col gap-6 pt-4">
      <div className="flex min-w-0 flex-col gap-8">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          count={items.length}
          description={description}
        />

        <div className="flex flex-wrap items-center gap-2">
          {shortcuts.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => toggle(name)}
              className="inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-transparent aria-pressed:bg-secondary"
            >
              {name}
            </button>
          ))}
          <ToggleGroup
            variant="outline"
            aria-label="Ordenar"
            className="ml-auto"
            value={[sort]}
            onValueChange={(next) => next[0] && setSort(next[0] as Sort)}
          >
            {SORTS.map(({ value, label }) => (
              <ToggleGroupItem key={value} value={value} className="h-8 px-3">
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {visible.length > 0 ? (
          <div className="fluid-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visible.map((item) => (
              <GalleryCard key={item.name} item={item} getExample={getExample} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhum componente encontrado.
          </p>
        )}
      </div>
    </div>
  );
}

function GalleryCard({ item, getExample }: { item: GalleryItem; getExample: GetExample }) {
  // O cartão é uma <div> e o link fica no título, esticado sobre o cartão (after:inset-0): as
  // prévias têm links próprios, e um <a> não pode ficar dentro de outro.
  return (
    <div className="group relative flex animate-fluid-in flex-col overflow-hidden rounded-surface border bg-card p-1.5 transition-colors focus-within:ring-3 focus-within:ring-ring/50 hover:border-foreground/20">
      <div className="relative h-48 overflow-hidden rounded-field bg-muted/50">
        <LivePreview
          name={item.preview ?? `${item.name}-demo`}
          base={item.preview ? undefined : item.name}
          getExample={getExample}
        />
      </div>
      <div className="flex flex-col gap-1 px-2.5 pt-3 pb-2">
        <Link
          href={item.url}
          className="font-medium outline-none after:absolute after:inset-0 after:content-['']"
        >
          {item.title}
        </Link>
        {item.need && <p className="text-sm text-muted-foreground">{item.need}</p>}
        {item.variations > 0 && (
          <p className="text-xs font-medium text-muted-foreground">
            {item.variations} {item.variations === 1 ? "variação" : "variações"}
          </p>
        )}
      </div>
    </div>
  );
}

// Carrega poucas prévias por vez: dezenas de imports dinâmicos simultâneos (um chunk por exemplo)
// estouram a conexão no build de produção, principalmente atrás de túneis como o ngrok.
const MAX_CONCURRENT = 4;
let running = 0;
const waiting: (() => void)[] = [];

function acquire() {
  if (running < MAX_CONCURRENT) {
    running++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) next();
  else running--;
}

async function loadWithRetry(load: Loader, attempts = 3) {
  await acquire();
  try {
    for (let attempt = 1; ; attempt++) {
      try {
        return await load();
      } catch (error) {
        if (attempt >= attempts) throw error;
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  } finally {
    release();
  }
}

class PreviewBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[components-gallery] prévia falhou ao renderizar", error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Prévia viva do exemplo `name`, carregada só quando o cartão chega perto da tela. Fica
 * reduzida (zoom), sem interação e fora da ordem do Tab (inert): o cartão inteiro é o link.
 * O transform faz deste bloco o referencial dos elementos `position: fixed` (a sidebar, por
 * exemplo), que ficam presos e recortados dentro do cartão em vez de cobrir a página.
 */
function LivePreview({
  name,
  base,
  getExample,
}: {
  name: string;
  base?: string;
  getExample: GetExample;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [Demo, setDemo] = React.useState<React.ComponentType | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    const start = () => {
      const load = getExample(name, base);
      if (!load) {
        console.warn(`[components-gallery] sem exemplo para "${name}"`);
        setFailed(true);
        return;
      }
      loadWithRetry(load)
        .then((module) => {
          if (!cancelled) setDemo(() => module.default);
        })
        .catch((error) => {
          console.warn(`[components-gallery] falha ao carregar "${name}"`, error);
          if (!cancelled) setFailed(true);
        });
    };
    if (typeof IntersectionObserver === "undefined") {
      start();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        start();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [name, base, getExample]);

  return (
    <div
      ref={ref}
      inert
      className="pointer-events-none absolute inset-0 flex transform-gpu items-center justify-center overflow-hidden select-none"
    >
      {Demo && !failed ? (
        <PreviewBoundary onError={() => setFailed(true)}>
          <div className="flex w-[166%] items-center justify-center [zoom:0.6]">
            <Demo />
          </div>
        </PreviewBoundary>
      ) : (
        <div aria-hidden className={cn("flex w-2/3 flex-col gap-2.5", !failed && "animate-pulse")}>
          <div className="h-3 w-1/2 rounded-full bg-muted-foreground/15" />
          <div className="h-8 rounded-field bg-muted-foreground/10" />
          <div className="h-3 w-3/4 rounded-full bg-muted-foreground/10" />
        </div>
      )}
    </div>
  );
}
