"use client";

import { Button } from "@multiclubes/ui/components/button";
import { Card } from "@multiclubes/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@multiclubes/ui/components/collapsible";
import { CreditCardFields } from "@multiclubes/ui/components/credit-card-fields";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@multiclubes/ui/components/item";
import { Separator } from "@multiclubes/ui/components/separator";
import { Spinner } from "@multiclubes/ui/components/spinner";
import { SuccessCheck } from "@multiclubes/ui/components/success-check";
import { Ticket, TicketBody, TicketStub } from "@multiclubes/ui/components/ticket";
import {
  CREDIT_CARD_FIELDS,
  EMPTY_CREDIT_CARD,
  validateCreditCard,
} from "@multiclubes/ui/lib/credit-card";
import { CaretDownIcon, LockSimpleIcon } from "@phosphor-icons/react";
import * as React from "react";

// Pagamento de uma cobrança com cartão. O canhoto mostra o que se paga e vira o comprovante
// quando o pagamento é confirmado; o demonstrativo fica recolhido, porque quem paga todo mês
// raramente confere a lista. O envio só valida os campos e simula a espera do banco.

const ITEMS = [
  { name: "Mensalidade", detail: "Maria S. Oliveira · ref. 11/2026", value: "R$ 349,00" },
  { name: "Manutenção de dependente", detail: "Pedro Oliveira · ref. 11/2026", value: "R$ 89,00" },
  { name: "Futsal 2x por semana", detail: "Pedro Oliveira · ref. 11/2026", value: "R$ 120,00" },
];

const TOTAL = "R$ 558,00";

export default function Checkout01() {
  const [card, setCard] = React.useState(EMPTY_CREDIT_CARD);
  const [showErrors, setShowErrors] = React.useState(false);
  const [status, setStatus] = React.useState<"open" | "paying" | "paid">("open");
  const formRef = React.useRef<HTMLFormElement>(null);
  const paid = status === "paid";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    const errors = validateCreditCard(card);
    const first = CREDIT_CARD_FIELDS.find((field) => errors[field]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`[data-field="${first}"]`)?.focus();
      return;
    }

    setStatus("paying");
    window.setTimeout(() => setStatus("paid"), 1200);
  };

  return (
    <div className="min-h-svh bg-muted/40">
      <div className="mx-auto grid w-full max-w-md gap-7 px-4 py-6 lg:max-w-5xl lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8 lg:py-12">
        <aside className="grid gap-6">
          <Ticket tone={paid ? "success" : "primary"}>
            {paid ? (
              <TicketBody className="grid gap-5">
                <SuccessCheck tone="inverse" label="Pago" />
                <div className="grid gap-1.5">
                  <h1 className="text-2xl leading-tight font-semibold tracking-tight">
                    Pagamento confirmado
                  </h1>
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="text-[15px] opacity-85">Cobrança de novembro</span>
                    <span className="text-xl font-semibold tracking-tight tabular-nums">
                      {TOTAL}
                    </span>
                  </p>
                </div>
              </TicketBody>
            ) : (
              <TicketBody className="grid gap-2 pt-8">
                <p className="text-[15px] opacity-85">Cobrança de novembro</p>
                <p className="font-heading text-5xl leading-none font-semibold tracking-tight tabular-nums">
                  <span className="mr-1.5 text-xl font-medium opacity-80">R$</span>
                  558,00
                </p>
              </TicketBody>
            )}
            <TicketStub className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
              {paid ? (
                <span className="opacity-85">O comprovante foi enviado para o seu e-mail.</span>
              ) : (
                <>
                  <span className="font-medium">Título 0123-4</span>
                  <span className="opacity-75">Vence em 10/11/2026</span>
                </>
              )}
            </TicketStub>
          </Ticket>

          <Card size="sm" className="gap-0 py-0 shadow-none">
            <Collapsible>
              <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-4 py-5 text-left outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.06]">
                <span className="text-[15px] font-semibold">Itens da cobrança</span>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  {ITEMS.length} itens
                  <CaretDownIcon
                    className="size-4 transition-transform duration-200 group-data-[panel-open]:rotate-180"
                    aria-hidden="true"
                  />
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none">
                <div className="grid gap-3 px-4 pb-6">
                  <ItemGroup className="gap-0">
                    {ITEMS.map((item) => (
                      <Item key={item.name} size="xs" className="px-0">
                        <ItemContent>
                          <ItemTitle className="text-[15px] font-medium">{item.name}</ItemTitle>
                          <ItemDescription>{item.detail}</ItemDescription>
                        </ItemContent>
                        <ItemActions className="self-start pt-0.5 text-[15px] tabular-nums">
                          {item.value}
                        </ItemActions>
                      </Item>
                    ))}
                  </ItemGroup>
                  <Separator />
                  <p className="flex items-baseline justify-between gap-6 text-[15px] font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{TOTAL}</span>
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </aside>

        <main className="grid gap-7">
          {paid ? (
            <div className="grid gap-5">
              <dl className="grid gap-3.5 rounded-field bg-card p-5 text-sm ring-1 ring-foreground/5">
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="text-muted-foreground">Pago com</dt>
                  <dd className="font-medium tabular-nums">Cartão •••• {card.number.slice(-4)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="text-muted-foreground">Valor</dt>
                  <dd className="font-medium tabular-nums">{TOTAL}</dd>
                </div>
              </dl>
              <Button
                size="lg"
                className="h-12 w-full"
                onClick={() => {
                  setCard(EMPTY_CREDIT_CARD);
                  setShowErrors(false);
                  setStatus("open");
                }}
              >
                Voltar ao início
              </Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate className="grid gap-6">
              <h1 className="text-2xl font-semibold tracking-tight">Cartão de crédito</h1>
              <CreditCardFields
                value={card}
                onValueChange={setCard}
                showErrors={showErrors}
                size="lg"
                disabled={status === "paying"}
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full tabular-nums"
                disabled={status === "paying"}
              >
                {status === "paying" && <Spinner data-icon="inline-start" />}
                {status === "paying" ? "Confirmando com o banco…" : `Pagar ${TOTAL}`}
              </Button>
            </form>
          )}
          <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground lg:justify-start">
            <LockSimpleIcon className="size-3.5" aria-hidden="true" />
            Pagamento seguro
          </p>
        </main>
      </div>
    </div>
  );
}
