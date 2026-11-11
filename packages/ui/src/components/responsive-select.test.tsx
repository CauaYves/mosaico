import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { ResponsiveSelect, type ResponsiveSelectProps } from "./responsive-select";

const PARCELAS = [
  { label: "1x de R$ 120,00", value: "1" },
  { label: "2x de R$ 60,00", value: "2" },
  { label: "3x de R$ 40,00", value: "3", disabled: true },
];

function Parcelas(props: Partial<ResponsiveSelectProps> & { erro?: string }) {
  const { erro, ...rest } = props;
  const [valor, setValor] = useState<string | null>(null);
  return (
    <Field invalid={Boolean(erro)}>
      <FieldLabel>Parcelas</FieldLabel>
      <ResponsiveSelect
        items={PARCELAS}
        value={valor}
        onValueChange={setValor}
        placeholder="Escolha as parcelas"
        {...rest}
      />
      <FieldDescription>Sem juros no cartão.</FieldDescription>
      <FieldError>{erro}</FieldError>
      <output data-testid="valor">{valor ?? ""}</output>
    </Field>
  );
}

const controle = () => screen.getByRole("combobox", { name: "Parcelas" });
const valorAtual = () => screen.getByTestId("valor").textContent;

function larguraDaTela(largura: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: largura,
  });
}

describe("ResponsiveSelect", () => {
  afterEach(() => larguraDaTela(1024));

  it("no desktop (auto), usa o Select do kit", () => {
    larguraDaTela(1280);
    render(<Parcelas className="max-w-xs" />);

    expect(controle()).toHaveAttribute("data-slot", "select-trigger");
    expect(controle()).toHaveAttribute("data-responsive-select", "select");
    expect(controle()).toHaveClass("w-full", "max-w-xs");
    expect(controle()).toHaveTextContent("Escolha as parcelas");
  });

  it("no celular (auto), usa o select nativo do sistema", async () => {
    larguraDaTela(375);
    render(<Parcelas className="max-w-xs" />);

    await waitFor(() => expect(controle().tagName).toBe("SELECT"));
    expect(controle()).toHaveAttribute("data-slot", "native-select");
    expect(controle()).toHaveAttribute("data-responsive-select", "native");
    expect(controle()).toHaveValue("");
    expect(screen.getByRole("option", { name: "Escolha as parcelas" })).toBeDisabled();
  });

  it("mode fixa a forma, sem olhar a largura", () => {
    larguraDaTela(375);
    const { rerender } = render(<Parcelas mode="select" />);
    expect(controle()).toHaveAttribute("data-responsive-select", "select");

    larguraDaTela(1280);
    rerender(<Parcelas mode="native" />);
    expect(controle().tagName).toBe("SELECT");
  });

  it.each(["native", "select"] as const)(
    "modo %s: recebe o nome, a descrição e o erro do Field",
    (mode) => {
      render(<Parcelas mode={mode} erro="Escolha o número de parcelas." />);

      expect(controle()).toHaveAttribute("aria-invalid", "true");
      expect(controle()).toHaveAccessibleDescription(
        "Sem juros no cartão. Escolha o número de parcelas.",
      );
    },
  );

  it("modo native: escolhe pelo teclado e avisa o valor", async () => {
    const user = userEvent.setup();
    render(<Parcelas mode="native" />);

    await user.tab();
    expect(controle()).toHaveFocus();
    await user.selectOptions(controle(), "2");
    expect(valorAtual()).toBe("2");
    expect(controle()).toHaveValue("2");
  });

  it("modo select: Enter abre, setas navegam, a opção desabilitada não é escolhida, Enter escolhe", async () => {
    const user = userEvent.setup();
    render(<Parcelas mode="select" />);

    await user.tab();
    expect(controle()).toHaveFocus();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "1x de R$ 120,00" })).toHaveFocus(),
    );
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "2x de R$ 60,00" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    const desabilitada = screen.getByRole("option", { name: "3x de R$ 40,00" });
    expect(desabilitada).toHaveFocus();
    expect(desabilitada).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(valorAtual()).toBe("");

    await user.keyboard("{ArrowUp}{Enter}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(valorAtual()).toBe("2");
    expect(controle()).toHaveTextContent("2x de R$ 60,00");
  });

  it("não controlado, começa no defaultValue nas duas formas", () => {
    const { rerender } = render(
      <ResponsiveSelect items={PARCELAS} defaultValue="2" aria-label="Parcelas" mode="select" />,
    );
    expect(controle()).toHaveTextContent("2x de R$ 60,00");

    rerender(
      <ResponsiveSelect items={PARCELAS} defaultValue="2" aria-label="Parcelas" mode="native" />,
    );
    expect(controle()).toHaveValue("2");
  });

  it.each(["native", "select"] as const)("modo %s: desabilitado, não muda", async (mode) => {
    const user = userEvent.setup();
    render(<Parcelas mode={mode} disabled />);

    await user.click(controle());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(valorAtual()).toBe("");
    if (mode === "native") expect(controle()).toBeDisabled();
    else expect(controle()).toHaveAttribute("data-disabled");
  });

  it.each(["native", "select"] as const)(
    "modo %s: não tem violações de acessibilidade, com e sem erro",
    async (mode) => {
      const { container, rerender } = render(<Parcelas mode={mode} />);
      await expect(container).toHaveNoAxeViolations();

      rerender(<Parcelas mode={mode} erro="Escolha o número de parcelas." />);
      await expect(container).toHaveNoAxeViolations();
    },
  );
});
