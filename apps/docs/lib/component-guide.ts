// Guia "qual componente usar": para cada componente do kit, a necessidade de quem procura, quando
// usar e, se couber, quando não usar. É a fonte da tabela da skill (lib/ia.ts), da lista do
// /llms.txt e da galeria em /docs/components.
//
// Cobre todo arquivo de packages/ui/src/components e toda página de componente do docs. O
// "pnpm --filter docs guide:check" (na CI) falha se faltar uma entrada. As categorias vêm de
// component-categories.ts.
import { COMPONENT_CATEGORIES, getComponentCategory } from "./component-categories.ts";

export type ComponentGuideEntry = {
  /** A necessidade, na voz de quem procura. */
  need: string;
  /** Quando usar, em uma frase. */
  useWhen: string;
  /** Quando não usar, e o que usar no lugar. */
  avoidWhen?: string;
  /**
   * Para o que não é item do registry (só tem página no docs): como montar ou instalar. Sem isto,
   * o componente precisa existir em packages/ui/registry.json.
   */
  build?: string;
};

export const COMPONENT_GUIDE: Record<string, ComponentGuideEntry> = {
  // Formulário
  attachment: {
    need: "mostrar um arquivo ou imagem anexada, com estado de envio e ações",
    useWhen:
      "Para anexos em formulários e conversas: miniatura, nome, tamanho, progresso de upload e botões como remover.",
    avoidWhen: "Não use para listar registros comuns; use `item`.",
  },
  button: {
    need: "botão para uma ação, ou link com aparência de botão",
    useWhen:
      "Para disparar uma ação. A variante mostra a ênfase: cheia, secundária, contorno, fantasma, link ou destrutiva.",
    avoidWhen:
      "Não use para navegar entre páginas sem `render` com o link do framework; para ligar e desligar um estado, use `toggle` ou `switch`.",
  },
  "button-group": {
    need: "juntar botões relacionados lado a lado",
    useWhen: "Para ações que andam juntas, como exportar e opções de exportação, num bloco só.",
    avoidWhen: "Para escolher uma opção entre várias, use `toggle-group`.",
  },
  checkbox: {
    need: "marcar ou desmarcar uma opção, ou várias de uma lista",
    useWhen: "Para aceitar termos ou escolher várias opções independentes, dentro de um `field`.",
    avoidWhen:
      "Para um ajuste que vale na hora, use `switch`; para só uma opção entre várias, use `radio-group`.",
  },
  combobox: {
    need: "escolher de uma lista longa digitando para filtrar, com uma ou várias escolhas",
    useWhen:
      "Quando a lista é grande demais para rolar: o campo filtra as sugestões e aceita seleção múltipla em chips.",
    avoidWhen:
      "Para poucas opções fixas, use `select`; para busca de ações e páginas, use `command`.",
  },
  "date-field": {
    need: "campo para digitar ou escolher uma data num formulário, no celular e no desktop",
    useWhen:
      "Para data em formulário: no celular abre as rodas de dia, mês e ano; no desktop é um campo com máscara.",
    avoidWhen: "Para escolher período ou ver o mês inteiro, use `date-picker` ou `calendar`.",
  },
  "date-picker": {
    need: "escolher uma data ou um período num calendário que abre ao clicar",
    useWhen:
      "Para filtros e agendamentos em que ver o mês ajuda: botão que abre um `calendar` num `popover`, com períodos e atalhos.",
    avoidWhen: "Para data de nascimento ou data digitada em formulário, use `date-field`.",
    build:
      "Não tem item próprio no registry: instale `popover`, `calendar` e `button` e monte como na página.",
  },
  "date-wheel-picker": {
    need: "rodas de dia, mês e ano, no estilo do seletor nativo do celular",
    useWhen: "Para escolher data no celular quando a roda fica solta na tela, sem campo.",
    avoidWhen: "Num formulário, use `date-field`, que já usa a roda no celular.",
  },
  field: {
    need: "montar um campo de formulário com rótulo, ajuda e mensagem de erro",
    useWhen:
      "Em todo campo de formulário: junta `label`, o controle, a descrição e o erro, e agrupa campos relacionados.",
    avoidWhen: "Não use `alert` para erro de um campo; o erro vai no `field`.",
  },
  input: {
    need: "campo de texto de uma linha: nome, e-mail, número, senha",
    useWhen: "Para entrada curta de texto, dentro de um `field`.",
    avoidWhen:
      "Para texto longo, use `textarea`; com ícone, prefixo ou botão dentro do campo, use `input-group`.",
  },
  "input-group": {
    need: "campo com ícone, prefixo, sufixo ou botão dentro",
    useWhen:
      "Para busca com ícone, valor com unidade (R$, %), ou campo com botão de copiar ou enviar.",
  },
  "input-otp": {
    need: "digitar um código de verificação de poucos dígitos",
    useWhen:
      "Para códigos enviados por SMS ou e-mail: uma caixa por dígito, aceita colar o código inteiro.",
  },
  label: {
    need: "rótulo de um controle de formulário",
    useWhen: "Para nomear um controle; o clique no rótulo leva ao controle.",
    avoidWhen: "Em formulários, prefira `field`, que já traz o rótulo com descrição e erro.",
  },
  "native-select": {
    need: "lista de opções com o select nativo do navegador",
    useWhen:
      "Quando o seletor do próprio sistema é melhor, como no celular ou em formulários simples.",
    avoidWhen:
      "Para opções com ícone ou descrição, use `select`; para filtrar digitando, use `combobox`.",
  },
  questionnaire: {
    need: "questionário em etapas, uma pergunta por vez",
    useWhen:
      "Para pesquisas e cadastros guiados: escolha única, múltipla, resposta livre, perguntas puláveis e progresso.",
    avoidWhen: "Para um formulário comum numa tela só, use `field`.",
  },
  "radio-group": {
    need: "escolher só uma opção entre poucas, todas visíveis",
    useWhen: "Para duas a cinco opções que a pessoa precisa comparar, como forma de pagamento.",
    avoidWhen: "Para muitas opções, use `select`.",
  },
  select: {
    need: "escolher uma opção numa lista que abre ao clicar",
    useWhen: "Para listas curtas e fixas, de cinco a quinze opções.",
    avoidWhen:
      "Para filtrar digitando, use `combobox`; para poucas opções que valem a comparação, use `radio-group`.",
  },
  slider: {
    need: "escolher um valor ou uma faixa arrastando",
    useWhen: "Para valores aproximados num intervalo, como limite, volume ou faixa de preço.",
    avoidWhen: "Para valor exato, use `input`.",
  },
  switch: {
    need: "ligar ou desligar um ajuste que vale na hora",
    useWhen: "Para preferências e configurações aplicadas sem botão de salvar.",
    avoidWhen: "Para aceitar termos ou escolher itens que serão enviados depois, use `checkbox`.",
  },
  textarea: {
    need: "campo de texto longo, de várias linhas",
    useWhen: "Para comentários, observações e mensagens, dentro de um `field`.",
  },
  "theme-toggle": {
    need: "botão para trocar entre modo claro e escuro",
    useWhen: "No cabeçalho do app, com os ícones do Mosaico e transição animada.",
  },
  toggle: {
    need: "botão que fica ligado ou desligado, como negrito",
    useWhen: "Para um estado de exibição ou formatação ligado a um botão com ícone.",
    avoidWhen: "Para um ajuste de configuração, use `switch`.",
  },
  "toggle-group": {
    need: "grupo de botões em que se escolhe um ou vários, como alinhar texto ou trocar a visualização",
    useWhen: "Para trocar entre modos de exibição (lista ou grade) ou formatar texto.",
    avoidWhen: "Para trocar o conteúdo de uma área inteira, use `tabs`.",
  },

  // Navegação
  "bottom-nav": {
    need: "barra de navegação flutuante no rodapé, só com ícones, para celular",
    useWhen:
      "Para as três a cinco seções principais de um app no celular, com indicador que desliza até o item ativo.",
    avoidWhen: "No desktop, use `sidebar` ou `navigation-menu`.",
  },
  breadcrumb: {
    need: "mostrar onde a pessoa está na hierarquia de páginas",
    useWhen: "Em páginas com dois ou mais níveis, no topo, com links para os níveis acima.",
  },
  command: {
    need: "paleta de comandos com busca, aberta por atalho",
    useWhen: "Para buscar páginas e ações rápidas pelo teclado, como no Ctrl+K.",
    avoidWhen: "Para escolher um valor de formulário, use `combobox`.",
  },
  "context-menu": {
    need: "menu de ações que abre com o botão direito",
    useWhen: "Para ações sobre um item, como renomear ou excluir, em listas e áreas de trabalho.",
    avoidWhen: "Não deixe uma ação só no botão direito: repita no `dropdown-menu`.",
  },
  "dropdown-menu": {
    need: "menu de ações que abre ao clicar num botão",
    useWhen:
      'Para ações secundárias agrupadas, como o botão "mais" de uma linha ou o menu da conta.',
    avoidWhen: "Para escolher um valor de formulário, use `select`.",
  },
  "dropdown-navigation": {
    need: "menu do topo do site com painéis em colunas",
    useWhen:
      "Para a navegação principal de sites com muitas seções, com painéis que mudam de tamanho entre os itens.",
    avoidWhen: "Para poucos links, use `navigation-menu`.",
  },
  menubar: {
    need: "barra de menus fixa, como Arquivo, Editar e Exibir",
    useWhen: "Em ferramentas com cara de aplicativo de desktop, com muitos comandos agrupados.",
  },
  "navigation-menu": {
    need: "links de navegação do topo do site, com submenus",
    useWhen: "Para a navegação principal de um site com poucas seções.",
  },
  pagination: {
    need: "navegar entre páginas de uma lista longa",
    useWhen: "Abaixo de tabelas e listas paginadas, com anterior, próxima e números.",
  },
  sidebar: {
    need: "menu lateral do app, que recolhe",
    useWhen:
      "Para a navegação principal de apps com muitas seções no desktop; no celular vira gaveta.",
  },
  tabs: {
    need: "alternar entre seções de conteúdo no mesmo lugar",
    useWhen: 'Para visões do mesmo assunto, uma de cada vez, como "Visão geral" e "Histórico".',
    avoidWhen: "Para filtrar uma lista ou trocar o modo de exibição, use `toggle-group`.",
  },

  // Feedback
  alert: {
    need: "caixa de aviso ou nota de destaque fixa na página, informativa ou de erro",
    useWhen:
      "Para uma mensagem ou nota que precisa ficar visível no conteúdo: ícone, título curto, descrição e ação opcional. A variante `destructive` é para erro.",
    avoidWhen:
      "Não use para erro de campo; use `field`. Para aviso passageiro, use `toast`; para confirmar algo grave, use `alert-dialog`.",
  },
  badge: {
    need: "etiqueta curta de status, categoria ou contagem",
    useWhen: 'Para status em tabelas e cards, como "Ativo" ou "Novo".',
    avoidWhen: "Não use como botão.",
  },
  empty: {
    need: "estado vazio: quando não há nada para mostrar",
    useWhen: "Em listas e buscas sem resultado, com ícone, explicação e a ação para começar.",
  },
  marker: {
    need: "nota de sistema numa conversa, ou separador com rótulo",
    useWhen:
      'Em chats e linhas do tempo: status inline, aviso do sistema ou separador como "Hoje".',
  },
  progress: {
    need: "barra de progresso de uma tarefa",
    useWhen: "Quando dá para medir o andamento, como upload ou etapas concluídas.",
    avoidWhen: "Sem medida de andamento, use `spinner` ou `skeleton`.",
  },
  skeleton: {
    need: "placeholder com a forma do conteúdo enquanto carrega",
    useWhen: "No carregamento de páginas e cards, para a tela não pular quando os dados chegam.",
  },
  spinner: {
    need: "indicador de carregando, girando",
    useWhen: "Em ações curtas, como dentro de um botão enquanto salva.",
    avoidWhen:
      "Para conteúdo de página carregando, use `skeleton`; para troca de página com a marca, use `mosaic-loader`.",
  },
  toast: {
    need: "aviso passageiro que aparece e some sozinho",
    useWhen: 'Para confirmar uma ação, como "Salvo", ou avisar um erro que não trava a tela.',
    avoidWhen: "Para o que a pessoa precisa ler antes de seguir, use `alert` ou `alert-dialog`.",
  },

  // Dados
  avatar: {
    need: "foto de perfil, com iniciais quando não há imagem",
    useWhen: "Para representar uma pessoa em listas, comentários e no menu da conta.",
  },
  calendar: {
    need: "calendário mensal para escolher data ou período",
    useWhen: "Quando o calendário fica aberto na tela, como numa agenda.",
    avoidWhen: "Num campo de formulário, use `date-picker` ou `date-field`.",
  },
  chart: {
    need: "gráfico de barras, linhas, áreas ou rosca",
    useWhen:
      "Para mostrar dados com as cores do tema (`--chart-*`), legenda e tooltip. Feito com Recharts.",
  },
  "chart-donut": {
    need: "fatias de gráfico de rosca com ponta arredondada",
    useWhen: "Como `shape` das fatias de um `chart` de rosca, para fatias estreitas não sumirem.",
    avoidWhen: "Não é um gráfico sozinho; monte o gráfico com `chart`.",
  },
  "code-block": {
    need: "mostrar código, log, saída de terminal ou diff",
    useWhen:
      "Para qualquer trecho de código: o título e o botão de copiar vão no cabeçalho (`code-block-header`), e há números de linha e linhas de diff.",
    avoidWhen:
      "Para um termo de código no meio do texto, use `<code>` de `typography`; para tecla de atalho, use `kbd`.",
  },
  "data-table": {
    need: "tabela de dados com ordenação, filtro, paginação e seleção",
    useWhen: "Para listas grandes que a pessoa precisa explorar. Monta `table` com TanStack Table.",
    avoidWhen: "Para poucos dados fixos, use `table`.",
    build: "Não tem item próprio no registry: instale `table` e o pacote `@tanstack/react-table`.",
  },
  item: {
    need: "linha de lista com ícone, número ou imagem, título, descrição e ações, como etapas de um plano",
    useWhen:
      "Para listas de etapas, configurações, arquivos ou pessoas, num `item-group`; solta na página, use a variante `outline`.",
    avoidWhen: "Para dados em colunas comparáveis, use `table`.",
  },
  kbd: {
    need: "mostrar uma tecla ou atalho de teclado",
    useWhen: "Para indicar atalhos, como Ctrl + K, em textos, menus e tooltips.",
  },
  table: {
    need: "tabela simples de dados em linhas e colunas",
    useWhen: "Para dados que se comparam por coluna, sem ordenação nem filtro.",
    avoidWhen: "Com ordenação, filtro ou paginação, use `data-table`.",
  },
  trace: {
    need: "mostrar passos de raciocínio, chamadas de ferramenta e fontes de um assistente",
    useWhen:
      "Em interfaces de IA, para o que o assistente fez, com status, descrição e detalhes recolhíveis.",
  },
  typography: {
    need: "estilos de texto: títulos, parágrafos, listas, citações e código no texto",
    useWhen: "Para conteúdo de texto corrido, como páginas de ajuda e artigos.",
    build:
      "Não tem item no registry: são classes do Tailwind sobre o tema, sem nada para instalar.",
  },

  // Overlay
  "alert-dialog": {
    need: "confirmar uma ação grave antes de executar",
    useWhen:
      "Para excluir, cancelar ou qualquer ação difícil de desfazer: bloqueia a tela até a resposta.",
    avoidWhen: "Para formulários e conteúdo, use `dialog`.",
  },
  dialog: {
    need: "janela modal sobre a página",
    useWhen: "Para uma tarefa curta sem sair da tela, como editar um registro.",
    avoidWhen:
      "Para confirmar ação grave, use `alert-dialog`; para painel lateral, use `sheet`; no celular, prefira `drawer`.",
  },
  drawer: {
    need: "painel que sobe do rodapé e se arrasta para fechar, no celular",
    useWhen: "Para ações e formulários curtos no celular, no lugar de um `dialog`.",
  },
  "hover-card": {
    need: "prévia de conteúdo ao passar o mouse num link",
    useWhen: "Para mostrar um resumo do que está atrás de um link, como o perfil de uma pessoa.",
    avoidWhen:
      "Não coloque nada essencial nele: não funciona no toque. Para dica curta, use `tooltip`.",
  },
  popover: {
    need: "caixa flutuante com conteúdo, aberta por um botão",
    useWhen: "Para filtros, ajustes rápidos e pequenos formulários presos a um botão.",
    avoidWhen: "Para lista de ações, use `dropdown-menu`; para dica curta, use `tooltip`.",
  },
  sheet: {
    need: "painel lateral que desliza da borda da tela",
    useWhen: "Para detalhes, filtros ou formulários longos sem sair da página.",
  },
  tooltip: {
    need: "dica curta ao passar o mouse ou focar um elemento",
    useWhen: "Para nomear botões só de ícone ou explicar um termo.",
    avoidWhen: "Não coloque informação essencial; ela não aparece no toque.",
  },

  // Layout
  accordion: {
    need: "lista de seções que abrem e fecham, como perguntas frequentes",
    useWhen: "Para conteúdo longo dividido em tópicos, em que a pessoa abre só o que interessa.",
    avoidWhen: "Para um bloco só que abre e fecha, use `collapsible`.",
  },
  "aspect-ratio": {
    need: "manter imagem ou vídeo numa proporção fixa",
    useWhen: "Para mídias em 16:9, 4:3 ou quadradas que não podem distorcer.",
  },
  card: {
    need: "cartão para agrupar um bloco de conteúdo",
    useWhen: "Para agrupar informação relacionada, com cabeçalho, conteúdo e rodapé.",
  },
  carousel: {
    need: "carrossel que passa itens com setas ou arrastando",
    useWhen: "Para galerias e vitrines em que ver um item por vez basta.",
    avoidWhen: "Para faixa que rola sozinha sem parar, use `marquee`.",
  },
  collapsible: {
    need: "mostrar e esconder um bloco de conteúdo",
    useWhen: 'Para detalhes opcionais, como "Mostrar mais".',
  },
  direction: {
    need: "definir a direção do texto (esquerda para a direita ou o contrário)",
    useWhen: "Para apps com idiomas da direita para a esquerda, envolvendo o app.",
  },
  marquee: {
    need: "faixa que rola sem parar, na horizontal ou na vertical",
    useWhen: "Para vitrines de logos, depoimentos ou componentes.",
    avoidWhen:
      "Não use para conteúdo que a pessoa precisa ler com calma ou controlar; use `carousel`.",
  },
  resizable: {
    need: "painéis lado a lado que a pessoa redimensiona arrastando",
    useWhen: "Em editores e áreas de trabalho com lista e detalhe.",
  },
  "scroll-area": {
    need: "área com rolagem própria e barra estilizada",
    useWhen: "Para listas longas dentro de um bloco de altura fixa, como num menu ou painel.",
  },
  separator: {
    need: "linha para separar blocos de conteúdo",
    useWhen: "Entre grupos de itens num menu ou seções de um card.",
    avoidWhen: "Prefira espaço a linha quando o espaço já separa.",
  },

  // Mensagens
  bubble: {
    need: "balão de mensagem de chat",
    useWhen:
      "Para o texto de cada mensagem numa conversa, com variantes, alinhamento, agrupamento e reações.",
  },
  message: {
    need: "mensagem de conversa com avatar, autor e horário",
    useWhen: "Para montar cada mensagem de um chat; o conteúdo vai num `bubble`.",
  },
  "message-scroller": {
    need: "área de chat que rola sozinha para a última mensagem",
    useWhen: "Para conversas que recebem mensagens em tempo real e carregam histórico sem pular.",
  },

  // Marca
  "backdrop-text": {
    need: "seção com uma palavra gigante e apagada ao fundo",
    useWhen: "Para dar identidade a uma seção de destaque, como a abertura de uma página.",
  },
  "brand-card": {
    need: "cartão de destaque com as cores da marca",
    useWhen: "Para campanhas e chamadas, com traços fluidos em azul e amarelo.",
    avoidWhen: "Para agrupar conteúdo comum, use `card`.",
  },
  "gradient-panel": {
    need: "painel de seção com um brilho amarelo suave no canto",
    useWhen: "Para destacar um bloco de conteúdo numa página.",
  },
  "mosaic-loader": {
    need: "carregamento com a marca, para troca de página",
    useWhen: "Na entrada do app ou entre páginas: a imagem da marca em peças que pulsam em onda.",
    avoidWhen: "Para carregar um bloco, use `skeleton`; dentro de um botão, use `spinner`.",
  },
  seal: {
    need: "selo da Multiclubes que marca uma empresa como cliente",
    useWhen:
      'Em páginas de cliente e materiais de parceria, com o "m" ou o logo do cliente no centro.',
  },
};

export type ComponentGuideRow = ComponentGuideEntry & { slug: string; category: string };

const CATEGORY_ORDER: string[] = [
  ...COMPONENT_CATEGORIES.map((category) => category.name),
  "Outros",
];

/** O guia em linhas, na ordem das categorias da galeria e, dentro delas, por nome. */
export function componentGuideRows(): ComponentGuideRow[] {
  return Object.entries(COMPONENT_GUIDE)
    .map(([slug, entry]) => ({ slug, category: getComponentCategory(slug), ...entry }))
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
        a.slug.localeCompare(b.slug),
    );
}

/** Entrada do guia de um componente, se houver. */
export function getGuideEntry(slug: string): ComponentGuideEntry | undefined {
  return Object.hasOwn(COMPONENT_GUIDE, slug) ? COMPONENT_GUIDE[slug] : undefined;
}

/** A necessidade que o componente resolve, em português, para listas e busca. */
export function getComponentNeed(slug: string): string | undefined {
  return getGuideEntry(slug)?.need;
}

/** Slugs exigidos que não têm entrada no guia. */
export function missingGuideEntries(slugs: Iterable<string>): string[] {
  return [...new Set(slugs)].filter((slug) => !getGuideEntry(slug)).sort();
}

/** Entradas do guia sem componente nem página correspondente (componente removido ou renomeado). */
export function staleGuideEntries(known: Iterable<string>): string[] {
  const set = new Set(known);
  return Object.keys(COMPONENT_GUIDE)
    .filter((slug) => !set.has(slug))
    .sort();
}

/** Entradas que não são item do registry e não dizem como montar (`build`). */
export function uninstallableGuideEntries(registryItems: Iterable<string>): string[] {
  const set = new Set(registryItems);
  return Object.entries(COMPONENT_GUIDE)
    .filter(([slug, entry]) => !set.has(slug) && !entry.build)
    .map(([slug]) => slug)
    .sort();
}
