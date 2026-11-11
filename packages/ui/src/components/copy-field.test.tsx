import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyField } from "./copy-field";
import { Field, FieldDescription, FieldLabel } from "./field";

const PIX =
  "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR";

const botao = () => screen.getByRole("button", { name: "Copiar código PIX" });
const campo = () => screen.getByRole("textbox", { name: "código PIX" });

describe("CopyField", () => {
  it("renderiza com data-slot, valor somente leitura e className extra", () => {
    const { container } = render(<CopyField value={PIX} label="código PIX" className="max-w-sm" />);

    const root = container.querySelector('[data-slot="copy-field"]');
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveClass("rounded-field", "max-w-sm");
    expect(campo()).toHaveValue(PIX);
    expect(campo()).toHaveAttribute("readonly");
    expect(botao()).toHaveAttribute("data-slot", "copy-field-button");
  });

  it("sem label, o botão se chama só Copiar", () => {
    render(<CopyField value="CUPOM10" aria-label="Cupom" />);

    expect(screen.getByRole("button", { name: "Copiar" })).toBeInTheDocument();
  });

  it("copia com o mouse, avisa o leitor de tela e troca o ícone", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const { container } = render(<CopyField value={PIX} label="código PIX" onCopy={onCopy} />);

    const iconeAntes = botao().innerHTML;
    await user.click(botao());

    expect(await navigator.clipboard.readText()).toBe(PIX);
    expect(onCopy).toHaveBeenCalledWith(PIX);
    expect(screen.getByText("Copiado")).toHaveAttribute("aria-live", "polite");
    expect(container.querySelector('[data-slot="copy-field"]')).toHaveAttribute("data-copied");
    expect(botao().innerHTML).not.toBe(iconeAntes);
  });

  it("volta ao estado inicial depois de 2 s", async () => {
    const user = userEvent.setup();
    const { container } = render(<CopyField value={PIX} label="código PIX" />);

    await user.click(botao());
    expect(screen.getByText("Copiado")).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText("Copiado")).not.toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(container.querySelector('[data-slot="copy-field"]')).not.toHaveAttribute("data-copied");
  });

  it("pelo teclado: Tab foca o campo e seleciona o código, Tab vai ao botão, Enter e Espaço copiam", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CopyField value={PIX} label="código PIX" onCopy={onCopy} />);

    await user.tab();
    expect(campo()).toHaveFocus();
    const input = campo() as HTMLInputElement;
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, PIX.length]);

    await user.tab();
    expect(botao()).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onCopy).toHaveBeenCalledTimes(2);
  });

  it("sem acesso à área de transferência, seleciona o texto e explica como copiar", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("negado"));
    render(<CopyField value={PIX} label="código PIX" onCopy={onCopy} />);

    await user.click(botao());

    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByText(/Não foi possível copiar/)).toBeInTheDocument();
    const input = campo() as HTMLInputElement;
    expect(input).toHaveFocus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, PIX.length]);
  });

  it("desabilitado, não copia nem recebe foco no botão", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    const { container } = render(
      <CopyField value={PIX} label="código PIX" onCopy={onCopy} disabled />,
    );

    expect(botao()).toBeDisabled();
    expect(campo()).toBeDisabled();
    expect(container.querySelector('[data-slot="copy-field"]')).toHaveAttribute("data-disabled");
    await user.click(botao());
    expect(onCopy).not.toHaveBeenCalled();
  });

  it("dentro de um Field, o campo recebe o nome e a descrição", () => {
    render(
      <Field>
        <FieldLabel>Código PIX</FieldLabel>
        <CopyField value={PIX} />
        <FieldDescription>Cole no app do seu banco, em PIX copia e cola.</FieldDescription>
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Código PIX" });
    expect(input).toHaveAccessibleDescription("Cole no app do seu banco, em PIX copia e cola.");
  });

  it("não tem violações de acessibilidade, antes e depois de copiar", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field>
        <FieldLabel>Código PIX</FieldLabel>
        <CopyField value={PIX} label="código PIX" />
      </Field>,
    );
    await expect(container).toHaveNoAxeViolations();

    await user.click(botao());
    await expect(container).toHaveNoAxeViolations();
  });
});
