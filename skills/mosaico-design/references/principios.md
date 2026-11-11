<!-- Gerado de apps/docs/content/docs/para-ia.mdx e apps/docs/lib/component-guide.ts por "pnpm --filter docs sync:ia". Não edite aqui. -->

# Princípios do Mosaico para materiais fora do código

## Instruções

Você vai criar material para a **Multiclubes**: relatório, documentação, apresentação, template de e-mail ou o visual de um projeto pequeno. Siga o padrão visual do **Mosaico**, o design system da empresa. O objetivo é que o resultado pareça da mesma empresa que os produtos dela.

### O que é definitivo e o que não é

Não trate tudo como regra fechada.

- **Definitivo:** forma arredondada, hierarquia, tokens semânticos, acessibilidade, tom de movimento e as regras de cada tipo de material abaixo.
- **Cores e fonte:** o **azul `#0540c5`** é a cor principal da interface (ações, foco e links) e o **amarelo `#fee502`** é o destaque. A fonte é a **Geist** (Sans para texto, Mono para código). Os cinzas são neutros de apoio e **não são a identidade de cor da marca**; não use o cinza como se fosse a cor da Multiclubes.

### Marca

- Logo: o símbolo é um "m" feito de arcos, e a wordmark é "Multiclubes" em formas de cantos suaves. Não redesenhe, não distorça, não recolora fora das cores abaixo e não escreva o nome com outra grafia.
- Cores da marca, extraídas da logo: **amarelo `#fee502`** e **azul `#0540c5`**.
- Use o azul para a ação principal e o amarelo para, no máximo, um elemento de destaque por peça. Não invente outras cores de marca.
- Texto sobre amarelo deve ser escuro. Texto sobre azul deve ser claro. Confira o contraste.

### Cores neutras

Use estes valores quando precisar de neutros. Em e-mail e em documentos, use sempre **hexadecimal**.

| Função | Hex | Uso |
| --- | --- | --- |
| Fundo | `#ffffff` | Fundo da página |
| Texto | `#0a0a0a` | Texto principal |
| Texto secundário | `#737373` | Legendas, datas, apoio |
| Superfície suave | `#f5f5f5` | Cards, blocos de destaque |
| Borda | `#e5e5e5` | Divisores e contornos |
| Ação principal | `#0540c5` | Botão principal, com texto claro |
| Erro | `#e7000b` | Erro e alerta destrutivo |

Use cores por **função**, não por aparência. Pense em "texto secundário", e não em "cinza claro".

### Forma

A identidade visual é de **formas suaves**, coerente com a logo.

- Botões são **pílulas**: raio total nas pontas.
- Campos, cards e blocos têm cantos bem arredondados, e os cards mais que os campos.
- Use um raio por tipo de elemento e repita. Elementos aninhados: o raio de dentro é o de fora menos o espaçamento entre eles.
- Evite cantos retos em botões e cards, e evite misturar cantos retos e arredondados na mesma peça.

### Hierarquia

- Uma mensagem principal por tela, página ou e-mail, e uma ação primária.
- Para destacar algo, enfraqueça o resto: texto secundário em `#737373`, e não aumentar tudo.
- Ênfase de ação, da mais forte para a mais fraca: cheia, secundária, contorno, texto. A ação destrutiva é discreta (fundo vermelho bem claro e texto vermelho), e a confirmação mostra a gravidade.
- Prefira espaço, fundo suave e sombra leve a bordas. Use borda só onde ela explica algo, como o contorno de um campo.
- Comece com espaço demais e tire.
- Linhas de texto de 45 a 75 caracteres. Texto menor pede entrelinha maior.

### Tipografia

- A fonte oficial ainda **não está definida**. Use uma sans-serif limpa e legível (`system-ui` ou equivalente) e avise na sua resposta que a fonte é temporária.
- Poucos tamanhos, bem distintos. Corpo de texto de 14 a 16 px. Nunca abaixo de 12 px.
- Peso e cor criam hierarquia junto com o tamanho. Evite preto puro `#000`; use `#0a0a0a`.

### Acessibilidade

- Não use só a cor para comunicar estado: acrescente ícone ou texto.
- Contraste de texto de pelo menos 4,5:1 (3:1 para texto grande).
- Alvos clicáveis de pelo menos 44 px de altura em e-mail e mobile.
- Imagens com texto alternativo. Links com texto que faça sentido fora do contexto (nunca "clique aqui").
- Foco visível em qualquer elemento interativo que você criar.

### Movimento (só para material interativo)

- Menos de 300 ms, com curva de desaceleração (`ease-out`).
- Elementos que aparecem partem de uma escala próxima de 1 (por exemplo 0,95) com opacidade, nunca de zero.
- Animação só onde ajuda a entender o que mudou. Respeite `prefers-reduced-motion`.

## Por tipo de material

### Template de e-mail

Clientes de e-mail são limitados, e a ordem de prioridade é funcionar em todos.

- Layout com **tabelas**, largura máxima de **600 px**, centralizado.
- **CSS inline.** Sem variáveis CSS, sem `oklch`, sem fontes externas confiáveis. Cores em hexadecimal.
- Pilha de fontes segura: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- Botões "à prova de bala": um link estilizado dentro de uma célula de tabela, com altura mínima de 44 px. O Outlook ignora cantos arredondados em alguns casos e mostra o botão reto. Isso é aceitável, o botão continua funcional.
- Uma ação principal, de preferência acima da dobra.
- Todo conteúdo importante em texto, não em imagem. Imagens com `alt`.
- Logo no topo, rodapé com o nome da empresa e o motivo de a pessoa estar recebendo a mensagem.
- Considere o modo escuro: não coloque texto escuro em imagem transparente e evite fundo branco puro em imagens.

### Relatório e apresentação

- Comece pela conclusão. O título diz o que o leitor deve concluir, não o assunto.
- Um gráfico, uma mensagem. Rotule direto no gráfico, em vez de legenda separada, quando couber.
- Poucas cores: neutros para o contexto e uma cor de destaque para o dado que importa.
- Números alinhados à direita e com o mesmo número de casas decimais.
- Resultados só com dados reais. Nunca invente métrica, percentual ou depoimento. Se faltar o dado, escreva que ele não foi medido.

### Documentação e textos

- Estrutura previsível: objetivo, como usar, exemplos, limites.
- Títulos curtos e que descrevem o conteúdo. Parágrafos curtos.
- Exemplos antes de explicações longas.
- Diga o que **não** está coberto, para o leitor não presumir.

### Projeto web ou protótipo fora do kit

Antes de criar qualquer elemento visual, consulte **"Qual componente usar"**: a tabela da skill, a página de componentes do catálogo ou o `/llms.txt`. Não recrie nada que o kit já tenha. Um bloco de código é um `code-block`, uma caixa de aviso é um `alert`, uma lista de etapas é um `item`.

Se o projeto usar React e Tailwind, instale os componentes pelo registry do Mosaico. O `init` configura o tema e os ícones Phosphor:

```bash
npx shadcn@latest init CauaYves/mosaico/base
npx shadcn@latest add CauaYves/mosaico/code-block
```

Num HTML estático ou em outro lugar sem React, reproduza o componente:

- Leia o `.tsx` dele em `packages/ui/src/components/<componente>.tsx`, no repositório [CauaYves/mosaico](https://github.com/CauaYves/mosaico).
- Copie a estrutura de elementos, os atributos `data-slot` e as classes de cada parte e da variante usada.
- Na resposta, diga qual componente cada bloco reproduz.

Use sempre classes semânticas (`bg-primary`, `text-muted-foreground`, `border-input`), nunca cores fixas.

## Como responder

1. Entregue o material pedido, e não uma explicação sobre o padrão.
2. No fim, liste em poucas linhas **as suposições** que você fez: fonte, uso de cores da marca, qualquer coisa que o padrão não define.
3. Se algum pedido do usuário conflitar com as regras acima, siga o pedido e avise qual regra deixou de ser seguida.
4. Não afirme que o resultado "segue o design system oficial". Diga que ele **segue os princípios do Mosaico**, e que o design deve revisar antes de publicar.

## Qual componente usar

Antes de criar qualquer elemento visual, ache aqui o componente do kit que resolve a necessidade. Instale com `npx shadcn@latest add CauaYves/mosaico/<componente>`, salvo quando a linha diz outro caminho. Os componentes com página ficam em `/docs/components/<componente>`.

### Formulário

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| mostrar um arquivo ou imagem anexada, com estado de envio e ações | `attachment` | Para anexos em formulários e conversas: miniatura, nome, tamanho, progresso de upload e botões como remover. Não use para listar registros comuns; use `item`. |
| botão para uma ação, ou link com aparência de botão | `button` | Para disparar uma ação. A variante mostra a ênfase: cheia, secundária, contorno, fantasma, link ou destrutiva. Não use para navegar entre páginas sem `render` com o link do framework; para ligar e desligar um estado, use `toggle` ou `switch`. |
| juntar botões relacionados lado a lado | `button-group` | Para ações que andam juntas, como exportar e opções de exportação, num bloco só. Para escolher uma opção entre várias, use `toggle-group`. |
| marcar ou desmarcar uma opção, ou várias de uma lista | `checkbox` | Para aceitar termos ou escolher várias opções independentes, dentro de um `field`. Para um ajuste que vale na hora, use `switch`; para só uma opção entre várias, use `radio-group`. |
| escolher de uma lista longa digitando para filtrar, com uma ou várias escolhas | `combobox` | Quando a lista é grande demais para rolar: o campo filtra as sugestões e aceita seleção múltipla em chips. Para poucas opções fixas, use `select`; para busca de ações e páginas, use `command`. |
| campo para digitar ou escolher uma data num formulário, no celular e no desktop | `date-field` | Para data em formulário: no celular abre as rodas de dia, mês e ano; no desktop é um campo com máscara. Para escolher período ou ver o mês inteiro, use `date-picker` ou `calendar`. |
| escolher uma data ou um período num calendário que abre ao clicar | `date-picker` | Para filtros e agendamentos em que ver o mês ajuda: botão que abre um `calendar` num `popover`, com períodos e atalhos. Para data de nascimento ou data digitada em formulário, use `date-field`. Não tem item próprio no registry: instale `popover`, `calendar` e `button` e monte como na página. |
| rodas de dia, mês e ano, no estilo do seletor nativo do celular | `date-wheel-picker` | Para escolher data no celular quando a roda fica solta na tela, sem campo. Num formulário, use `date-field`, que já usa a roda no celular. |
| montar um campo de formulário com rótulo, ajuda e mensagem de erro | `field` | Em todo campo de formulário: junta `label`, o controle, a descrição e o erro, e agrupa campos relacionados. Não use `alert` para erro de um campo; o erro vai no `field`. |
| campo de texto de uma linha: nome, e-mail, número, senha | `input` | Para entrada curta de texto, dentro de um `field`. Para texto longo, use `textarea`; com ícone, prefixo ou botão dentro do campo, use `input-group`. |
| campo com ícone, prefixo, sufixo ou botão dentro | `input-group` | Para busca com ícone, valor com unidade (R$, %), ou campo com botão de copiar ou enviar. |
| digitar um código de verificação de poucos dígitos | `input-otp` | Para códigos enviados por SMS ou e-mail: uma caixa por dígito, aceita colar o código inteiro. |
| rótulo de um controle de formulário | `label` | Para nomear um controle; o clique no rótulo leva ao controle. Em formulários, prefira `field`, que já traz o rótulo com descrição e erro. |
| lista de opções com o select nativo do navegador | `native-select` | Quando o seletor do próprio sistema é melhor, como no celular ou em formulários simples. Para opções com ícone ou descrição, use `select`; para filtrar digitando, use `combobox`. |
| questionário em etapas, uma pergunta por vez | `questionnaire` | Para pesquisas e cadastros guiados: escolha única, múltipla, resposta livre, perguntas puláveis e progresso. Para um formulário comum numa tela só, use `field`. |
| escolher só uma opção entre poucas, todas visíveis | `radio-group` | Para duas a cinco opções que a pessoa precisa comparar, como forma de pagamento. Para muitas opções, use `select`. |
| escolher uma opção numa lista que abre ao clicar | `select` | Para listas curtas e fixas, de cinco a quinze opções. Para filtrar digitando, use `combobox`; para poucas opções que valem a comparação, use `radio-group`. |
| escolher um valor ou uma faixa arrastando | `slider` | Para valores aproximados num intervalo, como limite, volume ou faixa de preço. Para valor exato, use `input`. |
| ligar ou desligar um ajuste que vale na hora | `switch` | Para preferências e configurações aplicadas sem botão de salvar. Para aceitar termos ou escolher itens que serão enviados depois, use `checkbox`. |
| campo de texto longo, de várias linhas | `textarea` | Para comentários, observações e mensagens, dentro de um `field`. |
| botão para trocar entre modo claro e escuro | `theme-toggle` | No cabeçalho do app, com os ícones do Mosaico e transição animada. |
| botão que fica ligado ou desligado, como negrito | `toggle` | Para um estado de exibição ou formatação ligado a um botão com ícone. Para um ajuste de configuração, use `switch`. |
| grupo de botões em que se escolhe um ou vários, como alinhar texto ou trocar a visualização | `toggle-group` | Para trocar entre modos de exibição (lista ou grade) ou formatar texto. Para trocar o conteúdo de uma área inteira, use `tabs`. |

### Navegação

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| barra de navegação flutuante no rodapé, só com ícones, para celular | `bottom-nav` | Para as três a cinco seções principais de um app no celular, com indicador que desliza até o item ativo. No desktop, use `sidebar` ou `navigation-menu`. |
| mostrar onde a pessoa está na hierarquia de páginas | `breadcrumb` | Em páginas com dois ou mais níveis, no topo, com links para os níveis acima. |
| paleta de comandos com busca, aberta por atalho | `command` | Para buscar páginas e ações rápidas pelo teclado, como no Ctrl+K. Para escolher um valor de formulário, use `combobox`. |
| menu de ações que abre com o botão direito | `context-menu` | Para ações sobre um item, como renomear ou excluir, em listas e áreas de trabalho. Não deixe uma ação só no botão direito: repita no `dropdown-menu`. |
| menu de ações que abre ao clicar num botão | `dropdown-menu` | Para ações secundárias agrupadas, como o botão "mais" de uma linha ou o menu da conta. Para escolher um valor de formulário, use `select`. |
| menu do topo do site com painéis em colunas | `dropdown-navigation` | Para a navegação principal de sites com muitas seções, com painéis que mudam de tamanho entre os itens. Para poucos links, use `navigation-menu`. |
| barra de menus fixa, como Arquivo, Editar e Exibir | `menubar` | Em ferramentas com cara de aplicativo de desktop, com muitos comandos agrupados. |
| links de navegação do topo do site, com submenus | `navigation-menu` | Para a navegação principal de um site com poucas seções. |
| navegar entre páginas de uma lista longa | `pagination` | Abaixo de tabelas e listas paginadas, com anterior, próxima e números. |
| menu lateral do app, que recolhe | `sidebar` | Para a navegação principal de apps com muitas seções no desktop; no celular vira gaveta. |
| alternar entre seções de conteúdo no mesmo lugar | `tabs` | Para visões do mesmo assunto, uma de cada vez, como "Visão geral" e "Histórico". Para filtrar uma lista ou trocar o modo de exibição, use `toggle-group`. |

### Feedback

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| caixa de aviso ou nota de destaque fixa na página, informativa ou de erro | `alert` | Para uma mensagem ou nota que precisa ficar visível no conteúdo: ícone, título curto, descrição e ação opcional. A variante `destructive` é para erro. Não use para erro de campo; use `field`. Para aviso passageiro, use `toast`; para confirmar algo grave, use `alert-dialog`. |
| etiqueta curta de status, categoria ou contagem | `badge` | Para status em tabelas e cards, como "Ativo" ou "Novo". Não use como botão. |
| estado vazio: quando não há nada para mostrar | `empty` | Em listas e buscas sem resultado, com ícone, explicação e a ação para começar. |
| nota de sistema numa conversa, ou separador com rótulo | `marker` | Em chats e linhas do tempo: status inline, aviso do sistema ou separador como "Hoje". |
| barra de progresso de uma tarefa | `progress` | Quando dá para medir o andamento, como upload ou etapas concluídas. Sem medida de andamento, use `spinner` ou `skeleton`. |
| placeholder com a forma do conteúdo enquanto carrega | `skeleton` | No carregamento de páginas e cards, para a tela não pular quando os dados chegam. |
| indicador de carregando, girando | `spinner` | Em ações curtas, como dentro de um botão enquanto salva. Para conteúdo de página carregando, use `skeleton`; para troca de página com a marca, use `mosaic-loader`. |
| aviso passageiro que aparece e some sozinho | `toast` | Para confirmar uma ação, como "Salvo", ou avisar um erro que não trava a tela. Para o que a pessoa precisa ler antes de seguir, use `alert` ou `alert-dialog`. |

### Dados

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| foto de perfil, com iniciais quando não há imagem | `avatar` | Para representar uma pessoa em listas, comentários e no menu da conta. |
| calendário mensal para escolher data ou período | `calendar` | Quando o calendário fica aberto na tela, como numa agenda. Num campo de formulário, use `date-picker` ou `date-field`. |
| gráfico de barras, linhas, áreas ou rosca | `chart` | Para mostrar dados com as cores do tema (`--chart-*`), legenda e tooltip. Feito com Recharts. |
| fatias de gráfico de rosca com ponta arredondada | `chart-donut` | Como `shape` das fatias de um `chart` de rosca, para fatias estreitas não sumirem. Não é um gráfico sozinho; monte o gráfico com `chart`. |
| mostrar código, log, saída de terminal ou diff | `code-block` | Para qualquer trecho de código: o título e o botão de copiar vão no cabeçalho (`code-block-header`), e há números de linha e linhas de diff. Para um termo de código no meio do texto, use `<code>` de `typography`; para tecla de atalho, use `kbd`. |
| tabela de dados com ordenação, filtro, paginação e seleção | `data-table` | Para listas grandes que a pessoa precisa explorar. Monta `table` com TanStack Table. Para poucos dados fixos, use `table`. Não tem item próprio no registry: instale `table` e o pacote `@tanstack/react-table`. |
| linha de lista com ícone, número ou imagem, título, descrição e ações, como etapas de um plano | `item` | Para listas de etapas, configurações, arquivos ou pessoas, num `item-group`; solta na página, use a variante `outline`. Para dados em colunas comparáveis, use `table`. |
| mostrar uma tecla ou atalho de teclado | `kbd` | Para indicar atalhos, como Ctrl + K, em textos, menus e tooltips. |
| tabela simples de dados em linhas e colunas | `table` | Para dados que se comparam por coluna, sem ordenação nem filtro. Com ordenação, filtro ou paginação, use `data-table`. |
| mostrar passos de raciocínio, chamadas de ferramenta e fontes de um assistente | `trace` | Em interfaces de IA, para o que o assistente fez, com status, descrição e detalhes recolhíveis. |
| estilos de texto: títulos, parágrafos, listas, citações e código no texto | `typography` | Para conteúdo de texto corrido, como páginas de ajuda e artigos. Não tem item no registry: são classes do Tailwind sobre o tema, sem nada para instalar. |

### Overlay

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| confirmar uma ação grave antes de executar | `alert-dialog` | Para excluir, cancelar ou qualquer ação difícil de desfazer: bloqueia a tela até a resposta. Para formulários e conteúdo, use `dialog`. |
| janela modal sobre a página | `dialog` | Para uma tarefa curta sem sair da tela, como editar um registro. Para confirmar ação grave, use `alert-dialog`; para painel lateral, use `sheet`; no celular, prefira `drawer`. |
| painel que sobe do rodapé e se arrasta para fechar, no celular | `drawer` | Para ações e formulários curtos no celular, no lugar de um `dialog`. |
| prévia de conteúdo ao passar o mouse num link | `hover-card` | Para mostrar um resumo do que está atrás de um link, como o perfil de uma pessoa. Não coloque nada essencial nele: não funciona no toque. Para dica curta, use `tooltip`. |
| caixa flutuante com conteúdo, aberta por um botão | `popover` | Para filtros, ajustes rápidos e pequenos formulários presos a um botão. Para lista de ações, use `dropdown-menu`; para dica curta, use `tooltip`. |
| painel lateral que desliza da borda da tela | `sheet` | Para detalhes, filtros ou formulários longos sem sair da página. |
| dica curta ao passar o mouse ou focar um elemento | `tooltip` | Para nomear botões só de ícone ou explicar um termo. Não coloque informação essencial; ela não aparece no toque. |

### Layout

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| lista de seções que abrem e fecham, como perguntas frequentes | `accordion` | Para conteúdo longo dividido em tópicos, em que a pessoa abre só o que interessa. Para um bloco só que abre e fecha, use `collapsible`. |
| manter imagem ou vídeo numa proporção fixa | `aspect-ratio` | Para mídias em 16:9, 4:3 ou quadradas que não podem distorcer. |
| cartão para agrupar um bloco de conteúdo | `card` | Para agrupar informação relacionada, com cabeçalho, conteúdo e rodapé. |
| carrossel que passa itens com setas ou arrastando | `carousel` | Para galerias e vitrines em que ver um item por vez basta. Para faixa que rola sozinha sem parar, use `marquee`. |
| mostrar e esconder um bloco de conteúdo | `collapsible` | Para detalhes opcionais, como "Mostrar mais". |
| definir a direção do texto (esquerda para a direita ou o contrário) | `direction` | Para apps com idiomas da direita para a esquerda, envolvendo o app. |
| faixa que rola sem parar, na horizontal ou na vertical | `marquee` | Para vitrines de logos, depoimentos ou componentes. Não use para conteúdo que a pessoa precisa ler com calma ou controlar; use `carousel`. |
| painéis lado a lado que a pessoa redimensiona arrastando | `resizable` | Em editores e áreas de trabalho com lista e detalhe. |
| área com rolagem própria e barra estilizada | `scroll-area` | Para listas longas dentro de um bloco de altura fixa, como num menu ou painel. |
| linha para separar blocos de conteúdo | `separator` | Entre grupos de itens num menu ou seções de um card. Prefira espaço a linha quando o espaço já separa. |

### Mensagens

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| balão de mensagem de chat | `bubble` | Para o texto de cada mensagem numa conversa, com variantes, alinhamento, agrupamento e reações. |
| mensagem de conversa com avatar, autor e horário | `message` | Para montar cada mensagem de um chat; o conteúdo vai num `bubble`. |
| área de chat que rola sozinha para a última mensagem | `message-scroller` | Para conversas que recebem mensagens em tempo real e carregam histórico sem pular. |

### Marca

| Necessidade | Componente | Quando usar |
| --- | --- | --- |
| seção com uma palavra gigante e apagada ao fundo | `backdrop-text` | Para dar identidade a uma seção de destaque, como a abertura de uma página. |
| cartão de destaque com as cores da marca | `brand-card` | Para campanhas e chamadas, com traços fluidos em azul e amarelo. Para agrupar conteúdo comum, use `card`. |
| painel de seção com um brilho amarelo suave no canto | `gradient-panel` | Para destacar um bloco de conteúdo numa página. |
| carregamento com a marca, para troca de página | `mosaic-loader` | Na entrada do app ou entre páginas: a imagem da marca em peças que pulsam em onda. Para carregar um bloco, use `skeleton`; dentro de um botão, use `spinner`. |
| selo da Multiclubes que marca uma empresa como cliente | `seal` | Em páginas de cliente e materiais de parceria, com o "m" ou o logo do cliente no centro. |
