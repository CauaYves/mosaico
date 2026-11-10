import { Button } from "@multiclubes/ui/components/button";
import Link from "next/link";
import { CommandMenu } from "@/components/command-menu";
import { LogoMark } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { SiteHeaderShell } from "@/components/site-header-shell";
import { getComponentNav, SECTIONS } from "@/lib/docs";

const NAV_ITEMS = [
  { title: "Docs", url: "/docs" },
  { title: "Components", url: "/docs/components" },
  { title: "Blocks", url: "/blocks" },
  { title: "Create", url: "/create" },
];

export function SiteHeader() {
  const { components } = getComponentNav();

  return (
    <SiteHeaderShell>
      <div className="container-wrapper px-6">
        {/* Celular e tablet, como o header mobile do nucleos-ui: tema à esquerda, marca no
            centro e o menu à direita. */}
        <div className="grid h-(--header-height) grid-cols-[1fr_auto_1fr] items-center lg:hidden">
          <div className="flex justify-start">
            <ModeSwitcher />
          </div>
          <Link href="/" aria-label="Mosaico, início" className="flex items-center justify-center">
            <LogoMark className="size-7" />
          </Link>
          <div className="flex justify-end">
            <MobileNav sections={SECTIONS} components={components} />
          </div>
        </div>
        {/* Desktop: três colunas, marca, navegação centralizada e ações. */}
        <div className="hidden h-(--header-height) grid-cols-[1fr_auto_1fr] items-center gap-3 lg:grid">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <LogoMark className="size-5" />
            <span className="sr-only">Mosaico</span>
          </Button>
          <MainNav items={NAV_ITEMS} className="flex" />
          <div className="flex items-center justify-end gap-1.5">
            <CommandMenu sections={SECTIONS} components={components} />
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </SiteHeaderShell>
  );
}
