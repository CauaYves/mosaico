import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

function Resumo({ size }: { size?: "default" | "sm" }) {
  return (
    <Card size={size} className="max-w-sm">
      <CardHeader>
        <CardTitle>Resumo da recarga</CardTitle>
        <CardDescription>Conta 0001 · Sócio titular</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>Total: R$ 120,00</CardContent>
      <CardFooter>
        <Button>Pagar</Button>
      </CardFooter>
    </Card>
  );
}

describe("Card", () => {
  it("renderiza as partes com os data-slot certos", () => {
    const { container } = render(<Resumo />);

    for (const slot of [
      "card",
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "card-content",
      "card-footer",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument();
    }
  });

  it("separa a superfície por fundo e sombra, com tamanho padrão e sm", () => {
    const { container, rerender } = render(<Resumo />);
    const card = () => container.querySelector('[data-slot="card"]');

    expect(card()).toHaveAttribute("data-size", "default");
    expect(card()).toHaveClass("rounded-surface", "bg-card", "shadow-md", "max-w-sm");
    expect(card()).not.toHaveClass("border");

    rerender(<Resumo size="sm" />);
    expect(card()).toHaveAttribute("data-size", "sm");
  });

  it("as ações de dentro seguem a ordem de Tab", async () => {
    const user = userEvent.setup();
    render(<Resumo />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Editar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Pagar" })).toHaveFocus();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<Resumo />);
    await expect(container).toHaveNoAxeViolations();
  });
});
