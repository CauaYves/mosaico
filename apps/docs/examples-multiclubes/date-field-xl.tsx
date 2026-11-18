"use client";

import { DateField } from "@multiclubes/ui/components/date-field";
import { Field, FieldLabel } from "@multiclubes/ui/components/field";
import * as React from "react";

export default function DateFieldXl() {
  const [birthDate, setBirthDate] = React.useState("");

  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="birth-date-xl" className="text-2xl leading-tight font-semibold">
        Qual é a data de nascimento do titular?
      </FieldLabel>
      <DateField
        id="birth-date-xl"
        label="Data de nascimento do titular"
        size="xl"
        value={birthDate}
        onChange={setBirthDate}
        className="mt-2"
      />
    </Field>
  );
}
