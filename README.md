# Mosaico

Design system da Multiclubes: design tokens, componentes React e configurações comuns, para que todas as aplicações sigam o mesmo padrão visual e de código. Os componentes são distribuídos pelo registry do shadcn.

Objetivo, arquitetura e plano de execução: [docs/plano.md](docs/plano.md).

## Estrutura

| Caminho | Descrição |
| --- | --- |
| `packages/ui` | `@multiclubes/ui`: componentes React (shadcn/ui + Base UI) e tema Tailwind v4 |
| `packages/typescript-config` | `@multiclubes/typescript-config`: tsconfigs compartilhados |
| `packages/biome-config` | `@multiclubes/biome-config`: configuração base do Biome |
| `apps/docs` | Documentação dos componentes, no formato do ui.shadcn.com (porta 3001) |
| `apps/web` | Playground que consome o kit como um app real (porta 3000) |

## Desenvolvimento

Requisitos: Node.js >= 24 e pnpm 12.

```sh
pnpm install
pnpm dev            # sobe todos os apps
pnpm build          # build de todos os pacotes e apps
pnpm check-types    # verificação de tipos
pnpm test           # testes (Vitest)
pnpm lint           # Biome (lint + formatação)
pnpm lint:fix       # aplica as correções do Biome
```

Para rodar só um app: `pnpm exec turbo dev --filter=web`.

## Componentes

O `@multiclubes/ui` traz todos os componentes do shadcn/ui no estilo `base-luma` (Base UI + Phosphor). Para adicionar ou atualizar um componente, rode o CLI dentro de `packages/ui`:

```sh
cd packages/ui
pnpm dlx shadcn@4.22.1 add dialog --overwrite
pnpm lint:fix   # na raiz: aplica a formatação do repositório
```

Os componentes importam `cn` do pacote [`cn`](https://github.com/shadcn-ui/cn), o utilitário oficial do shadcn (substitui `clsx` + `tailwind-merge`). Apps também podem importá-lo de `@multiclubes/ui/lib/utils`.

Depois de adicionado, o componente é nosso: ajuste ao padrão do kit e escreva testes (`*.test.tsx` ao lado do componente).

Além dos componentes do shadcn, o kit tem componentes próprios da Multiclubes, trazidos do Portal: `date-wheel-picker` (roda de dia/mês/ano) e `date-field` (campo de data que usa a roda no celular e máscara no desktop). Na documentação, eles ficam em `apps/docs/content/docs/components-multiclubes` e `apps/docs/examples-multiclubes`, fora das pastas geradas pelo sync.

## Documentação

`apps/docs` reproduz a documentação do [ui.shadcn.com](https://ui.shadcn.com) para os componentes do kit. As páginas (`content/docs/components`) e os exemplos (`examples/`) são gerados a partir do repositório do shadcn/ui (MIT):

```sh
pnpm --filter docs sync:shadcn
```

O script baixa a documentação, troca os imports para `@multiclubes/ui`, substitui a seção de instalação e descarta exemplos que dependem de código interno do site do shadcn (o resumo lista quais e por quê). Não edite os arquivos gerados; as páginas próprias (`content/docs/index.mdx`, `installation.mdx`) são mantidas à mão.

## Para IA

O catálogo tem a página `/docs/para-ia`, com os princípios do Mosaico escritos como instrução para uma IA (relatórios, documentação, templates de e-mail, protótipos). Ela também sai em Markdown puro em `/md/para-ia`, e o catálogo publica um índice em `/llms.txt`.

A skill `skills/mosaico-design` carrega essas instruções sozinha quando alguém pede material da Multiclubes. Para instalar, copie a pasta para `~/.claude/skills/` (Claude Code) ou envie-a como skill no Claude. A referência da skill é gerada da página; depois de mudar `apps/docs/content/docs/para-ia.mdx`, rode `pnpm --filter docs sync:ia`.

## Usando o kit em um app

Os componentes são distribuídos pelo registry do shadcn, servido direto deste repositório:

```sh
npx shadcn@latest add CauaYves/mosaico/button
```

O componente vai para `components/mosaico/`, já com o tema Multiclubes, e convive com componentes do shadcn oficial em `components/ui`. Detalhes, temas de cliente e fonte: página `/docs/installation` do catálogo.

### Registry

`packages/ui/registry.json` é gerado do código de `packages/ui/src` (imports, dependências e o tema de `globals.css`). Depois de mudar um componente, rode:

```sh
pnpm --filter @multiclubes/ui registry
```

A CI falha se o arquivo estiver desatualizado. Imports entre arquivos do kit usam o formato `@/registry/mosaico/{components,hooks,lib}/mosaico/<nome>`, que o CLI do shadcn reescreve para os aliases de quem instala. Os apps do monorepo continuam importando de `@multiclubes/ui/components/<nome>`. `pnpm --filter @multiclubes/ui registry:smoke` instala itens da `main` num projeto novo e confere o resultado (roda na CI depois de cada push na `main`).
