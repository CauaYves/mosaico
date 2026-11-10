import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

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
