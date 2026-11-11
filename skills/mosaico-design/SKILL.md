---
name: mosaico-design
description: Aplica os princípios visuais do Mosaico, o design system da Multiclubes, ao criar relatórios, documentação, apresentações, templates de e-mail, protótipos ou qualquer material para a Multiclubes fora do código dos produtos. Use quando o pedido citar Multiclubes, Mosaico, identidade visual ou padrão da empresa, ou pedir um e-mail, relatório ou documento em nome da empresa.
---

# Mosaico: princípios de design da Multiclubes

Esta skill faz o material parecer da mesma empresa que os produtos. Ela não substitui o design: o resultado segue os **princípios** do Mosaico e deve ser revisado pelo design antes de publicar.

## Como usar

1. Leia `references/principios.md` por inteiro antes de começar. Ele é a fonte das regras: o que é definitivo e as regras por tipo de material (e-mail, relatório, documentação, projeto web).
2. Identifique o tipo de material pedido e siga a seção correspondente.
3. Liste os elementos do material (blocos de código, avisos, listas, tabelas, botões) e ache o componente de cada um na tabela "Qual componente usar", no fim de `references/principios.md`, antes de começar.
4. Se o projeto for React com Tailwind, instale os componentes pelo registry do Mosaico (`npx shadcn@latest init CauaYves/mosaico/base` e depois `npx shadcn@latest add CauaYves/mosaico/<nome>`) em vez de recriá-los. Sem React, reproduza a estrutura e as classes do `.tsx` de cada componente e diga qual componente cada bloco reproduz.
5. Entregue o material pedido. No fim, liste em poucas linhas as suposições que você fez, principalmente o que o padrão não define.

## Limites

- Não afirme que o resultado "segue o design system oficial". Diga que segue os princípios do Mosaico.
- Não invente métricas, depoimentos ou cores de marca.
- Se o pedido conflitar com as regras, siga o pedido e avise qual regra deixou de ser seguida.
