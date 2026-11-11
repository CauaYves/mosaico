"use client";

import { Button } from "@multiclubes/ui/components/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@multiclubes/ui/components/field";
import { ResponsiveSelect } from "@multiclubes/ui/components/responsive-select";
import * as React from "react";

const PLANOS = [
  { label: "Individual", value: "individual" },
  { label: "Família", value: "familia" },
  { label: "Corporativo", value: "corporativo", disabled: true },
];

export default function ResponsiveSelectField() {
  const [plano, setPlano] = React.useState<string | null>(null);
  const [enviado, setEnviado] = React.useState(false);
  const erro = enviado && plano === null ? "Escolha um plano para continuar." : undefined;

  return (
    <form
      className="flex w-full max-w-xs flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setEnviado(true);
      }}
    >
      <Field invalid={Boolean(erro)}>
        <FieldLabel>Plano</FieldLabel>
        <ResponsiveSelect
          items={PLANOS}
          value={plano}
          onValueChange={setPlano}
          placeholder="Escolha um plano"
        />
        <FieldDescription>O plano Corporativo é contratado pelo comercial.</FieldDescription>
        <FieldError>{erro}</FieldError>
      </Field>
      <Button type="submit">Continuar</Button>
    </form>
  );
}
