import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { DateField } from "./date-field";

function ControlledDateField(props: Partial<React.ComponentProps<typeof DateField>>) {
  const [value, setValue] = React.useState(props.value ?? "");
  return (
    <DateField
      label="Data de nascimento"
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange?.(next);
      }}
    />
  );
}

describe("DateField", () => {
  it("no modo input, aplica a máscara dd/mm/aaaa enquanto digita", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledDateField mode="input" onChange={onChange} />);

    await user.type(screen.getByRole("textbox", { name: "Data de nascimento" }), "01021990");
    expect(screen.getByRole("textbox", { name: "Data de nascimento" })).toHaveValue("01/02/1990");
    expect(onChange).toHaveBeenLastCalledWith("01/02/1990");
  });

  it("no modo drawer, a roda só altera o valor depois do Ok", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateField
        mode="drawer"
        value="15/03/2024"
        maxDate="2025-12-31"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Data de nascimento" });
    expect(input).toHaveAttribute("readonly");
    await user.click(input);

    const dialog = await screen.findByRole("dialog");
    const days = within(dialog).getByRole("listbox", { name: "Dia" });
    days.focus();
    await user.keyboard("{ArrowDown}");
    expect(onChange).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Ok" }));
    expect(onChange).toHaveBeenCalledWith("16/03/2024");
    expect(input).toHaveValue("16/03/2024");
  });

  it("no modo drawer, o Ok grava a data limitada que a roda mostra", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledDateField
        mode="drawer"
        value="15/03/2027"
        maxDate="2025-12-31"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("textbox", { name: "Data de nascimento" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("listbox", { name: "Ano" })).toHaveTextContent("2025");
    await user.click(within(dialog).getByRole("button", { name: "Ok" }));

    expect(onChange).toHaveBeenCalledWith("31/12/2025");
  });

  it("no modo drawer, required bloqueia o envio sem data", () => {
    const { container, rerender } = render(
      <form>
        <DateField mode="drawer" name="nascimento" required value="" onChange={() => {}} />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);

    rerender(
      <form>
        <DateField
          mode="drawer"
          name="nascimento"
          required
          value="01/02/1990"
          onChange={() => {}}
        />
      </form>,
    );
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get("nascimento")).toBe("01/02/1990");
  });

  it("com id, deixa o nome acessível para o <label>", () => {
    render(
      <>
        <label htmlFor="nascimento">Nascimento</label>
        <ControlledDateField id="nascimento" mode="input" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Nascimento" })).toBeInTheDocument();
  });

  it("size xl passa para o grupo do campo, nos dois modos", () => {
    const { rerender } = render(<ControlledDateField mode="input" size="xl" />);
    const group = () =>
      screen.getByRole("textbox", { name: "Data de nascimento" }).closest("[data-slot=date-field]");

    expect(group()).toHaveAttribute("data-size", "xl");

    rerender(<ControlledDateField mode="drawer" size="xl" />);
    expect(group()).toHaveAttribute("data-size", "xl");
  });

  it("no modo drawer, o Ok acompanha o tamanho do campo", async () => {
    const user = userEvent.setup();
    render(<ControlledDateField mode="drawer" size="xl" />);

    await user.click(screen.getByRole("textbox", { name: "Data de nascimento" }));
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByRole("button", { name: "Ok" })).toHaveClass("h-14");
  });
});
