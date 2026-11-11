import { WarningCircleIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

function ErroDePagamento({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className="max-w-md">
      <WarningCircleIcon />
      <AlertTitle>Pagamento recusado</AlertTitle>
      <AlertDescription>Confira os dados do cartão e tente de novo.</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Tentar de novo
        </Button>
      </AlertAction>
    </Alert>
  );
}

describe("Alert", () => {
  it("renderiza com role alert, as partes e className extra", () => {
    const { container } = render(<ErroDePagamento />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("data-slot", "alert");
    expect(alert).toHaveClass("max-w-md");
    for (const slot of ["alert-title", "alert-description", "alert-action"]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument();
    }
  });

  it("variante padrão e destrutiva", () => {
    const { rerender } = render(
      <Alert>
        <AlertTitle>Alterações salvas</AlertTitle>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toHaveClass("bg-card", "text-card-foreground");

    rerender(<ErroDePagamento />);
    expect(screen.getByRole("alert")).toHaveClass("text-destructive");
  });

  it("o erro não depende só da cor: tem ícone e texto", () => {
    render(<ErroDePagamento />);

    const alert = screen.getByRole("alert");
    expect(alert.querySelector("svg")).toBeInTheDocument();
    expect(alert).toHaveTextContent("Pagamento recusado");
  });

  it("a ação recebe foco por Tab e responde a Enter", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErroDePagamento onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<ErroDePagamento />);
    await expect(container).toHaveNoAxeViolations();
  });
});
