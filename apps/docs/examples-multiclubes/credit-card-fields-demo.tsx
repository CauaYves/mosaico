"use client";

import { Button } from "@multiclubes/ui/components/button";
import { CreditCardFields } from "@multiclubes/ui/components/credit-card-fields";
import { toast } from "@multiclubes/ui/components/toast";
import {
  CREDIT_CARD_FIELDS,
  EMPTY_CREDIT_CARD,
  validateCreditCard,
} from "@multiclubes/ui/lib/credit-card";
import * as React from "react";

export default function CreditCardFieldsDemo() {
  const [card, setCard] = React.useState(EMPTY_CREDIT_CARD);
  const [showErrors, setShowErrors] = React.useState(false);
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
    toast.add({ type: "success", title: "Cartão válido" });
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid w-full max-w-sm gap-6">
      <CreditCardFields value={card} onValueChange={setCard} showErrors={showErrors} />
      <Button type="submit">Pagar R$ 349,00</Button>
    </form>
  );
}
