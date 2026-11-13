"use client";

import { CreditCardIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import * as React from "react";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/mosaico/components/mosaico/field";
import { Input } from "@/registry/mosaico/components/mosaico/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/mosaico/components/mosaico/input-group";
import {
  type CreditCardBrand,
  type CreditCardField,
  type CreditCardValue,
  creditCardBrand,
  cvcLength,
  maskCreditCardField,
  validateCreditCardField,
} from "@/registry/mosaico/lib/mosaico/credit-card";

type CreditCardFieldsProps = Omit<
  React.ComponentProps<typeof FieldGroup>,
  "children" | "onChange"
> & {
  /** Os quatro campos, já com a máscara. Comece com `EMPTY_CREDIT_CARD`. */
  value: CreditCardValue;
  onValueChange: (value: CreditCardValue) => void;
  /**
   * Mostra o erro de todos os campos, como depois de uma tentativa de envio. Sem isso, cada
   * campo só mostra o seu depois de perder o foco.
   */
  showErrors?: boolean;
  /** O desenho da bandeira reconhecida. Sem isso, aparece o nome dela. */
  renderBrand?: (brand: CreditCardBrand) => React.ReactNode;
  /** `lg` deixa os campos com 48px de altura, para telas de pagamento no celular. */
  size?: "default" | "lg";
  disabled?: boolean;
};

/**
 * Os campos de um cartão de crédito: número, validade, CVV e nome impresso.
 *
 * A bandeira aparece no campo do número quando os primeiros dígitos a revelam, em vez de uma
 * lista de bandeiras aceitas na tela. O CVV acompanha a bandeira: quatro dígitos no Amex, três
 * nas outras. Cada campo traz `data-field` com o seu nome, para o formulário levar o foco ao
 * primeiro erro. O número completo é dado sensível: envie-o ao provedor de pagamento, não ao
 * seu servidor.
 */
function CreditCardFields({
  value,
  onValueChange,
  showErrors = false,
  renderBrand,
  size = "default",
  disabled,
  className,
  ...props
}: CreditCardFieldsProps) {
  const id = React.useId();
  const [touched, setTouched] = React.useState<Partial<Record<CreditCardField, boolean>>>({});

  const brand = creditCardBrand(value.number);
  const cvcSize = cvcLength(value.number);
  const large = size === "lg";

  const error = (field: CreditCardField) =>
    showErrors || touched[field] ? validateCreditCardField(field, value) : undefined;

  const set = (field: CreditCardField, typed: string) => {
    const next = { ...value, [field]: maskCreditCardField(field, typed, value.number) };
    // Trocar o número pode trocar a bandeira: o código já digitado se ajusta ao tamanho dela.
    if (field === "number") next.cvc = maskCreditCardField("cvc", next.cvc, next.number);
    onValueChange(next);
  };

  const control = (field: CreditCardField) => ({
    id: `${id}-${field}`,
    "data-field": field,
    value: value[field],
    disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => set(field, event.target.value),
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
  });

  return (
    <FieldGroup data-slot="credit-card-fields" className={cn("gap-5", className)} {...props}>
      <Field invalid={!!error("number")}>
        <FieldLabel htmlFor={`${id}-number`}>Número do cartão</FieldLabel>
        <InputGroup className={cn(large && "h-12")}>
          <InputGroupInput
            {...control("number")}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            className={cn("tabular-nums", large && "md:text-base")}
          />
          <InputGroupAddon align="inline-end" data-slot="credit-card-brand">
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
            {...control("expiry")}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / AA"
            className={cn(large && "h-12 md:text-base")}
          />
          <FieldError>{error("expiry")}</FieldError>
        </Field>
        <Field invalid={!!error("cvc")}>
          <FieldLabel htmlFor={`${id}-cvc`}>CVV</FieldLabel>
          <Input
            {...control("cvc")}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={`${cvcSize} dígitos`}
            maxLength={cvcSize}
            className={cn(large && "h-12 md:text-base")}
          />
          <FieldError>{error("cvc")}</FieldError>
        </Field>
      </div>

      <Field invalid={!!error("name")}>
        <FieldLabel htmlFor={`${id}-name`}>Nome impresso no cartão</FieldLabel>
        <Input
          {...control("name")}
          autoComplete="cc-name"
          placeholder="Como está no cartão"
          className={cn("uppercase placeholder:normal-case", large && "h-12 md:text-base")}
        />
        <FieldError>{error("name")}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export { CreditCardFields, type CreditCardFieldsProps };
