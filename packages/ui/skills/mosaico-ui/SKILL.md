---
name: mosaico-ui
description: Regras para criar e alterar telas num projeto que usa o Mosaico, o design system da Multiclubes, instalado pelo registry shadcn (CauaYves/mosaico). Use sempre que for criar, alterar ou revisar interface neste projeto, incluindo componentes, páginas, formulários, ícones, cores, tema e gráficos.
---

# Mosaico neste projeto

Este projeto usa o **Mosaico**, o design system da Multiclubes. Os componentes vêm do registry shadcn `CauaYves/mosaico` e viram código do projeto. Siga estas regras ao escrever interface. As regras visuais completas (marca, forma, hierarquia, acessibilidade e movimento) estão em `references/principios.md`: leia antes de criar uma tela nova.

## Componentes

- Use os componentes de `@/components/mosaico/*`, como `Button`, `Input`, `Card` e `Dialog`. Os hooks ficam em `@/hooks/mosaico/*` e os utilitários em `@/lib/mosaico/*`.
- Se faltar um componente, instale do Mosaico antes de escrever um novo:

  ```bash
  npx shadcn@latest add CauaYves/mosaico/<nome>
  ```

  O catálogo está em https://multiui-kit.vercel.app/docs/components.
- Não use o shadcn oficial (`@/components/ui/*`) para algo que o Mosaico já tem, e não crie uma segunda versão de um componente do kit.
- Personalize por variantes, props, composição e `className`. Integrações como o `Link` e o `Image` do framework entram pela prop `render`.

## Ícones

- Use só o Phosphor (`@phosphor-icons/react`), no peso padrão. Não instale outra biblioteca de ícones, como `lucide-react`.

## Cores e tema

- Use classes semânticas (`bg-primary`, `text-muted-foreground`, `border-input`, `bg-card`), nunca cores fixas como `bg-blue-600` ou `#0540c5`.
- Gráficos têm cor própria: use `--chart-brand` e `--chart-1` a `--chart-5`, não o `--primary`.
- Não edite as variáveis do Mosaico no CSS global: cada `shadcn add` as reaplica. Personalização de cliente fica num arquivo de tema separado, carregado depois do CSS global, só com as variáveis que mudam.
- O modo escuro vem da classe `.dark`. Confira as duas versões da tela.

## Forma

- Botões são pílulas. Prefira os raios do tema a valores soltos como `rounded-md`: `rounded-surface` em cards e painéis, `rounded-field` em campos e `rounded-item` em itens dentro deles. Assim o raio acompanha o `--radius` do tema.

## Limites

- Se um pedido conflitar com estas regras, siga o pedido e avise qual regra deixou de ser seguida.
- Estas regras vêm do registry do Mosaico (`npx shadcn@latest init CauaYves/mosaico/base`). Edite à vontade, mas um novo `init` da base sobrescreve este arquivo.
