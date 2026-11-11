import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("renderiza com role status, nome em português e className extra", () => {
    render(<Spinner className="size-6" />);

    const spinner = screen.getByRole("status", { name: "Carregando" });
    expect(spinner).toHaveAttribute("data-slot", "spinner");
    expect(spinner).toHaveClass("animate-spin", "size-6");
  });

  it("aceita outro nome", () => {
    render(<Spinner aria-label="Processando pagamento" />);

    expect(screen.getByRole("status", { name: "Processando pagamento" })).toBeInTheDocument();
  });

  it("dentro de um botão desabilitado enquanto envia", () => {
    render(
      <Button disabled>
        <Spinner /> Pagando
      </Button>,
    );

    expect(screen.getByRole("button", { name: /Pagando/ })).toBeDisabled();
    expect(screen.getByRole("status", { name: "Carregando" })).toBeInTheDocument();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Spinner />);
    await expect(container).toHaveNoAxeViolations();
  });
});
