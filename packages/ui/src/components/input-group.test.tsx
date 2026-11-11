import { CopyIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";

function Valor({ erro, disabled }: { erro?: string; disabled?: boolean }) {
  return (
    <Field invalid={Boolean(erro)}>
      <FieldLabel>Valor da recarga</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>R$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput inputMode="decimal" placeholder="0,00" disabled={disabled} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Copiar valor" size="icon-xs">
            <CopyIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription>Mínimo de R$ 10,00.</FieldDescription>
      <FieldError>{erro}</FieldError>
    </Field>
  );
}

const valor = () => screen.getByRole("textbox", { name: "Valor da recarga" });

describe("InputGroup", () => {
  it("renderiza as partes com data-slot, alinhamento e className extra", () => {
    const { container } = render(
      <InputGroup className="max-w-xs">
        <InputGroupAddon align="block-start">Título</InputGroupAddon>
        <InputGroupInput aria-label="Campo" />
      </InputGroup>,
    );

    const group = container.querySelector('[data-slot="input-group"]');
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveClass("rounded-field", "max-w-xs");
    expect(container.querySelector('[data-slot="input-group-addon"]')).toHaveAttribute(
      "data-align",
      "block-start",
    );
    expect(screen.getByRole("textbox", { name: "Campo" })).toHaveAttribute(
      "data-slot",
      "input-group-control",
    );
  });

  it("o campo dentro do grupo recebe o nome e a descrição do Field", () => {
    render(<Valor />);

    expect(valor()).toHaveAccessibleDescription("Mínimo de R$ 10,00.");
  });

  it("clicar no prefixo foca o campo, e o botão do sufixo não rouba o clique", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>R$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Valor" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onCopy}>Copiar</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );

    await user.click(screen.getByText("R$"));
    expect(screen.getByRole("textbox", { name: "Valor" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Copiar" }));
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("pelo teclado: Tab vai do campo ao botão, e Enter e Espaço acionam o botão", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Código PIX" defaultValue="000201" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onCopy}>Copiar</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );

    await user.tab();
    expect(screen.getByRole("textbox", { name: "Código PIX" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Copiar" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onCopy).toHaveBeenCalledTimes(2);
  });

  it("o botão tem type=button por padrão e aceita tamanho e variante", () => {
    render(
      <InputGroupButton size="icon-sm" variant="secondary" aria-label="Limpar">
        x
      </InputGroupButton>,
    );

    const button = screen.getByRole("button", { name: "Limpar" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-size", "icon-sm");
    expect(button).toHaveClass("size-8", "bg-secondary");
  });

  it("aceita textarea no lugar do input", () => {
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Observação" />
      </InputGroup>,
    );

    expect(screen.getByRole("textbox", { name: "Observação" })).toHaveAttribute(
      "data-slot",
      "input-group-control",
    );
  });

  it("desabilitado, o campo não recebe digitação", async () => {
    const user = userEvent.setup();
    render(<Valor disabled />);

    await user.type(valor(), "50");
    expect(valor()).toHaveValue("");
    expect(valor()).toBeDisabled();
  });

  it("com erro, o campo expõe aria-invalid e o grupo pinta a borda de erro", () => {
    render(<Valor erro="O valor mínimo é R$ 10,00." />);

    expect(valor()).toHaveAttribute("aria-invalid", "true");
    expect(valor()).toHaveAccessibleDescription("Mínimo de R$ 10,00. O valor mínimo é R$ 10,00.");
    expect(document.querySelector('[data-slot="input-group"]')).toHaveClass(
      "has-[[data-slot][aria-invalid=true]]:border-destructive/60",
    );
  });

  it("não tem violações de acessibilidade, com e sem erro", async () => {
    const { container, rerender } = render(<Valor />);
    await expect(container).toHaveNoAxeViolations();

    rerender(<Valor erro="O valor mínimo é R$ 10,00." />);
    await expect(container).toHaveNoAxeViolations();
  });
});
