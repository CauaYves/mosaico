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
        {/* Três colunas no desktop: marca, navegação centralizada e ações. */}
        <div className="flex h-(--header-height) items-center gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <MobileNav sections={SECTIONS} components={components} className="flex lg:hidden" />
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:flex"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <LogoMark className="size-5" />
            <span className="sr-only">Mosaico</span>
          </Button>
          <MainNav items={NAV_ITEMS} className="hidden lg:flex" />
          <div className="ml-auto flex items-center gap-1.5 lg:ml-0 lg:justify-end">
            <div className="hidden md:flex">
              <CommandMenu sections={SECTIONS} components={components} />
            </div>
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </SiteHeaderShell>
  );
}
