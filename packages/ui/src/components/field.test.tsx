import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field";
import { Input } from "./input";
import { RadioGroup, RadioGroupItem } from "./radio-group";

function CampoCartao({ erro }: { erro?: string }) {
  return (
    <Field invalid={Boolean(erro)}>
      <FieldLabel>Número do cartão</FieldLabel>
      <Input inputMode="numeric" autoComplete="cc-number" />
      <FieldDescription>Os 16 dígitos na frente do cartão.</FieldDescription>
      <FieldError>{erro}</FieldError>
    </Field>
  );
}

describe("Field", () => {
  it("renderiza as partes com os data-slot certos", () => {
    const { container } = render(<CampoCartao erro="Número inválido." />);

    expect(container.querySelector('[data-slot="field"]')).toHaveAttribute("role", "group");
    expect(container.querySelector('[data-slot="field-label"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="field-description"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="field-error"]')).toBeInTheDocument();
  });

  it("anuncia o nome e a descrição do campo", () => {
    render(<CampoCartao />);

    const input = screen.getByRole("textbox", { name: "Número do cartão" });
    expect(input).toHaveAccessibleDescription("Os 16 dígitos na frente do cartão.");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("com erro, marca o controle como inválido e anuncia o erro junto da descrição", () => {
    render(<CampoCartao erro="Número inválido." />);

    const input = screen.getByRole("textbox", { name: "Número do cartão" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Os 16 dígitos na frente do cartão. Número inválido.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Número inválido.");
    expect(document.querySelector('[data-slot="field"]')).toHaveAttribute("data-invalid");
  });

  it("aceita data-invalid, como na documentação do shadcn", () => {
    render(
      <Field data-invalid>
        <FieldLabel>Validade</FieldLabel>
        <Input placeholder="MM/AA" />
        <FieldError>Cartão vencido.</FieldError>
      </Field>,
    );

    expect(screen.getByRole("textbox", { name: "Validade" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("sem conteúdo, o FieldError não renderiza e sai da descrição", () => {
    render(<CampoCartao />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("junta mensagens repetidas de errors numa só e lista as diferentes", () => {
    const { rerender } = render(
      <Field invalid>
        <FieldLabel>CVV</FieldLabel>
        <Input />
        <FieldError errors={[{ message: "Obrigatório." }, { message: "Obrigatório." }]} />
      </Field>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/^Obrigatório\.$/);

    rerender(
      <Field invalid>
        <FieldLabel>CVV</FieldLabel>
        <Input />
        <FieldError errors={[{ message: "Obrigatório." }, { message: "Só números." }]} />
      </Field>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("clicar no rótulo foca o controle", async () => {
    const user = userEvent.setup();
    render(<CampoCartao />);

    await user.click(screen.getByText("Número do cartão"));
    expect(screen.getByRole("textbox", { name: "Número do cartão" })).toHaveFocus();
  });

  it("dá nome a checkbox e radio dentro do campo", () => {
    render(
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox />
          <FieldLabel>Salvar cartão para as próximas compras</FieldLabel>
        </Field>
        <FieldSet>
          <FieldLegend>Forma de pagamento</FieldLegend>
          <RadioGroup defaultValue="pix">
            <Field orientation="horizontal">
              <RadioGroupItem value="pix" />
              <FieldLabel>PIX</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="cartao" />
              <FieldLabel>Cartão de crédito</FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>,
    );

    expect(
      screen.getByRole("checkbox", { name: "Salvar cartão para as próximas compras" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "PIX" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Cartão de crédito" })).not.toBeChecked();
  });

  it("fora de um Field, como num FieldSet, a descrição e o erro renderizam sem quebrar", () => {
    render(
      <FieldSet>
        <FieldLegend>Endereço de cobrança</FieldLegend>
        <FieldDescription>Igual ao da fatura do cartão.</FieldDescription>
        <FieldError>Preencha o endereço.</FieldError>
      </FieldSet>,
    );

    expect(screen.getByText("Igual ao da fatura do cartão.")).toHaveAttribute(
      "data-slot",
      "field-description",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Preencha o endereço.");
  });

  it("o rótulo também funciona fora de um Field: solto com htmlFor ou envolvendo o Field", () => {
    render(
      <>
        <FieldLabel htmlFor="cupom">Cupom</FieldLabel>
        <Input id="cupom" />
        <FieldLabel htmlFor="salvar">
          <Field orientation="horizontal">
            <Checkbox id="salvar" />
            <FieldDescription>Salvar este cartão</FieldDescription>
          </Field>
        </FieldLabel>
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Cupom" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Salvar este cartão" })).toBeInTheDocument();
  });

  it("aplica orientação e className extra", () => {
    render(
      <Field orientation="horizontal" className="mt-4">
        <FieldLabel>Nome</FieldLabel>
        <Input />
      </Field>,
    );

    const field = document.querySelector('[data-slot="field"]');
    expect(field).toHaveAttribute("data-orientation", "horizontal");
    expect(field).toHaveClass("flex-row", "mt-4");
  });

  it("não tem violações de acessibilidade, com e sem erro", async () => {
    const { container, rerender } = render(<CampoCartao />);
    await expect(container).toHaveNoAxeViolations();

    rerender(<CampoCartao erro="Número inválido." />);
    await expect(container).toHaveNoAxeViolations();
  });
});
