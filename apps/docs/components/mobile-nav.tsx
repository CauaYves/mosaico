"use client";

import { Button } from "@multiclubes/ui/components/button";
import {
  AppWindowIcon,
  ArrowUpRightIcon,
  ArticleIcon,
  BookOpenIcon,
  HouseIcon,
  type Icon,
  LayoutIcon,
  PaintBrushIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import * as React from "react";
import { createPortal } from "react-dom";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import type { NavItem } from "@/lib/docs";

/** Páginas do site, com o ícone de cada uma. */
const PAGES: (NavItem & { icon: Icon; description: string })[] = [
  { title: "Início", url: "/", icon: HouseIcon, description: "Visão geral do Mosaico" },
  { title: "Docs", url: "/docs", icon: BookOpenIcon, description: "Instalação e fundamentos" },
  {
    title: "Components",
    url: "/docs/components",
    icon: SquaresFourIcon,
    description: "Todos os componentes do kit",
  },
  { title: "Blocks", url: "/blocks", icon: LayoutIcon, description: "Telas prontas para copiar" },
  { title: "Create", url: "/create", icon: PaintBrushIcon, description: "Monte o seu tema" },
  {
    title: "Interfaces",
    url: "/interfaces",
    icon: AppWindowIcon,
    description: "Produtos feitos com o kit",
  },
];

/**
 * Menu do header no celular e no tablet, no formato do header mobile do nucleos-ui: o botão
 * com o ícone que vira X abre um painel que desce por baixo do header (fade e deslize curto),
 * com uma camada escurecida atrás e a rolagem da página travada. Esc ou um link fecham.
 * `data-menu-open` no botão deixa o header formar o fundo enquanto o menu está aberto.
 */
export function MobileNav({
  sections,
  components,
  className,
}: {
  sections: NavItem[];
  components: NavItem[];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    // Trava a rolagem no <html> e guarda o espaço da barra de rolagem: sem isso a barra some
    // e a página inteira pula para o lado ao abrir o menu.
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* Só o ícone: sem fundo no hover e sem anel de foco, apenas a animação de abrir e
          fechar. No foco pelo teclado o ícone clareia. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        data-menu-open={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "extend-touch-target flex size-10 items-center justify-center text-foreground outline-none focus-visible:text-muted-foreground [-webkit-tap-highlight-color:transparent]",
          className,
        )}
      >
        <MenuToggleIcon open={open} className="size-5" />
      </button>
      {mounted &&
        createPortal(
          <>
            <div
              aria-hidden="true"
              onClick={close}
              className={cn(
                // Abaixo do header: ele fica num contexto de empilhamento próprio do layout, então
                // uma camada por cima dele o borraria e cobriria o botão de fechar.
                "fixed inset-x-0 top-(--header-height) bottom-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />
            <nav
              id="mobile-menu"
              aria-label="Menu"
              inert={!open}
              className={cn(
                "fixed inset-x-0 top-(--header-height) bottom-0 z-40 flex flex-col border-t bg-background transition-all duration-300 ease-in-out motion-reduce:transition-none lg:hidden",
                open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
              )}
            >
              <div className="no-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto p-4">
                <Section title="Navegação">
                  {PAGES.map((page) => (
                    <MenuLink key={page.url} item={page} icon={page.icon} onClick={close}>
                      {page.description}
                    </MenuLink>
                  ))}
                </Section>
                <Section title="Guias">
                  {sections.map((item) => (
                    <MenuLink key={item.url} item={item} icon={ArticleIcon} onClick={close} />
                  ))}
                </Section>
                <Section title="Componentes">
                  <div className="grid grid-cols-2 gap-x-2">
                    {components.map((item) => (
                      <Link
                        key={item.url}
                        href={item.url}
                        onClick={close}
                        className="truncate rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </Section>
              </div>
              <div className="flex flex-col gap-3 border-t p-4">
                <Button
                  nativeButton={false}
                  render={<Link href="/docs" onClick={close} />}
                  className="w-full"
                >
                  Começar a usar
                  <ArrowUpRightIcon data-icon="inline-end" />
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/docs/components" onClick={close} />}
                  className="w-full"
                >
                  Ver componentes
                </Button>
              </div>
            </nav>
          </>,
          document.body,
        )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-2 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </span>
      {children}
    </div>
  );
}

/** Item do menu: o ícone numa caixinha com borda, o nome e, se houver, uma descrição curta. */
function MenuLink({
  item,
  icon: ItemIcon,
  onClick,
  children,
}: {
  item: NavItem;
  icon: Icon;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={item.url}
      onClick={onClick}
      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md border shadow-xs">
        <ItemIcon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{item.title}</span>
        {children ? (
          <span className="truncate text-xs text-muted-foreground">{children}</span>
        ) : null}
      </span>
    </Link>
  );
}
