import { readFileSync } from "node:fs";
import path from "node:path";
import { Button } from "@multiclubes/ui/components/button";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { BLOCKS } from "@/blocks";
import { ComponentsMotionGrid, HeroPointer } from "@/components/home/components-motion-grid";
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
      {/* Em telas grandes o hero inteiro (texto, onda e vitrine) cresce como se o navegador
          estivesse com mais zoom só aqui: 110% a partir de 1280px e 125% a partir de 1536px.
          O que depende da tela (altura e encaixe sob o header) é dividido pelo mesmo fator,
          porque o zoom também multiplica as unidades de viewport. */}
      <div className="relative isolate -mt-[calc(var(--header-height)/var(--hero-zoom))] flex min-h-svh flex-col overflow-hidden [--hero-zoom:1] lg:block lg:h-[min(calc(100svh/var(--hero-zoom)),calc(56rem+var(--header-height)/var(--hero-zoom)))] lg:min-h-[calc(40rem+var(--header-height)/var(--hero-zoom))] lg:[zoom:var(--hero-zoom)] xl:[--hero-zoom:1.1] 2xl:[--hero-zoom:1.25]">
        {/* Hero: a mensagem e os componentes do kit passando em colunas. No desktop ficam lado
            a lado, divididos por uma onda vertical; no celular e no tablet o painel ocupa o topo
            da tela e termina numa onda logo acima do texto. O hero sobe por baixo do header
            (-mt), que é transparente no começo da página, e o painel vai até o topo. */}
        <div className="order-last mx-auto flex w-full max-w-6xl items-center px-6 pt-2 pb-12 lg:h-full lg:max-w-none lg:border-none lg:py-0 lg:pr-0 lg:pl-[max(3rem,(40%-23rem)/2)]">
          {/* Centrado no quadro entre a borda da página e a onda: na vertical, no meio do hero
              inteiro (o header é transparente por cima); na horizontal, no meio dos 40% da esquerda (no mínimo 3rem da borda). */}
          <section
            aria-label="Apresentação"
            className="relative z-20 flex w-full flex-col items-center gap-2.5 text-center lg:w-92 lg:items-start lg:text-left"
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
              <span className="relative">
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/docs/components" />}
                >
                  Ver componentes
                </Button>
                {/* O cursor "Mosaico" logo abaixo do botão, apontando para ele. */}
                <span className="absolute top-full -right-10 -mt-1 hidden sm:block">
                  <HeroPointer />
                </span>
              </span>
            </div>
          </section>
        </div>
        <ComponentsMotionGrid />
        {/* Sem linha entre o hero e o resto da página: no desktop o painel da onda se dissolve no
            fundo da página na base, como os cards já somem dentro dele. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-px z-10 hidden h-32 bg-linear-to-b from-transparent to-background to-85% lg:block"
        />
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
