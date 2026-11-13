import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { type CreditCardValue, EMPTY_CREDIT_CARD } from "../lib/credit-card";
import { CreditCardFields, type CreditCardFieldsProps } from "./credit-card-fields";

function Harness({
  initial = EMPTY_CREDIT_CARD,
  ...props
}: Partial<CreditCardFieldsProps> & { initial?: CreditCardValue }) {
  const [value, setValue] = React.useState(initial);
  return <CreditCardFields {...props} value={value} onValueChange={setValue} />;
}

const numero = () => screen.getByLabelText("Número do cartão");
const validade = () => screen.getByLabelText("Validade");
const cvv = () => screen.getByLabelText("CVV");
const nome = () => screen.getByLabelText("Nome impresso no cartão");

describe("CreditCardFields", () => {
  it("renderiza os quatro campos com nome, data-field e preenchimento automático de cartão", () => {
    const { container } = render(<Harness className="max-w-sm" />);

    const root = container.querySelector('[data-slot="credit-card-fields"]');
    expect(root).toHaveClass("max-w-sm");
    expect(numero()).toHaveAttribute("data-field", "number");
    expect(numero()).toHaveAttribute("autocomplete", "cc-number");
    expect(validade()).toHaveAttribute("autocomplete", "cc-exp");
    expect(cvv()).toHaveAttribute("autocomplete", "cc-csc");
    expect(nome()).toHaveAttribute("autocomplete", "cc-name");
  });

  it("aplica as máscaras enquanto a pessoa digita", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(numero(), "4242424242424242");
    await user.type(validade(), "1230");
    await user.type(nome(), "Maria s Oliveira");

    expect(numero()).toHaveValue("4242 4242 4242 4242");
    expect(validade()).toHaveValue("12 / 30");
    expect(nome()).toHaveValue("MARIA S OLIVEIRA");
  });

  it("mostra o nome da bandeira quando o número a revela, ou o desenho de renderBrand", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(<Harness />);
    const addon = () => container.querySelector('[data-slot="credit-card-brand"]');

    expect(addon()).not.toHaveTextContent("Visa");
    await user.type(numero(), "4242");
    expect(addon()).toHaveTextContent("Visa");
    unmount();

    render(<Harness renderBrand={(brand) => <img alt={`Bandeira ${brand}`} />} />);
    await user.type(numero(), "5555");
    expect(screen.getByAltText("Bandeira Mastercard")).toBeInTheDocument();
  });

  it("o CVV aceita 3 dígitos, 4 no Amex, e se ajusta quando a bandeira muda", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(cvv(), "12345");
    expect(cvv()).toHaveValue("123");
    expect(cvv()).toHaveAttribute("placeholder", "3 dígitos");

    await user.type(numero(), "378282246310005");
    expect(cvv()).toHaveAttribute("placeholder", "4 dígitos");
    await user.clear(cvv());
    await user.type(cvv(), "12345");
    expect(cvv()).toHaveValue("1234");

    await user.clear(numero());
    await user.type(numero(), "4242");
    expect(cvv()).toHaveValue("123");
  });

  it("cada campo só mostra o erro depois de perder o foco", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.queryByText("Informe o número do cartão.")).not.toBeInTheDocument();

    await user.click(numero());
    await user.tab();

    expect(screen.getByText("Informe o número do cartão.")).toBeInTheDocument();
    expect(numero()).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Informe o nome impresso no cartão.")).not.toBeInTheDocument();
  });

  it("showErrors mostra o erro de todos os campos de uma vez", () => {
    render(<Harness showErrors />);

    expect(screen.getByText("Informe o número do cartão.")).toBeInTheDocument();
    expect(screen.getByText("Informe a validade, como 08 / 29.")).toBeInTheDocument();
    expect(screen.getByText("O CVV tem 3 dígitos.")).toBeInTheDocument();
    expect(screen.getByText("Informe o nome impresso no cartão.")).toBeInTheDocument();
  });

  it("desabilitado, nenhum campo aceita digitação", () => {
    render(<Harness disabled />);

    for (const campo of [numero(), validade(), cvv(), nome()]) expect(campo).toBeDisabled();
  });
});
