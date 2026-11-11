import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renderiza com data-slot, fora da árvore de acessibilidade e com className extra", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);

    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveClass("rounded-item", "bg-muted", "h-4", "w-32");
  });

  it("pulsa, e para quando a pessoa pede menos movimento", () => {
    const { container } = render(<Skeleton />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveClass(
      "animate-pulse",
      "motion-reduce:animate-none",
    );
  });

  it("não tem violações de acessibilidade num bloco que carrega", async () => {
    const { container } = render(
      <section aria-busy="true" aria-label="Resumo da recarga">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </section>,
    );
    await expect(container).toHaveNoAxeViolations();
  });
});
