import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "./radio-group";

function FormaDePagamento(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Forma de pagamento" defaultValue="pix" {...props}>
      <label className="flex gap-2">
        <RadioGroupItem value="pix" /> PIX
      </label>
      <label className="flex gap-2">
        <RadioGroupItem value="credito" /> Cartão de crédito
      </label>
      <label className="flex gap-2">
        <RadioGroupItem value="salvo" disabled /> Cartão salvo
      </label>
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("renderiza o grupo e os itens com data-slot e className extra", () => {
    render(<FormaDePagamento className="gap-4" />);

    const group = screen.getByRole("radiogroup", { name: "Forma de pagamento" });
    expect(group).toHaveAttribute("data-slot", "radio-group");
    expect(group).toHaveClass("grid", "gap-4");
    expect(screen.getByRole("radio", { name: "PIX" })).toHaveAttribute(
      "data-slot",
      "radio-group-item",
    );
  });

  it("escolhe uma opção com o mouse", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FormaDePagamento onValueChange={onValueChange} />);

    await user.click(screen.getByRole("radio", { name: "Cartão de crédito" }));
    expect(screen.getByRole("radio", { name: "Cartão de crédito" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "PIX" })).not.toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("credito", expect.anything());
  });

  it("Tab entra na opção marcada e as setas trocam a escolha, pulando a desabilitada", async () => {
    const user = userEvent.setup();
    render(<FormaDePagamento />);

    await user.tab();
    expect(screen.getByRole("radio", { name: "PIX" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    const credito = screen.getByRole("radio", { name: "Cartão de crédito" });
    expect(credito).toHaveFocus();
    expect(credito).toBeChecked();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "PIX" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Cartão salvo" })).not.toBeChecked();

    await user.keyboard("{ArrowUp}");
    expect(credito).toHaveFocus();
  });

  it("item desabilitado não é escolhido", async () => {
    const user = userEvent.setup();
    render(<FormaDePagamento />);

    const salvo = screen.getByRole("radio", { name: "Cartão salvo" });
    await user.click(salvo);
    expect(salvo).not.toBeChecked();
    expect(salvo).toHaveAttribute("aria-disabled", "true");
  });

  it("grupo desabilitado não muda a escolha", async () => {
    const user = userEvent.setup();
    render(<FormaDePagamento disabled />);

    await user.click(screen.getByRole("radio", { name: "Cartão de crédito" }));
    expect(screen.getByRole("radio", { name: "PIX" })).toBeChecked();
  });

  it("com erro, os itens expõem aria-invalid", () => {
    render(
      <RadioGroup aria-label="Parcelas">
        <label>
          <RadioGroupItem value="1" aria-invalid /> 1x
        </label>
      </RadioGroup>,
    );

    const item = screen.getByRole("radio", { name: "1x" });
    expect(item).toHaveAttribute("aria-invalid", "true");
    expect(item).toHaveClass("aria-invalid:border-destructive");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(<FormaDePagamento />);
    await expect(container).toHaveNoAxeViolations();
  });
});
