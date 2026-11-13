// Regras de cartão de crédito do CreditCardFields: a bandeira pelos primeiros dígitos, as máscaras
// de cada campo e a validação. O número completo é dado sensível: valide e envie ao provedor de
// pagamento, que devolve um token; não o guarde nem o registre em log.

export type CreditCardBrand = "Amex" | "Diners" | "Elo" | "Hipercard" | "Mastercard" | "Visa";

export type CreditCardValue = {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
};

export type CreditCardField = keyof CreditCardValue;

/** Os campos na ordem da tela: a ordem em que o primeiro erro deve receber o foco. */
export const CREDIT_CARD_FIELDS: CreditCardField[] = ["number", "expiry", "cvc", "name"];

export const EMPTY_CREDIT_CARD: CreditCardValue = { number: "", expiry: "", cvc: "", name: "" };

const digits = (value: string) => value.replace(/\D/g, "");

// A ordem importa: os prefixos do Hipercard e do Elo cabem dentro dos de Diners, Visa e Mastercard.
const BRANDS: [CreditCardBrand, RegExp][] = [
  ["Amex", /^3[47]/],
  ["Hipercard", /^(606282|3841)/],
  ["Diners", /^(36|38|30[0-5])/],
  ["Elo", /^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/],
  ["Visa", /^4/],
  ["Mastercard", /^(5[1-5]|2[2-7])/],
];

/** A bandeira que os primeiros dígitos revelam, ou `undefined` enquanto não dá para saber. */
export function creditCardBrand(number: string): CreditCardBrand | undefined {
  const d = digits(number);
  return BRANDS.find(([, prefix]) => prefix.test(d))?.[0];
}

/** Tamanho do código de segurança: quatro dígitos no Amex, três nas outras bandeiras. */
export function cvcLength(number: string) {
  return creditCardBrand(number) === "Amex" ? 4 : 3;
}

export function maskCardNumber(value: string) {
  const d = digits(value);
  const brand = creditCardBrand(d);
  // Amex (15 dígitos) e Diners (14) agrupam em 4, 6 e o resto; as outras, de 4 em 4.
  if (brand === "Amex" || brand === "Diners") {
    return d
      .slice(0, brand === "Amex" ? 15 : 14)
      .replace(/^(\d{4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  }
  return d.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function maskCardExpiry(value: string) {
  // O preenchimento automático e a colagem podem trazer o ano com quatro dígitos (12/2045 ou 122045).
  const full =
    value.match(/^\s*(\d{1,2})\s*\/\s*(\d{4})\s*$/) ?? digits(value).match(/^(\d{2})(20\d{2})$/);
  if (full) return `${(full[1] as string).padStart(2, "0")} / ${(full[2] as string).slice(2)}`;

  const d = digits(value).slice(0, 4);
  if (d.length === 1 && Number(d) > 1) return `0${d}`;
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

/** A máscara de um campo. O código de segurança depende da bandeira, por isso recebe o número. */
export function maskCreditCardField(field: CreditCardField, value: string, number: string) {
  switch (field) {
    case "number":
      return maskCardNumber(value);
    case "expiry":
      return maskCardExpiry(value);
    case "cvc":
      return digits(value).slice(0, cvcLength(number));
    case "name":
      return value.toUpperCase();
  }
}

/** Dígito verificador de Luhn, com o tamanho mínimo de um número de cartão. */
export function isCardNumberValid(number: string) {
  const d = digits(number);
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return d.length >= 13 && sum % 10 === 0;
}

/** O erro de um campo, ou `undefined` quando ele está certo. `now` existe para o teste. */
export function validateCreditCardField(
  field: CreditCardField,
  value: CreditCardValue,
  now = new Date(),
): string | undefined {
  switch (field) {
    case "number":
      if (!digits(value.number)) return "Informe o número do cartão.";
      return isCardNumberValid(value.number) ? undefined : "Confira o número do cartão.";
    case "expiry": {
      const d = digits(value.expiry);
      if (d.length < 4) return "Informe a validade, como 08 / 29.";
      const month = Number(d.slice(0, 2));
      const year = 2000 + Number(d.slice(2));
      if (month < 1 || month > 12) return "O mês da validade vai de 01 a 12.";
      const expired =
        year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
      return expired ? "Este cartão está vencido." : undefined;
    }
    case "cvc": {
      const size = cvcLength(value.number);
      return digits(value.cvc).length === size ? undefined : `O CVV tem ${size} dígitos.`;
    }
    case "name":
      return value.name.trim().length >= 3 ? undefined : "Informe o nome impresso no cartão.";
  }
}

/** Os erros de todos os campos. Um objeto vazio quer dizer que o cartão pode ser enviado. */
export function validateCreditCard(value: CreditCardValue, now = new Date()) {
  const errors: Partial<Record<CreditCardField, string>> = {};
  for (const field of CREDIT_CARD_FIELDS) {
    const error = validateCreditCardField(field, value, now);
    if (error) errors[field] = error;
  }
  return errors;
}
