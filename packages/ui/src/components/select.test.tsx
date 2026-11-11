import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, FieldError, FieldLabel } from "./field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

const PARCELAS = [
  { label: "1x de R$ 120,00", value: "1" },
  { label: "2x de R$ 60,00", value: "2" },
  { label: "3x de R$ 40,00", value: "3" },
];

function Parcelas({
  invalid,
  disabled,
  size,
  onValueChange,
}: {
  invalid?: boolean;
  disabled?: boolean;
  size?: "sm" | "default";
  onValueChange?: (value: string | null) => void;
}) {
  return (
    <Field invalid={invalid}>
      <FieldLabel>Parcelas</FieldLabel>
      <Select items={PARCELAS} defaultValue="1" disabled={disabled} onValueChange={onValueChange}>
        <SelectTrigger size={size} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sem juros</SelectLabel>
            {PARCELAS.map((parcela) => (
              <SelectItem key={parcela.value} value={parcela.value}>
                {parcela.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {invalid && <FieldError>Escolha o número de parcelas.</FieldError>}
    </Field>
  );
}

const trigger = () => screen.getByRole("combobox", { name: "Parcelas" });

describe("Select", () => {
  it("renderiza o gatilho com data-slot, tamanho e className extra, mostrando o rótulo do valor", () => {
    const { rerender } = render(<Parcelas />);

    expect(trigger()).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger()).toHaveAttribute("data-size", "default");
    expect(trigger()).toHaveClass("w-full");
    expect(trigger()).toHaveTextContent("1x de R$ 120,00");

    rerender(<Parcelas size="sm" />);
    expect(trigger()).toHaveAttribute("data-size", "sm");
  });

  it("abre com o mouse e escolhe uma opção", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Parcelas onValueChange={onValueChange} />);

    await user.click(trigger());
    const listbox = await screen.findByRole("listbox");
    expect(listbox.closest('[data-slot="select-content"]')).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Sem juros" })).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "3x de R$ 40,00" }));
    expect(onValueChange).toHaveBeenLastCalledWith("3", expect.anything());
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent("3x de R$ 40,00");
  });

  it("pelo teclado: Tab foca, Enter abre, setas navegam, Enter escolhe e o foco volta ao gatilho", async () => {
    const user = userEvent.setup();
    render(<Parcelas />);

    await user.tab();
    expect(trigger()).toHaveFocus();

    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "1x de R$ 120,00" })).toHaveFocus(),
    );

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "2x de R$ 60,00" })).toHaveFocus();

    await user.keyboard("{Enter}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent("2x de R$ 60,00");
    expect(trigger()).toHaveFocus();
  });

  it("Esc fecha sem mudar o valor", async () => {
    const user = userEvent.setup();
    render(<Parcelas />);

    await user.click(trigger());
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent("1x de R$ 120,00");
  });

  it("desabilitado, não abre", async () => {
    const user = userEvent.setup();
    render(<Parcelas disabled />);

    expect(trigger()).toHaveAttribute("data-disabled");
    await user.click(trigger());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("com erro no campo, o gatilho expõe aria-invalid e anuncia o erro", () => {
    render(<Parcelas invalid />);

    expect(trigger()).toHaveAttribute("aria-invalid", "true");
    expect(trigger()).toHaveAccessibleDescription("Escolha o número de parcelas.");
    expect(trigger()).toHaveClass("aria-invalid:border-destructive/60");
  });

  it("não tem violações de acessibilidade, fechado e aberto", async () => {
    const user = userEvent.setup();
    const { container } = render(<Parcelas invalid />);
    await expect(container).toHaveNoAxeViolations();

    await user.click(trigger());
    await screen.findByRole("listbox");
    await expect(document.body).toHaveNoAxeViolations();
  });
});
