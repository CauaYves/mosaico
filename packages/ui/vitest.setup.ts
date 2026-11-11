import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import axe from "axe-core";

// Acessibilidade: `await expect(container).toHaveNoAxeViolations()` roda o axe sobre o que foi
// renderizado e falha listando cada violação. Exceções, todas fora do controle do componente:
// - color-contrast: o jsdom não calcula cor nem layout; o contraste é conferido à mão (tabela na
//   Fase 3 do docs/plano.md).
// - region: pede marcos de página (main, nav...), que um componente isolado não tem.
// - [data-base-ui-focus-guard]: sentinelas do Base UI que prendem o foco nos overlays. Têm
//   aria-hidden e tabindex de propósito: quando recebem foco, devolvem-no ao popup.
// - [data-base-ui-inert]: o resto da página enquanto um modal está aberto. O Base UI o esconde
//   com aria-hidden; o foco não chega lá por causa da armadilha (testada em dialog e alert-dialog).
const AXE_OPTIONS: axe.RunOptions = {
  rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
};
const AXE_EXCLUDE = [["[data-base-ui-focus-guard]"], ["[data-base-ui-inert]"]];

expect.extend({
  async toHaveNoAxeViolations(received: Element) {
    const { violations } = await axe.run(
      { include: [received], exclude: AXE_EXCLUDE },
      AXE_OPTIONS,
    );
    const report = violations
      .map(
        (violation) =>
          `- ${violation.id} (${violation.impact}): ${violation.help}\n${violation.nodes
            .map((node) => `    ${node.html}`)
            .join("\n")}`,
      )
      .join("\n");
    return {
      pass: violations.length === 0,
      message: () =>
        violations.length
          ? `O axe encontrou ${violations.length} violação(ões):\n${report}`
          : "O axe não encontrou violações.",
    };
  },
});

declare module "vitest" {
  // Os parâmetros de tipo precisam ser iguais aos da declaração do vitest.
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toHaveNoAxeViolations(): Promise<void>;
  }
}

// A máscara do @react-input mantém um loop de setTimeout enquanto o input está focado e só o
// encerra no blur. Sem tirar o foco antes de desmontar, o loop sobrevive ao fim do arquivo e
// estoura "window is not defined" quando o jsdom já foi desmontado (falha intermitente no CI).
afterEach(() => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  cleanup();
});

// APIs de navegador que o jsdom não implementa.

// input-otp: detecção de gerenciadores de senha.
document.elementFromPoint ??= () => null;

// date-wheel-picker: posicionamento das colunas.
Element.prototype.scrollTo ??= () => {};
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// use-mobile e prefers-reduced-motion. Sem layout, toda media query é falsa.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
