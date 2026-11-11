import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";

function Estado({ erro, disabled }: { erro?: string; disabled?: boolean }) {
  return (
    <Field invalid={Boolean(erro)}>
      <FieldLabel>Estado</FieldLabel>
      <NativeSelect defaultValue="" disabled={disabled}>
        <NativeSelectOption value="" disabled>
          Selecione
        </NativeSelectOption>
        <NativeSelectOptGroup label="Sudeste">
          <NativeSelectOption value="SP">São Paulo</NativeSelectOption>
          <NativeSelectOption value="RJ">Rio de Janeiro</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
      <FieldDescription>Do endereço de cobrança.</FieldDescription>
      <FieldError>{erro}</FieldError>
    </Field>
  );
}

const estado = () => screen.getByRole("combobox", { name: "Estado" });

describe("NativeSelect", () => {
  it("renderiza com data-slot, tamanho e className extra no invólucro", () => {
    const { container } = render(
      <NativeSelect aria-label="Estado" size="sm" className="w-40">
        <NativeSelectOption value="SP">São Paulo</NativeSelectOption>
      </NativeSelect>,
    );

    const wrapper = container.querySelector('[data-slot="native-select-wrapper"]');
    expect(wrapper).toHaveClass("w-40");
    expect(wrapper).toHaveAttribute("data-size", "sm");
    const select = screen.getByRole("combobox", { name: "Estado" });
    expect(select).toHaveAttribute("data-slot", "native-select");
    expect(select).toHaveAttribute("data-size", "sm");
  });

  it("dentro de um Field, recebe o nome, a descrição e o erro", () => {
    render(<Estado erro="Escolha o estado." />);

    expect(estado()).toHaveAttribute("aria-invalid", "true");
    expect(estado()).toHaveAccessibleDescription("Do endereço de cobrança. Escolha o estado.");
  });

  it("recebe foco por Tab e troca de opção pelo teclado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NativeSelect
        aria-label="Estado"
        defaultValue="SP"
        onChange={(e) => onChange(e.target.value)}
      >
        <NativeSelectOption value="SP">São Paulo</NativeSelectOption>
        <NativeSelectOption value="RJ">Rio de Janeiro</NativeSelectOption>
      </NativeSelect>,
    );

    await user.tab();
    expect(estado()).toHaveFocus();
    await user.selectOptions(estado(), "RJ");
    expect(estado()).toHaveValue("RJ");
    expect(onChange).toHaveBeenLastCalledWith("RJ");
  });

  it("desabilitado, fica fora da ordem de Tab", async () => {
    const user = userEvent.setup();
    render(<Estado disabled />);

    expect(estado()).toBeDisabled();
    await user.tab();
    expect(estado()).not.toHaveFocus();
  });

  it("não tem violações de acessibilidade, com e sem erro", async () => {
    const { container, rerender } = render(<Estado />);
    await expect(container).toHaveNoAxeViolations();

    rerender(<Estado erro="Escolha o estado." />);
    await expect(container).toHaveNoAxeViolations();
  });
});
