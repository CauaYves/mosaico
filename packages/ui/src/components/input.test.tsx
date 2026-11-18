import { useMask } from "@react-input/mask";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

function NumeroDoCartao() {
  const ref = useMask({ mask: "____ ____ ____ ____", replacement: { _: /\d/ } });
  return <Input ref={ref} aria-label="Número do cartão" inputMode="numeric" />;
}

describe("Input", () => {
  it("renderiza com data-slot e className extra", () => {
    render(<Input aria-label="Nome no cartão" className="max-w-xs" />);

    const input = screen.getByRole("textbox", { name: "Nome no cartão" });
    expect(input).toHaveAttribute("data-slot", "input");
    expect(input).toHaveClass("rounded-field", "border-input", "max-w-xs");
  });

  it("recebe foco por Tab e aceita digitação", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Nome no cartão" />);

    await user.tab();
    const input = screen.getByRole("textbox", { name: "Nome no cartão" });
    expect(input).toHaveFocus();

    await user.keyboard("Maria Silva");
    expect(input).toHaveValue("Maria Silva");
  });

  it("funciona com máscara: número do cartão em grupos de 4", async () => {
    const user = userEvent.setup();
    render(<NumeroDoCartao />);

    const input = screen.getByRole("textbox", { name: "Número do cartão" });
    await user.type(input, "4111111111111111");
    expect(input).toHaveValue("4111 1111 1111 1111");
  });

  it("desabilitado, sai da ordem de Tab e não aceita digitação", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="CVV" disabled />);

    const input = screen.getByRole("textbox", { name: "CVV" });
    await user.tab();
    expect(input).not.toHaveFocus();
    await user.type(input, "123");
    expect(input).toHaveValue("");
    expect(input).toHaveClass("disabled:opacity-50");
  });

  it("com erro, expõe aria-invalid e a borda de erro", () => {
    render(<Input aria-label="Validade" aria-invalid />);

    const input = screen.getByRole("textbox", { name: "Validade" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("aria-invalid:border-destructive/60");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <>
        <Input aria-label="Nome no cartão" />
        <Input aria-label="CVV" aria-invalid />
        <Input aria-label="Validade" disabled />
      </>,
    );
    await expect(container).toHaveNoAxeViolations();
  });

  it("o tamanho padrão e o xl ficam em data-size, com a altura do Button xl", () => {
    render(
      <>
        <Input aria-label="Nome" />
        <Input aria-label="Número do título" size="xl" />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveAttribute("data-size", "default");
    const big = screen.getByRole("textbox", { name: "Número do título" });
    expect(big).toHaveAttribute("data-size", "xl");
    expect(big).toHaveClass("data-[size=xl]:h-14", "data-[size=xl]:text-xl");
    // O size do kit não vai para o atributo size do <input>, que mede a largura em caracteres.
    expect(big).not.toHaveAttribute("size");
  });
});
