import { readFileSync } from "node:fs";
import path from "node:path";
import { Button } from "@multiclubes/ui/components/button";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { BLOCKS } from "@/blocks";
import { HeroPreview } from "@/components/home/hero-preview";
import { HomeAnatomy } from "@/components/home/home-anatomy";
import { HomeCompare } from "@/components/home/home-compare";
import { HomeFacts } from "@/components/home/home-facts";
import { HomeFoundations } from "@/components/home/home-foundations";
import { HomeShowcase } from "@/components/home/home-showcase";
import { HomeStart } from "@/components/home/home-start";
import { getComponentPages } from "@/lib/docs";

/** Conta os tokens de cor declarados no tema do kit (`--color-*` do @theme). */
function countColorTokens() {
  try {
    const css = readFileSync(
      path.join(process.cwd(), "../../packages/ui/src/styles/globals.css"),
      "utf8",
    );
    const theme = css.split(":root")[0] ?? "";
    return new Set(theme.match(/--color-[a-z0-9-]+(?=:)/g)).size;
  } catch {
    return 0;
  }
}

export default function Page() {
  return (
    <>
      <div className="relative isolate overflow-hidden border-b border-border lg:h-[min(calc(100svh-var(--header-height)),56rem)] lg:min-h-[40rem]">
        {/* Hero: à esquerda a mensagem; à direita (no desktop) uma nuvem de componentes reais
            que afunila até quase tocar o título, como em "A Criação de Adão". */}
        <div className="mx-auto flex h-full w-full max-w-6xl items-center px-6 py-16 lg:py-0">
          <section
            aria-label="Apresentação"
            className="relative z-20 flex w-full flex-col items-center gap-2.5 text-center lg:w-1/2 lg:items-start lg:pr-12 lg:text-left"
          >
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance lg:text-5xl">
              Mosaico, o design system da Multiclubes
            </h1>
            <p className="max-w-xl text-base text-balance text-muted-foreground sm:text-lg">
              Componentes acessíveis, tema compartilhado e configurações comuns para todas as
              aplicações da Multiclubes.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button
                nativeButton={false}
                render={
                  <Link
                    href="/docs"
                    className="pill gap-2 bg-ink text-paper hover:bg-ink/85 hover:text-paper"
                  />
                }
              >
                Começar a usar
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/docs/components" />}
              >
                Ver componentes
              </Button>
            </div>
          </section>
        </div>
        <HeroPreview />
      </div>
      <HomeCompare />
      <HomeShowcase />
      <HomeFoundations />
      <HomeAnatomy />
      <HomeFacts
        componentCount={getComponentPages().length}
        blockCount={BLOCKS.length}
        colorCount={countColorTokens()}
      />
      <HomeStart />
    </>
  );
}
