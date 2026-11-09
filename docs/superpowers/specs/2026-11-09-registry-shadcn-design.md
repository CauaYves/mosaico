# Registry shadcn do Mosaico: desenho

> Status: aguardando aprovação · 2026-11-09 · Branch: `CauaYves/feat-shadcn-registry`

## Por quê

Os devs da Multiclubes precisam trazer os componentes do Mosaico para os projetos da empresa já com
a identidade Multiclubes. O caminho escolhido é o do shadcn: cada projeto roda um comando, recebe o
código-fonte do componente e passa a ser dono dele. O registry também é pré-requisito do Mosaico
Studio (ver `2026-11-08-mosaico-studio-visao.md`), que consome o kit por ele.

## Objetivos

- Qualquer componente do `@multiclubes/ui` instala com um comando:

  ```bash
  npx shadcn@latest add CauaYves/mosaico/button
  ```

- O componente chega funcionando e com as cores Multiclubes, sem passo extra.
- Uma fonte da verdade: o código em `packages/ui/src`, o mesmo que o docs e o web usam hoje.
- O registry não sai de sincronia com o código: a CI acusa quando sai.

## Fora do escopo

- **Pacote npm.** Sai do plano: nada de build ESM, Azure Artifacts ou Changesets para o `ui`. O
  registry é a única forma de distribuir os componentes.
- **Blocos** (`login-01`, `sidebar-*`, `chat-01` etc.). Ficam para uma segunda etapa, depois de
  avaliar a viabilidade (dependem de `next/image`, `next-themes` e do logo do site).
- **Domínio e deploy do site de docs.** Não são necessários: o registry é servido pelo GitHub.
- **Versões fixadas do registry.** Não há `#tag` nos comandos nem nos endereços
  `CauaYves/mosaico/<item>`. Isso não vale para pacotes npm (ver Dependências).

## Anti-objetivos

- Um componente que instala e renderiza quebrado (classe ou token inexistente no projeto).
- Um componente do Mosaico que puxa, por dependência, o componente oficial do shadcn no lugar do
  nosso.
- Duas cópias do código dos componentes no repositório mantidas à mão.

## Decisões

### Distribuição

- O registry é **público** e servido **direto do GitHub** pelo repositório `CauaYves/mosaico`
  (renomeado de `Multiui-kit` em 2026-11-08). É um registry de código-fonte: o CLI lê o
  `registry.json` da raiz e copia os arquivos do repositório. Sem `shadcn build`, sem JSON gerado,
  sem servidor.
- Sem versão: todo `add` traz o que está na `main`. Consequência assumida: a `main` precisa estar
  sempre estável (CI verde, nada pela metade), e mudanças que quebram compatibilidade são avisadas
  no changelog e passam por `@deprecated` antes de sair, como no `plano.md`.

### Estrutura

- `registry.json` na raiz, só com `include: ["packages/ui/registry.json"]`.
- `packages/ui/registry.json` lista os itens. **Os caminhos dentro dele são relativos ao próprio
  arquivo** (`src/components/button.tsx`), confirmado no spike.
- Itens: `theme`, um por componente (todos os 75 arquivos de `src/components`, incluindo os
  próprios da Multiclubes), um por hook (`use-mobile`, `use-highlighted-code`) e um
  por lib (`utils`, `highlighter`). Testes (`*.test.tsx`) não entram.
- **Convivência com o shadcn oficial é obrigatória.** Projetos como o Portal migram aos poucos,
  com os componentes atuais (shadcn em Radix, em `components/ui`) ao lado dos do Mosaico. Um `add`
  do Mosaico nunca pode sobrescrever um arquivo do shadcn oficial, nem direta nem indiretamente.
- Por isso os componentes do Mosaico vão para uma **pasta própria**: `target`
  `@components/mosaico/<nome>.tsx`, ou seja, `components/mosaico/` no projeto padrão. Hooks e libs
  do kit também ficam em subpastas próprias (`@hooks/mosaico/`, `@lib/mosaico/`), para não colidir
  com `use-mobile` e `utils` do shadcn.
- Os imports entre arquivos do kit precisam chegar apontando para essa pasta (ver a seção de imports
  abaixo).

### Imports entre arquivos do kit

O spike mostrou que o CLI **não** reescreve `@multiclubes/ui/...`. Resultado por formato:

| Import no código do Mosaico | Chega no projeto como | |
| --- | --- | --- |
| `@multiclubes/ui/components/button` | igual | quebra |
| `./button` | `./button` | só serve entre componentes |
| `../hooks/use-mobile` | igual | aponta para a pasta errada |
| `@/registry/mosaico/ui/button` | `@/components/ui/button` | funciona |
| `@/registry/mosaico/hooks/use-mobile` | `@/hooks/use-mobile` | funciona |

Decisão: os imports **entre arquivos do kit** dentro de `packages/ui/src` passam a usar o formato
`@/registry/mosaico/...`, que o CLI reescreve para o alias do projeto. Como os arquivos vão para
pastas próprias (`components/mosaico`, `hooks/mosaico`, `lib/mosaico`), o formato provável é
`@/registry/mosaico/components/mosaico/<nome>`, `@/registry/mosaico/hooks/mosaico/<nome>` e
`@/registry/mosaico/lib/mosaico/<nome>`. **O spike só validou os formatos `ui/` e `hooks/` sem
subpasta.** O formato exato com subpasta precisa ser confirmado no primeiro passo da implementação,
num projeto que já tenha o shadcn oficial em `components/ui`. Ele é aceito quando os imports
chegam apontando para `components/mosaico/...` e nenhum arquivo de `components/ui` muda.
Um alias mapeia esse prefixo para `packages/ui/src/{components,hooks,lib}` no `tsconfig` do `ui`, no
Vitest do `ui` e no `tsconfig` do docs e do web. Os imports que os apps fazem dos componentes
(`@multiclubes/ui/components/button`) não mudam.

Isso afeta hoje 26 arquivos com imports `@multiclubes/ui/...` e 3 com imports relativos
(`avatar` → `./seal`, `./tooltip`; `theme-toggle` → `./button`).

**Primeiro passo da implementação (também):** confirmar que o docs e o web compilam (`next build`, Turbopack)
com o alias apontando para o código do pacote. Se não compilarem, a alternativa é gerar uma cópia do
código com os imports trocados numa pasta do registry, gerada por script e checada na CI. Essa
alternativa só entra se a primeira falhar, e volta para conversa antes.

### Tema

- Item `theme`, com o tema padrão Multiclubes que hoje está em `packages/ui/src/styles/globals.css`.
- **Todo componente depende do `theme`**, para `add button` já trazer as cores Multiclubes.
- **As variáveis vão no campo `css`** (`":root"` e `".dark"`), não em `cssVars`. O spike mostrou
  que `cssVars` só acrescenta variáveis novas quando o tema chega como dependência, e não substitui
  as que o projeto já tem (o `--primary` do `init` do shadcn ficava). Com `css`, o CLI substitui,
  tanto no `add` direto quanto como dependência.
- Também vão no `theme`: o bloco `@theme inline` (mapeamento para `--color-*`, raios, `--font-heading`
  e a escala aninhada `--radius-surface/field/item`), `@custom-variant dark`, a `@layer base`, as
  regras de view-transition e as dependências `tw-animate-css` e o que o `@import "shadcn/tailwind.css"`
  exigir.
- **Não vai:** o `@source "../"`, que só faz sentido dentro do pacote.
- Keyframes e utilitários específicos de um componente (brand-loader, mosaic-loader, theme-toggle,
  `animate-fluid-*`) vão no item desse componente. O que é usado por vários fica no `theme`.

### Regra de temas de cliente

- O CSS global do projeto (`globals.css`) é do Mosaico: cada `add` reaplica as cores Multiclubes.
  Mudanças feitas direto nele se perdem no próximo `add`.
- Personalização de cliente fica **sempre num arquivo de tema separado**, carregado depois do CSS
  global, só com as variáveis que mudam. É o formato que o Portal já usa (`src/themes/<cliente>`) e
  o que o criador de temas do Studio vai exportar.

### Dependências

- `dependencies` de cada item: os pacotes npm que o arquivo importa (ex.: `@base-ui/react`,
  `@phosphor-icons/react`, `class-variance-authority`, `cn`, `date-fns`), **com a faixa de versão
  do `packages/ui/package.json`** (`recharts@3.8.0`, `react-day-picker@^10.0.2`). *Decisão do
  desenho:* sem a faixa, uma major nova do pacote quebraria o componente na instalação.
- `registryDependencies`: o `theme` e os outros itens do kit que o arquivo importa, **sempre com o
  endereço completo** `CauaYves/mosaico/<item>`. Nome solto (`"button"`) instala o button oficial do
  shadcn.

### Geração e checagem

- `packages/ui/registry.json` é **gerado por script** a partir do código: lê os imports de cada
  arquivo e monta `dependencies`, `registryDependencies`, `files` e `target`. `title` e
  `description` vêm de uma fonte única que o script lê (a definir pelo builder: frontmatter das
  páginas MDX do docs ou um mapa no próprio script).
- O CSS do `theme` também é gerado a partir de `globals.css`, para não existirem dois temas.
- A CI roda o script em modo `--check` e falha se o arquivo commitado estiver diferente, como já faz
  com `sync-ia`.

### Documentação

- `apps/docs`: a página `/docs/installation` e a seção de instalação de cada componente
  (`components/installation.tsx`) passam a mostrar `npx shadcn@latest add CauaYves/mosaico/<nome>`,
  com o passo `npx shadcn@latest init` para projetos novos e a regra de temas de cliente.
- `README.md` e `docs/plano.md`: tirar o pacote npm (seção 4.3, Fase 4, decisões em aberto 1 e 3) e
  registrar o registry como modelo de distribuição.
- O `sync-shadcn.mjs` reescreve imports para `@multiclubes/ui/components/`. Ele continua igual,
  porque gera os exemplos do docs, que importam como app.

## Restrições

- Tailwind v4 e React 19.2 no projeto de quem instala.
- A fonte (Geist) é carregada pelo app (ex.: `next/font`), não pelo tema. Sem ela os componentes
  funcionam com a fonte do sistema; a página de instalação documenta como carregar.
- O repositório precisa continuar público para o registry funcionar sem credenciais.
- Lint (Biome), tipos, testes e build da CI continuam passando.

## Fica a cargo do builder

- A forma do script gerador e onde ele mora (sugestão: `packages/ui/scripts/`).
- De onde vêm `title` e `description` dos itens.
- O nome exato dos itens de hook e lib, desde que estável.
- Como validar a instalação na CI. Sugestão: um projeto temporário, com o shadcn oficial já
  instalado em `components/ui`, que roda `shadcn add` de um item com dependências a partir da branch
  do PR e confere três coisas: os imports, o tema e que `components/ui` não mudou.

## Verificado no spike (2026-11-09)

Projeto Next limpo com `shadcn init` padrão, instalando de uma branch temporária do GitHub
(já apagada):

- Registry do GitHub com `include` funciona; caminhos relativos ao arquivo incluído.
- Tabela de imports acima.
- `cssVars` não substitui variáveis existentes; `css` com `:root`/`.dark` substitui, direto ou como
  dependência.
- Imports do Phosphor chegam intactos, mesmo com `iconLibrary: lucide` no projeto.
