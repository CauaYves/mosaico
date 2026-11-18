"use client";

import { Button } from "@multiclubes/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@multiclubes/ui/components/field";
import { Input } from "@multiclubes/ui/components/input";

/** Uma pergunta por tela, no celular: campo e botões no tamanho xl, na mesma altura. */
export default function InputXl() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-8"
      onSubmit={(event) => event.preventDefault()}
    >
      <Field>
        <FieldLabel htmlFor="input-xl-titulo" className="text-2xl leading-tight font-semibold">
          Qual é o número do título?
        </FieldLabel>
        <FieldDescription>Está na carteirinha do clube.</FieldDescription>
        <Input id="input-xl-titulo" size="xl" autoComplete="off" className="mt-2" />
      </Field>
      <div className="flex flex-col gap-2">
        <Button type="submit" size="xl">
          Continuar
        </Button>
        <Button type="button" size="xl" variant="ghost">
          Voltar
        </Button>
      </div>
    </form>
  );
}
