"use client";

import { Button } from "@multiclubes/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@multiclubes/ui/components/field";
import { Input } from "@multiclubes/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@multiclubes/ui/components/input-group";
import { Spinner } from "@multiclubes/ui/components/spinner";
import { SuccessCheck } from "@multiclubes/ui/components/success-check";
import {
  CREDIT_CARD_FIELDS,
  type CreditCardBrand,
  type CreditCardField,
  type CreditCardValue,
  creditCardBrand,
  cvcLength,
  EMPTY_CREDIT_CARD,
  maskCreditCardField,
  validateCreditCard,
  validateCreditCardField,
} from "@multiclubes/ui/lib/credit-card";
import { CreditCardIcon } from "@phosphor-icons/react";
import * as React from "react";

// Cadastro de um cartão de crédito. As regras (bandeira, máscaras e validação) vêm de
// lib/credit-card, do kit; aqui fica a composição dos campos, que cada aplicação ajusta.
//
// A bandeira aparece no campo do número quando os primeiros dígitos a revelam, em vez de uma
// lista de bandeiras aceitas na tela. O CVV acompanha a bandeira: quatro dígitos no Amex, três
// nas outras. O número completo é dado sensível: envie-o ao provedor de pagamento, que devolve
// um token, e não ao seu servidor. O envio daqui só valida os campos e simula a espera.

// Campos de 48px: alvo de toque confortável em tela de pagamento no celular.
const control = "h-12 md:text-base";

/**
 * Os quatro campos de um cartão. Cada campo mostra o seu erro ao perder o foco; `showErrors`
 * mostra todos, depois de uma tentativa de envio. `data-field` leva o foco ao primeiro erro.
 */
export function CreditCardFields({
  value,
  onValueChange,
  showErrors = false,
  renderBrand,
  disabled,
}: {
  value: CreditCardValue;
  onValueChange: (value: CreditCardValue) => void;
  showErrors?: boolean;
  /** O desenho da bandeira reconhecida. Sem isso, aparece o nome dela. */
  renderBrand?: (brand: CreditCardBrand) => React.ReactNode;
  disabled?: boolean;
}) {
  const id = React.useId();
  const [touched, setTouched] = React.useState<Partial<Record<CreditCardField, boolean>>>({});

  const brand = creditCardBrand(value.number);
  const cvcSize = cvcLength(value.number);

  const error = (field: CreditCardField) =>
    showErrors || touched[field] ? validateCreditCardField(field, value) : undefined;

  const set = (field: CreditCardField, typed: string) => {
    const next = { ...value, [field]: maskCreditCardField(field, typed, value.number) };
    // Trocar o número pode trocar a bandeira: o código já digitado se ajusta ao tamanho dela.
    if (field === "number") next.cvc = maskCreditCardField("cvc", next.cvc, next.number);
    onValueChange(next);
  };

  const bind = (field: CreditCardField) => ({
    id: `${id}-${field}`,
    "data-field": field,
    value: value[field],
    disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => set(field, event.target.value),
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
  });

  return (
    <FieldGroup className="gap-5">
      <Field invalid={!!error("number")}>
        <FieldLabel htmlFor={`${id}-number`}>Número do cartão</FieldLabel>
        <InputGroup className="h-12">
          <InputGroupInput
            {...bind("number")}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            className="tabular-nums md:text-base"
          />
          <InputGroupAddon align="inline-end">
            {brand ? (
              (renderBrand?.(brand) ?? (
                <span className="text-xs font-semibold text-foreground/70">{brand}</span>
              ))
            ) : (
              <CreditCardIcon className="size-5 text-muted-foreground" aria-hidden="true" />
            )}
          </InputGroupAddon>
        </InputGroup>
        <FieldError>{error("number")}</FieldError>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field invalid={!!error("expiry")}>
          <FieldLabel htmlFor={`${id}-expiry`}>Validade</FieldLabel>
          <Input
            {...bind("expiry")}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / AA"
            className={control}
          />
          <FieldError>{error("expiry")}</FieldError>
        </Field>
        <Field invalid={!!error("cvc")}>
          <FieldLabel htmlFor={`${id}-cvc`}>CVV</FieldLabel>
          <Input
            {...bind("cvc")}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={`${cvcSize} dígitos`}
            maxLength={cvcSize}
            className={control}
          />
          <FieldError>{error("cvc")}</FieldError>
        </Field>
      </div>

      <Field invalid={!!error("name")}>
        <FieldLabel htmlFor={`${id}-name`}>Nome impresso no cartão</FieldLabel>
        <Input
          {...bind("name")}
          autoComplete="cc-name"
          placeholder="Como está no cartão"
          className={`${control} uppercase placeholder:normal-case`}
        />
        <FieldError>{error("name")}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export default function CreditCard01() {
  const [card, setCard] = React.useState(EMPTY_CREDIT_CARD);
  const [showErrors, setShowErrors] = React.useState(false);
  const [status, setStatus] = React.useState<"open" | "saving" | "saved">("open");
  const formRef = React.useRef<HTMLFormElement>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    const errors = validateCreditCard(card);
    const first = CREDIT_CARD_FIELDS.find((field) => errors[field]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`[data-field="${first}"]`)?.focus();
      return;
    }

    setStatus("saving");
    window.setTimeout(() => setStatus("saved"), 1200);
  };

  const reset = () => {
    setCard(EMPTY_CREDIT_CARD);
    setShowErrors(false);
    setStatus("open");
  };

  return (
    <div className="grid min-h-svh place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-surface bg-card p-6 shadow-md ring-1 ring-foreground/5 sm:p-8">
        {status === "saved" ? (
          <div className="grid justify-items-center gap-6 py-4 text-center">
            <SuccessCheck label="Cartão salvo" className="size-16" />
            <div className="grid gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Cartão salvo</h1>
              <p className="text-[15px] text-pretty text-muted-foreground">
                As próximas mensalidades serão cobradas no{" "}
                {creditCardBrand(card.number) ?? "cartão"} •••• {card.number.slice(-4)}.
              </p>
            </div>
            <Button variant="outline" className="h-12 w-full" onClick={reset}>
              Cadastrar outro cartão
            </Button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={submit} noValidate className="grid gap-6">
            <div className="grid gap-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Novo cartão</h1>
              <p className="text-[15px] text-pretty text-muted-foreground">
                Nada é cobrado hoje. A mensalidade passa a ser cobrada neste cartão todo dia 10.
              </p>
            </div>
            <CreditCardFields
              value={card}
              onValueChange={setCard}
              showErrors={showErrors}
              disabled={status === "saving"}
            />
            <Button type="submit" className="h-12 w-full" disabled={status === "saving"}>
              {status === "saving" && <Spinner data-icon="inline-start" />}
              {status === "saving" ? "Salvando…" : "Salvar cartão"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
