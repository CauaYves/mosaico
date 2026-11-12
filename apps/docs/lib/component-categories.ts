// Categorias da galeria de componentes (/docs/components). Um componente fora da lista cai em
// "Outros", então um componente novo aparece na galeria mesmo antes de ser classificado.

export const COMPONENT_CATEGORIES = [
  {
    name: "Formulário",
    components: [
      "attachment",
      "button",
      "button-group",
      "checkbox",
      "combobox",
      "copy-field",
      "date-field",
      "date-picker",
      "date-wheel-picker",
      "field",
      "input",
      "input-group",
      "input-otp",
      "label",
      "native-select",
      "questionnaire",
      "radio-group",
      "responsive-select",
      "select",
      "slider",
      "switch",
      "textarea",
      "theme-toggle",
      "toggle",
      "toggle-group",
    ],
  },
  {
    name: "Navegação",
    components: [
      "bottom-nav",
      "breadcrumb",
      "command",
      "context-menu",
      "dropdown-menu",
      "dropdown-navigation",
      "menubar",
      "navigation-menu",
      "pagination",
      "sidebar",
      "tabs",
    ],
  },
  {
    name: "Feedback",
    components: ["alert", "badge", "empty", "marker", "progress", "skeleton", "spinner", "toast"],
  },
  {
    name: "Dados",
    components: [
      "avatar",
      "calendar",
      "chart",
      "chart-donut",
      "code-block",
      "data-table",
      "item",
      "kbd",
      "table",
      "ticket",
      "trace",
      "typography",
    ],
  },
  {
    name: "Overlay",
    components: ["alert-dialog", "dialog", "drawer", "hover-card", "popover", "sheet", "tooltip"],
  },
  {
    name: "Layout",
    components: [
      "accordion",
      "aspect-ratio",
      "card",
      "carousel",
      "collapsible",
      "direction",
      "marquee",
      "resizable",
      "scroll-area",
      "separator",
    ],
  },
  { name: "Mensagens", components: ["bubble", "message", "message-scroller"] },
  {
    name: "Marca",
    components: ["backdrop-text", "brand-card", "gradient-panel", "mosaic-loader", "seal"],
  },
] as const;

/** Componentes recentes: ganham o selo "Novo" e vêm primeiro na ordem "Novos". */
export const NEW_COMPONENTS = new Set([
  "backdrop-text",
  "bottom-nav",
  "brand-card",
  "copy-field",
  "dropdown-navigation",
  "gradient-panel",
  "responsive-select",
  "seal",
  "ticket",
]);

export function getComponentCategory(name: string): string {
  return (
    COMPONENT_CATEGORIES.find((category) =>
      (category.components as readonly string[]).includes(name),
    )?.name ?? "Outros"
  );
}
