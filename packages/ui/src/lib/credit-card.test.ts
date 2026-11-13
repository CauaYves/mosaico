import {
  type CreditCardValue,
  creditCardBrand,
  cvcLength,
  isCardNumberValid,
  maskCardExpiry,
  maskCardNumber,
  maskCreditCardField,
  validateCreditCard,
  validateCreditCardField,
} from "./credit-card";

const NOW = new Date(2026, 10, 12);

const card = (over: Partial<CreditCardValue> = {}): CreditCardValue => ({
  number: "4242 4242 4242 4242",
  expiry: "12 / 30",
  cvc: "123",
  name: "MARIA S OLIVEIRA",
  ...over,
});

describe("creditCardBrand", () => {
  it.each([
    ["4242 4242 4242 4242", "Visa"],
    ["5555 5555 5555 4444", "Mastercard"],
    ["2223 0000 4841 0010", "Mastercard"],
    ["3782 822463 10005", "Amex"],
    ["6362 9700 0045 7013", "Elo"],
    ["4011 7800 0000 0000", "Elo"],
    ["6062 8200 0000 0000", "Hipercard"],
    ["3841 0000 0000 0000", "Hipercard"],
    ["3600 666633 3344", "Diners"],
  ])("%s é %s", (number, brand) => {
    expect(creditCardBrand(number)).toBe(brand);
  });

  it("sem dígitos, ou com um prefixo desconhecido, não arrisca uma bandeira", () => {
    expect(creditCardBrand("")).toBeUndefined();
    expect(creditCardBrand("9999")).toBeUndefined();
  });
});

describe("máscaras", () => {
  it("o número agrupa de 4 em 4, e em 4, 6 e o resto no Amex e no Diners", () => {
    expect(maskCardNumber("42424242424242429999")).toBe("4242 4242 4242 4242");
    expect(maskCardNumber("3782822463100059")).toBe("3782 822463 10005");
    expect(maskCardNumber("360066663333449")).toBe("3600 666633 3344");
  });

  it("a validade aceita o que se digita e o que o navegador cola", () => {
    expect(maskCardExpiry("1")).toBe("1");
    expect(maskCardExpiry("5")).toBe("05");
    expect(maskCardExpiry("1230")).toBe("12 / 30");
    expect(maskCardExpiry("12/2045")).toBe("12 / 45");
    expect(maskCardExpiry("122045")).toBe("12 / 45");
  });

  it("o CVV tem 4 dígitos no Amex e 3 nas outras bandeiras, e sem número", () => {
    expect(cvcLength("3782")).toBe(4);
    expect(cvcLength("4242")).toBe(3);
    expect(cvcLength("")).toBe(3);
    expect(maskCreditCardField("cvc", "12345", "3782 822463 10005")).toBe("1234");
    expect(maskCreditCardField("cvc", "12345", "4242 4242 4242 4242")).toBe("123");
  });

  it("o nome vai para maiúsculas", () => {
    expect(maskCreditCardField("name", "Maria s Oliveira", "")).toBe("MARIA S OLIVEIRA");
  });
});

describe("validação", () => {
  it("confere o número pelo dígito verificador", () => {
    expect(isCardNumberValid("4242 4242 4242 4242")).toBe(true);
    expect(isCardNumberValid("4242 4242 4242 4241")).toBe(false);
    expect(isCardNumberValid("4242")).toBe(false);
  });

  it("um cartão certo não tem erro", () => {
    expect(validateCreditCard(card(), NOW)).toEqual({});
  });

  it("diz o que falta em cada campo", () => {
    expect(validateCreditCard({ number: "", expiry: "", cvc: "", name: "" }, NOW)).toEqual({
      number: "Informe o número do cartão.",
      expiry: "Informe a validade, como 08 / 29.",
      cvc: "O CVV tem 3 dígitos.",
      name: "Informe o nome impresso no cartão.",
    });
  });

  it("recusa mês inexistente e cartão vencido, e aceita o mês corrente", () => {
    expect(validateCreditCardField("expiry", card({ expiry: "13 / 30" }), NOW)).toBe(
      "O mês da validade vai de 01 a 12.",
    );
    expect(validateCreditCardField("expiry", card({ expiry: "10 / 26" }), NOW)).toBe(
      "Este cartão está vencido.",
    );
    expect(validateCreditCardField("expiry", card({ expiry: "11 / 26" }), NOW)).toBeUndefined();
  });

  it("o tamanho pedido para o CVV acompanha a bandeira", () => {
    const amex = card({ number: "3782 822463 10005", cvc: "123" });
    expect(validateCreditCardField("cvc", amex, NOW)).toBe("O CVV tem 4 dígitos.");
  });
});
