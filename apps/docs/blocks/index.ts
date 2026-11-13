// Blocos: telas inteiras montadas com os componentes do kit, exibidas em /blocks e em
// /view/[name]. Seguem o formato do ui.shadcn.com/blocks, com o conteúdo em moldes.
import type * as React from "react";

export type Block = {
  name: string;
  description: string;
  /** Categorias em que o bloco aparece. "featured" é a página /blocks. */
  categories: string[];
};

/** Categorias da navegação, na ordem do shadcn. "featured" é a raiz, /blocks. */
export const BLOCK_CATEGORIES = [
  { slug: "featured", title: "Featured" },
  { slug: "sidebar", title: "Sidebar" },
  { slug: "login", title: "Login" },
  { slug: "signup", title: "Signup" },
  { slug: "editor", title: "Editor" },
  { slug: "chat", title: "Chat" },
  { slug: "checkout", title: "Checkout" },
];

export const BLOCKS: Block[] = [
  {
    name: "sidebar-01",
    description: "Sidebar que recolhe para ícones, com a página em cartão",
    categories: ["featured", "sidebar"],
  },
  {
    name: "sidebar-02",
    description: "Sidebar que recolhe para ícones, com a página encostada",
    categories: ["featured", "sidebar"],
  },
  {
    name: "sidebar-03",
    description:
      "Aside inset com seletor, grupos de rotas com contagens, grupo recolhível e painel à direita",
    categories: ["featured", "sidebar"],
  },
  {
    name: "login-01",
    description: "Login com imagem recortada por onda no desktop e no topo no celular",
    categories: ["login"],
  },
  {
    name: "signup-01",
    description: "Criar conta, espelho do login: imagem à direita no desktop e onda invertida",
    categories: ["signup"],
  },
  {
    name: "editor-01",
    description: "Editor com sidebar de projetos, caixa de comandos e canvas de pontos",
    categories: ["featured", "editor"],
  },
  {
    name: "chat-01",
    description:
      "Chat com o assistente: mensagens, indicador de digitação, sugestões e campo de envio",
    categories: ["chat"],
  },
  {
    name: "checkout-01",
    description:
      "Pagamento com cartão: canhoto da cobrança, itens recolhidos, campos do cartão e comprovante",
    categories: ["featured", "checkout"],
  },
  {
    name: "credit-card-01",
    description:
      "Cadastro de cartão: número com a bandeira reconhecida, validade, CVV e nome, com validação",
    categories: ["checkout"],
  },
];

export const BlockLoaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  "sidebar-01": () => import("./sidebar-01"),
  "sidebar-02": () => import("./sidebar-02"),
  "sidebar-03": () => import("./sidebar-03"),
  "login-01": () => import("./login-01"),
  "signup-01": () => import("./signup-01"),
  "editor-01": () => import("./editor-01"),
  "chat-01": () => import("./chat-01"),
  "checkout-01": () => import("./checkout-01"),
  "credit-card-01": () => import("./credit-card-01"),
};
