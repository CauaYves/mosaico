# Mosaico Studio: visão

> Status: visão registrada, sem desenho detalhado · 2026-11-08
>
> Este repositório é público. Este documento guarda só a visão e as decisões tomadas; o código
> e os detalhes dos produtos ficam no repositório privado do Studio.

## Por quê

Mostrar, com os produtos reais da Multiclubes, o que o Mosaico muda: o antes e o depois de cada
aplicação, na aparência e na arquitetura. E dar a quem monta temas de cliente uma ferramenta
rápida para criar um tema novo para qualquer aplicação existente.

## O que é

Um app **privado e interno**, o Mosaico Studio, separado deste repositório. Ele consome o Mosaico
pelo registry shadcn, como qualquer outro projeto da empresa. A página central é a **Create**.

### Página Create

De cima para baixo:

1. **Experiência zero: antes e depois.** Para quem chega sem contexto. Cada projeto aparece em
   molduras de celular, rodando de verdade (não são capturas de tela): como é hoje e como fica
   com o Mosaico, com um resumo do que mudou na arquitetura.
2. **Criar tema de cliente.** Para quem já conhece. Escolhe a aplicação, informa o cliente, e o
   Studio busca as imagens no site do próprio cliente (favicon, ícones, `og:image`, logo,
   imagens de destaque). A pessoa escolhe as imagens para as vagas que a aplicação define, ajusta
   cores, raio e fonte com prévia ao vivo e exporta o tema.
3. **Elementos e componentes.** As prévias do `/create` atual, no fim da página.

A página é construída com os componentes do Mosaico e segue as regras de design do kit.

## Decisões

- O código dos produtos **não** entra neste repositório público.
- Os apps rodam no Studio com **dados mockados**: sem backend real, sem login real, sem dados de
  pessoas.
- Imagens de tema vêm do **site do cliente**, lidas pelo servidor do Studio. Sem raspagem do
  Google e sem API paga.
- Arquitetura pesa tanto quanto UI/UX: a refatoração de cada projeto é também técnica, e a página
  mostra isso.

## Ordem

0. Registry do Mosaico (pré-requisito: o Studio consome o kit por ele).
1. Base do Studio: repositório privado, projetos com dados mockados, Create com o "antes".
   Primeiro projeto: Portal.
2. Criador de tema, começando pelo Portal.
3. Refatorações, cada uma um projeto próprio que preenche o "depois": PhotoCapture, Portal,
   WebCheckout, Dashboard.

Cada etapa passa pelo próprio desenho antes de ser construída.
