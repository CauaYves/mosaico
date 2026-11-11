import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { HomeSection } from "./home-section";
import { InstallCode } from "./install-code";
import { Reveal } from "./reveal";

const STEPS = [
  {
    title: "Configure o projeto",
    text: "Uma vez, na raiz do app. Aplica o tema Multiclubes, os ícones Phosphor e o utilitário cn.",
    code: "npx shadcn@latest init CauaYves/mosaico/base",
  },
  {
    title: "Adicione os componentes",
    text: "Cada componente vira código do seu projeto, em components/mosaico.",
    code: "npx shadcn@latest add CauaYves/mosaico/button",
  },
  {
    title: "Use os componentes",
    text: "Importe direto do seu projeto.",
    code: 'import { Button } from "@/components/mosaico/button";',
  },
];

const FAQ = [
  {
    q: "Serve para qualquer aplicação da Multiclubes?",
    a: "Sim. O kit não depende de framework de rotas nem de dados: basta React e Tailwind.",
    href: "/docs/installation",
  },
  {
    q: "Posso mudar as cores do tema?",
    a: "Pode. Os tokens seguem o contrato do shadcn/ui: troque as variáveis e todo o kit acompanha.",
    href: "/create",
  },
  {
    q: "Funciona no tema escuro?",
    a: "Funciona. Todo token tem valor claro e escuro; basta a classe dark na raiz.",
    href: "/docs/marca",
  },
  {
    q: "Posso propor um componente novo?",
    a: "Pode, desde que siga as regras de design.",
    href: "/docs/regras-de-design",
  },
  {
    q: "Posso usar com IA?",
    a: "Pode. Há uma página de documentação escrita para agentes de IA.",
    href: "/docs/para-ia",
  },
];

export function HomeStart() {
  return (
    <HomeSection
      n={6}
      id="comece"
      eyebrow="Comece"
      title="Três passos e está no ar"
      description="Os componentes vêm do registry do Mosaico, já com o tema Multiclubes."
    >
      <div className="flex flex-col gap-20 md:gap-28">
        <ol className="-mt-6 border-b border-border">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-border">
              <Reveal className="grid gap-4 py-8 md:grid-cols-2 md:gap-16">
                <div className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3">
                  <span
                    aria-hidden
                    className="font-mono text-sm text-muted-foreground tabular-nums"
                  >
                    {i + 1}.
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-semibold tracking-tight">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </div>
                <InstallCode code={s.code} />
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-8">
          <h3 className="text-3xl font-semibold tracking-tight md:text-5xl">Ainda com dúvidas?</h3>
          <ul className="border-b border-border">
            {FAQ.map((f, i) => (
              <li key={f.q} className="border-t border-border">
                <Reveal delay={i * 60}>
                  <Link
                    href={f.href}
                    className="group grid items-center gap-x-8 gap-y-2 py-6 outline-none focus-visible:bg-muted/40 md:grid-cols-[1fr_auto]"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="sr-only">Sim. </span>
                      <span className="text-lg font-medium md:text-xl">{f.q}</span>
                      <span className="text-sm text-muted-foreground">{f.a}</span>
                    </span>
                    <span
                      aria-hidden
                      className="flex items-center gap-3 font-heading text-4xl font-semibold tracking-tight text-primary md:text-6xl"
                    >
                      Sim.
                      <ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HomeSection>
  );
}
