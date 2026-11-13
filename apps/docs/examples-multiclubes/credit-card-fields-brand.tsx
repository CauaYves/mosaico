"use client";

import { Badge } from "@multiclubes/ui/components/badge";
import { CreditCardFields } from "@multiclubes/ui/components/credit-card-fields";
import type { CreditCardValue } from "@multiclubes/ui/lib/credit-card";
import * as React from "react";

const FILLED: CreditCardValue = {
  number: "3782 822463 10005",
  expiry: "12 / 30",
  cvc: "",
  name: "MARIA S OLIVEIRA",
};

export default function CreditCardFieldsBrand() {
  const [card, setCard] = React.useState(FILLED);

  return (
    <CreditCardFields
      value={card}
      onValueChange={setCard}
      size="lg"
      renderBrand={(brand) => <Badge variant="outline">{brand}</Badge>}
      className="w-full max-w-sm"
    />
  );
}
