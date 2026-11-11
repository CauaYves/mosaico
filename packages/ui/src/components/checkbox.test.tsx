import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renderiza com data-slot e className extra", () => {
    render(<Checkbox aria-label="Salvar cartão" className="mt-1" />);

    const checkbox = screen.getByRole("checkbox", { name: "Salvar cartão" });
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    expect(checkbox).toHaveClass("mt-1");
    expect(checkbox).not.toBeChecked();
  });

  it("marca e desmarca com o mouse", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Salvar cartão" onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "Salvar cartão" });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute("data-checked");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("recebe foco por Tab e marca com Espaço", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Aceito os termos" />);

    await user.tab();
    const checkbox = screen.getByRole("checkbox", { name: "Aceito os termos" });
    expect(checkbox).toHaveFocus();

    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
  });

  it("desabilitado, não muda nem recebe foco", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Salvar cartão" disabled />);

    const checkbox = screen.getByRole("checkbox", { name: "Salvar cartão" });
    await user.tab();
    expect(checkbox).not.toHaveFocus();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute("aria-disabled", "true");
  });

  it("com erro, expõe aria-invalid e o anel de erro", () => {
    render(<Checkbox aria-label="Aceito os termos" aria-invalid />);

    const checkbox = screen.getByRole("checkbox", { name: "Aceito os termos" });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveClass("aria-invalid:border-destructive");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <>
        <Checkbox aria-label="Salvar cartão" defaultChecked />
        <Checkbox aria-label="Aceito os termos" aria-invalid />
        <Checkbox aria-label="Receber ofertas" disabled />
      </>,
    );
    await expect(container).toHaveNoAxeViolations();
  });
});
